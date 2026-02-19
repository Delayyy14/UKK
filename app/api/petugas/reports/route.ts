import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let dateFilterPeminjaman = '';
    let dateFilterPengembalian = '';
    const queryParams: any[] = [];

    if (month && year) {
      dateFilterPeminjaman = `WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2`;
      dateFilterPengembalian = `WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2`;
      queryParams.push(parseInt(month), parseInt(year));
    } else if (year) {
      dateFilterPeminjaman = `WHERE EXTRACT(YEAR FROM created_at) = $1`;
      dateFilterPengembalian = `WHERE EXTRACT(YEAR FROM created_at) = $1`;
      queryParams.push(parseInt(year));
    }

    // Helper to append WHERE or AND
    const addCondition = (baseFilter: string, condition: string) => {
      if (baseFilter) return `${baseFilter} AND ${condition}`;
      return `WHERE ${condition}`;
    };

    const statusActiveCondition = "status IN ('disetujui', 'sedang_dipinjam')";
    const statusPendingCondition = "status = 'pending'";

    const [totalPeminjaman, totalPengembalian, peminjamanAktif, peminjamanPending, detailPeminjaman] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM peminjaman ${dateFilterPeminjaman}`, queryParams),
      pool.query(`SELECT COUNT(*) FROM pengembalian ${dateFilterPengembalian}`, queryParams),
      pool.query(`SELECT COUNT(*) FROM peminjaman ${addCondition(dateFilterPeminjaman, statusActiveCondition)}`, queryParams),
      pool.query(`SELECT COUNT(*) FROM peminjaman ${addCondition(dateFilterPeminjaman, statusPendingCondition)}`, queryParams),
      pool.query(`
        SELECT 
          p.id,
          p.jumlah,
          p.tanggal_pinjam,
          p.tanggal_kembali,
          p.status,
          u.nama as peminjam_nama,
          u.username as peminjam_username,
          a.nama as alat_nama,
          a.deskripsi as alat_deskripsi,
          k.nama as kategori_nama
        FROM peminjaman p
        JOIN users u ON p.user_id = u.id
        JOIN alat a ON p.alat_id = a.id
        LEFT JOIN kategori k ON a.kategori_id = k.id
        ${dateFilterPeminjaman ? dateFilterPeminjaman.replace(/created_at/g, 'p.created_at') : ''}
        ORDER BY p.created_at DESC
      `, queryParams)
    ]);

    return NextResponse.json({
      totalPeminjaman: parseInt(totalPeminjaman.rows[0].count),
      totalPengembalian: parseInt(totalPengembalian.rows[0].count),
      peminjamanAktif: parseInt(peminjamanAktif.rows[0].count),
      peminjamanPending: parseInt(peminjamanPending.rows[0].count),
      detailPeminjaman: detailPeminjaman.rows,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Error fetching reports' },
      { status: 500 }
    );
  }
}