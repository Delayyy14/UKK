import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/activityLog';

export async function POST(request: NextRequest) {
  try {
    const { peminjaman_id, tanggal_kembali, kondisi, catatan } = await request.json();

    // Get peminjaman info
    const peminjamanResult = await pool.query(
      'SELECT * FROM peminjaman WHERE id = $1',
      [peminjaman_id]
    );

    if (peminjamanResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Peminjaman tidak ditemukan' },
        { status: 404 }
      );
    }

    const peminjaman = peminjamanResult.rows[0];

    if (peminjaman.status === 'selesai') {
      return NextResponse.json(
        { error: 'Alat sudah dikembalikan' },
        { status: 400 }
      );
    }

    // Create pengembalian
    const result = await pool.query(
      `INSERT INTO pengembalian (peminjaman_id, tanggal_kembali, kondisi, catatan, denda) 
       VALUES ($1, $2, $3, $4, 0) 
       RETURNING *`,
      [peminjaman_id, tanggal_kembali, kondisi || 'baik', catatan || null]
    );

    const pengembalian = result.rows[0];

    // Update peminjaman status
    await pool.query(
      'UPDATE peminjaman SET status = $1, tanggal_pengembalian = $2 WHERE id = $3',
      ['selesai', tanggal_kembali, peminjaman_id]
    );

    // Update alat availability berdasarkan kondisi
    // Barang dengan kondisi baik atau rusak_ringan masuk kembali ke stok
    // Barang rusak_berat tidak masuk ke stok (perlu diperbaiki dulu)
    const kondisiBarang = kondisi || 'baik';
    if (kondisiBarang === 'baik' || kondisiBarang === 'rusak_ringan') {
      await pool.query(
        `UPDATE alat 
         SET jumlah_tersedia = jumlah_tersedia + $1
         WHERE id = $2`,
        [peminjaman.jumlah, peminjaman.alat_id]
      );
    }
    // Jika rusak_berat, tidak menambah jumlah_tersedia (barang perlu diperbaiki)

    await logActivity(
      peminjaman.user_id,
      'RETURN',
      'pengembalian',
      pengembalian.id,
      { peminjaman_id, kondisi }
    );

    return NextResponse.json(pengembalian, { status: 201 });
  } catch (error) {
    console.error('Error creating pengembalian:', error);
    return NextResponse.json(
      { error: 'Error creating pengembalian' },
      { status: 500 }
    );
  }
}