import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/activityLog';

export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(`
      SELECT a.*, k.nama as kategori_nama 
      FROM alat a 
      LEFT JOIN kategori k ON a.kategori_id = k.id 
      ORDER BY a.id
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching alat:', error);
    return NextResponse.json(
      { error: 'Error fetching alat' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nama, deskripsi, kategori_id, jumlah, status, foto } = await request.json();

    const result = await pool.query(
      `INSERT INTO alat (nama, deskripsi, kategori_id, jumlah, jumlah_tersedia, status, foto) 
       VALUES ($1, $2, $3, $4, $4, $5, $6) 
       RETURNING *`,
      [nama, deskripsi || null, kategori_id || null, jumlah, status || 'tersedia', foto || null]
    );

    const alat = result.rows[0];
    const userId = request.headers.get('authorization')?.replace('Bearer ', '') || null;

    await logActivity(
      userId ? parseInt(userId) : null,
      'CREATE',
      'alat',
      alat.id,
      { nama, jumlah }
    );

    return NextResponse.json(alat, { status: 201 });
  } catch (error) {
    console.error('Error creating alat:', error);
    return NextResponse.json(
      { error: 'Error creating alat' },
      { status: 500 }
    );
  }
}