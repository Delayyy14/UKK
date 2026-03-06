import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
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


    const result = await pool.query(`
      SELECT p.*, a.nama as alat_nama 
      FROM peminjaman p 
      LEFT JOIN alat a ON p.alat_id = a.id 
      WHERE p.user_id = $1
      ORDER BY p.id DESC
    `, [userId]);
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
    const { alat_id, jumlah, tanggal_pinjam, tanggal_kembali, alasan, total_harga } = await request.json();
    const userIdHeader = request.headers.get('x-user-id');

    if (!userIdHeader) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const userId = parseInt(userIdHeader);

    // Validate required fields
    if (!alat_id || !jumlah || !tanggal_pinjam || !tanggal_kembali) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    // Check alat availability
    const alatResult = await pool.query('SELECT jumlah_tersedia, status FROM alat WHERE id = $1', [alat_id]);
    if (alatResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Alat tidak ditemukan' },
        { status: 404 }
      );
    }

    const alat = alatResult.rows[0];
    if (alat.status !== 'tersedia') {
      return NextResponse.json(
        { error: 'Alat tidak tersedia untuk dipinjam' },
        { status: 400 }
      );
    }

    if (alat.jumlah_tersedia < jumlah) {
      return NextResponse.json(
        { error: `Jumlah alat tidak mencukupi. Tersedia: ${alat.jumlah_tersedia}` },
        { status: 400 }
      );
    }

    // Create peminjaman
    const result = await pool.query(
      `INSERT INTO peminjaman (user_id, alat_id, jumlah, tanggal_pinjam, tanggal_kembali, status, alasan, total_harga) 
       VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7) 
       RETURNING *`,
      [userId, alat_id, jumlah, tanggal_pinjam, tanggal_kembali, alasan || null, total_harga || 0]
    );

    const peminjaman = result.rows[0];

    // Log activity
    await logActivity(
      userId,
      'CREATE',
      'peminjaman',
      peminjaman.id,
      { userId, alat_id, jumlah, status: 'pending' }
    );


    return NextResponse.json(peminjaman, { status: 201 });
  } catch (error: any) {
    console.error('Error creating peminjaman:', error);

    // Provide more specific error messages
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Data sudah ada' },
        { status: 400 }
      );
    }

    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'Data referensi tidak valid' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Error creating peminjaman' },
      { status: 500 }
    );
  }
}