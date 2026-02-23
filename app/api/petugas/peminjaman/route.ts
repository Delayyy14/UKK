import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(`
      SELECT p.*, u.nama as user_nama, u.email as user_email, u.username as user_username, a.nama as alat_nama, a.foto as alat_foto, a.deskripsi as alat_deskripsi, a.jumlah_tersedia
      FROM peminjaman p 
      LEFT JOIN users u ON p.user_id = u.id 
      LEFT JOIN alat a ON p.alat_id = a.id 
      ORDER BY p.id DESC
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