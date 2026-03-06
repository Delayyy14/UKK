import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword, isValidPassword } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';
import { sanitizeText } from '@/lib/sanitize';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    let { username, password, nama, email, role } = await request.json();

    // Sanitize inputs
    username = sanitizeText(username);
    nama = sanitizeText(nama);
    email = sanitizeText(email);

    let query = 'UPDATE users SET username = $1, nama = $2, email = $3, role = $4, updated_at = CURRENT_TIMESTAMP';
    const values: any[] = [username, nama, email, role];

    if (password) {
      if (!isValidPassword(password)) {
        return NextResponse.json({
          error: 'Password tidak aman: minimal 8 karakter, harus mengandung huruf, angka, dan karakter spesial.'
        }, { status: 400 });
      }
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

    const userId = request.headers.get('x-user-id');
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

    // Ambil user login dari middleware
    const loggedInUserId = request.headers.get('x-user-id');

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
