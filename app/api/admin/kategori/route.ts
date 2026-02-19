import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/activityLog';

export async function GET(request: NextRequest) {
  try {
    const result = await pool.query('SELECT * FROM kategori ORDER BY id');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching kategori:', error);
    return NextResponse.json(
      { error: 'Error fetching kategori' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nama, deskripsi } = await request.json();

    const result = await pool.query(
      'INSERT INTO kategori (nama, deskripsi) VALUES ($1, $2) RETURNING *',
      [nama, deskripsi || null]
    );

    const kategori = result.rows[0];
    const userId = request.headers.get('authorization')?.replace('Bearer ', '') || null;

    await logActivity(
      userId ? parseInt(userId) : null,
      'CREATE',
      'kategori',
      kategori.id,
      { nama }
    );

    return NextResponse.json(kategori, { status: 201 });
  } catch (error) {
    console.error('Error creating kategori:', error);
    return NextResponse.json(
      { error: 'Error creating kategori' },
      { status: 500 }
    );
  }
}