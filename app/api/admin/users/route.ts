import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';

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
    const { username, password, nama, email, role } = await request.json();
    const hashedPassword = await hashPassword(password);

    const result = await pool.query(
      'INSERT INTO users (username, password, nama, email, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, nama, email, role',
      [username, hashedPassword, nama, email, role]
    );

    const user = result.rows[0];
    const userId = request.headers.get('authorization')?.replace('Bearer ', '') || null;

    await logActivity(
      userId ? parseInt(userId) : null,
      'CREATE',
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