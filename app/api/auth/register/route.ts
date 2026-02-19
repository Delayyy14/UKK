import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';

export async function POST(request: NextRequest) {
  try {
    const { username, password, nama, email, role } = await request.json();

    // Validasi
    if (!username || !password || !nama) {
      return NextResponse.json(
        { error: 'Username, password, dan nama wajib diisi' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Hanya bisa register sebagai peminjam
    const userRole = role === 'peminjam' ? 'peminjam' : 'peminjam';

    // Check if username already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Username sudah digunakan' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (username, password, nama, email, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, nama, email, role',
      [username, hashedPassword, nama, email || null, userRole]
    );

    const user = result.rows[0];

    // Log activity
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    await logActivity(
      user.id,
      'REGISTER',
      'users',
      user.id,
      { username, role: userRole },
      ipAddress
    );

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil',
      user: {
        id: user.id,
        username: user.username,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Register error:', error);
    
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Username sudah digunakan' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    );
  }
}