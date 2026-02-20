import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/activityLog';

export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(`
      SELECT p.*, u.nama as user_nama, a.nama as alat_nama, a.foto as alat_foto, a.jumlah_tersedia 
      FROM peminjaman p 
      LEFT JOIN users u ON p.user_id = u.id 
      LEFT JOIN alat a ON p.alat_id = a.id 
      ORDER BY 
        CASE WHEN p.status = 'pending' THEN 1 ELSE 2 END ASC,
        p.created_at ASC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching peminjaman:', error);
    return NextResponse.json(
      { error: 'Error fetching peminjaman' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, alat_id, jumlah, tanggal_pinjam, tanggal_kembali, status, alasan } = await request.json();
    const result = await pool.query(
      `INSERT INTO peminjaman (user_id, alat_id, jumlah, tanggal_pinjam, tanggal_kembali, status, alasan, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [user_id, alat_id, jumlah, tanggal_pinjam, tanggal_kembali || null, status || 'pending', alasan || null, new Date(), new Date()]
    );

    const peminjaman = result.rows[0];
    const userId = request.headers.get('authorization')?.replace('Bearer ', '') || null;

    await logActivity(
      userId ? parseInt(userId) : null,
      'CREATE',
      'peminjaman',
      peminjaman.id,
      { user_id, alat_id, jumlah }
    );

    return NextResponse.json(peminjaman, { status: 201 });
  } catch (error) {
    console.error('Error creating peminjaman:', error);
    return NextResponse.json(
      { error: 'Error creating peminjaman' },
      { status: 500 }
    );
  }
}