import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const peminjamanId = params.id;

    const userIdHeader = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userIdHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(userIdHeader);

    let query = `
      SELECT 
        p.*,
        a.nama as alat_nama,
        a.deskripsi as alat_deskripsi,
        a.foto as alat_foto,
        u.nama as user_nama,
        u.username as user_username,
        u.email as user_email,
        k.nama as kategori_nama
      FROM peminjaman p
      LEFT JOIN alat a ON p.alat_id = a.id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN kategori k ON a.kategori_id = k.id
      WHERE p.id = $1
    `;

    const queryParams: any[] = [peminjamanId];

    // If not admin/petugas, restrict to own records
    if (userRole !== 'admin' && userRole !== 'petugas') {
      query += ' AND p.user_id = $2';
      queryParams.push(userId);
    }

    const result = await pool.query(query, queryParams);


    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Peminjaman tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching peminjaman detail:', error);
    return NextResponse.json(
      { error: 'Error fetching peminjaman detail' },
      { status: 500 }
    );
  }
}
