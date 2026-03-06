import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword, isValidPassword, isValidEmail } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';
import { sanitizeText } from '@/lib/sanitize';

export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(
      'SELECT id, username, nama, email, role, created_at FROM users ORDER BY id'
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Error fetching users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    let { username, password, nama, email, role } = await request.json();

    // Sanitize inputs
    username = sanitizeText(username);
    nama = sanitizeText(nama);
    email = sanitizeText(email);

    const authenticatedUserId = request.headers.get('x-user-id');

    // Validation
    if (!username || !password || !nama || !email || !role) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 });
    }

    if (!isValidPassword(password)) {
      return NextResponse.json({
        error: 'Password tidak aman: minimal 8 karakter, harus mengandung huruf, angka, dan karakter spesial.'
      }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const result = await pool.query(
      'INSERT INTO users (username, password, nama, email, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, nama, email, role',
      [username, hashedPassword, nama, email, role]
    );

    const user = result.rows[0];

    await logActivity(
      authenticatedUserId ? parseInt(authenticatedUserId) : null,
      role === 'admin' ? 'CREATE_ADMIN' : 'CREATE_USER',
      'users',
      user.id,
      { username, role }
    );

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Username sudah digunakan' },
        { status: 400 }
      );
    }
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Error creating user' },
      { status: 500 }
    );
  }
}