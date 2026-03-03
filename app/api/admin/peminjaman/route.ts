import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/activityLog';

export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(`
      SELECT p.*, u.nama as user_nama, u.email as user_email, u.username as user_username, a.nama as alat_nama, a.foto as alat_foto, a.deskripsi as alat_deskripsi, a.jumlah_tersedia 
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
    const { user_id, alat_id, jumlah, tanggal_pinjam, tanggal_kembali, status, alasan, kode_peminjaman } = await request.json();
    const kode = kode_peminjaman || `PMJ-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const result = await pool.query(
      `INSERT INTO peminjaman (user_id, alat_id, jumlah, tanggal_pinjam, tanggal_kembali, status, alasan, created_at, updated_at, kode_peminjaman) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [user_id, alat_id, jumlah, tanggal_pinjam, tanggal_kembali || null, status || 'pending', alasan || null, new Date(), new Date(), kode]
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