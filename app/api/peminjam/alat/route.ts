import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

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
      WHERE a.status = 'tersedia'
      ORDER BY a.nama
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