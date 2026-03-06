import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';

export async function GET(request: NextRequest) {
  try {
    const userIdHeader = request.headers.get('x-user-id');

    if (!userIdHeader) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const userId = parseInt(userIdHeader);

    const result = await pool.query(
      'SELECT id, username, nama, email, foto, role FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Error fetching profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userIdHeader = request.headers.get('x-user-id');

    if (!userIdHeader) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const userId = parseInt(userIdHeader);


    const { nama, email, password, foto } = await request.json();

    let query = 'UPDATE users SET nama = $1, email = $2, updated_at = CURRENT_TIMESTAMP';
    const values: any[] = [nama, email || null];
    let paramIndex = 3;

    // Add foto if provided
    if (foto !== undefined) {
      query += `, foto = $${paramIndex}`;
      values.push(foto || null);
      paramIndex++;
    }

    // Add password if provided
    if (password) {
      const hashedPassword = await hashPassword(password);
      query += `, password = $${paramIndex}`;
      values.push(hashedPassword);
      paramIndex++;
    }

    query += ` WHERE id = $${paramIndex} RETURNING id, username, nama, email, foto, role`;
    values.push(userId);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updatedUser = result.rows[0];

    // Log activity
    await logActivity(
      userId,
      'UPDATE',
      'users',
      userId,
      { nama, email }
    );


    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Error updating profile' },
      { status: 500 }
    );
  }
}