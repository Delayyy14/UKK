import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/activityLog';

export async function GET(request: NextRequest) {
  try {
    // Temporary migration
    await pool.query(`
      ALTER TABLE alat ADD COLUMN IF NOT EXISTS harga_per_hari DECIMAL(10, 2) DEFAULT 0;
      ALTER TABLE peminjaman ADD COLUMN IF NOT EXISTS total_harga DECIMAL(12, 2) DEFAULT 0;
    `);

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
    const { nama, deskripsi, kategori_id, jumlah, status, foto, harga_per_hari } = await request.json();

    const result = await pool.query(
      `INSERT INTO alat (nama, deskripsi, kategori_id, jumlah, jumlah_tersedia, status, foto, harga_per_hari) 
       VALUES ($1, $2, $3, $4, $4, $5, $6, $7) 
       RETURNING *`,
      [nama, deskripsi || null, kategori_id || null, jumlah, status || 'tersedia', foto || null, harga_per_hari || 0]
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
  } catch (error: any) {
    console.error('Error creating alat:', error);
    return NextResponse.json(
      { error: `Error creating alat: ${error.message}` },
      { status: 500 }
    );
  }
}