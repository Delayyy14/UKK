import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { username, password, nama, email, role } = await request.json();

    let query = 'UPDATE users SET username = $1, nama = $2, email = $3, role = $4, updated_at = CURRENT_TIMESTAMP';
    const values: any[] = [username, nama, email, role];

    if (password) {
      const hashedPassword = await hashPassword(password);
      query += ', password = $5 WHERE id = $6 RETURNING id, username, nama, email, role';
      values.push(hashedPassword, id);
    } else {
      query += ' WHERE id = $5 RETURNING id, username, nama, email, role';
      values.push(id);
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = request.headers.get('authorization')?.replace('Bearer ', '') || null;
    await logActivity(
      userId ? parseInt(userId) : null,
      'UPDATE',
      'users',
      id,
      { username, role }
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Username sudah digunakan' },
        { status: 400 }
      );
    }
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Error updating user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const targetUserId = parseInt(params.id);

    // Ambil user login dari Authorization header
    const loggedInUserId = request.headers
      .get('authorization')
      ?.replace('Bearer ', '');

    if (!loggedInUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ❌ CEGAH USER HAPUS DIRI SENDIRI
    if (parseInt(loggedInUserId) === targetUserId) {
      return NextResponse.json(
        { error: 'Tidak boleh menghapus akun sendiri' },
        { status: 403 }
      );
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [targetUserId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await logActivity(
      parseInt(loggedInUserId),
      'DELETE',
      'users',
      targetUserId,
      {}
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Error deleting user' },
      { status: 500 }
    );
  }
}
