import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/activityLog';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { peminjaman_id, tanggal_kembali, kondisi, catatan, denda } = await request.json();

    const result = await pool.query(
      `UPDATE pengembalian 
       SET peminjaman_id = $1, tanggal_kembali = $2, kondisi = $3, catatan = $4, denda = $5
       WHERE id = $6 
       RETURNING *`,
      [peminjaman_id, tanggal_kembali, kondisi, catatan || null, denda, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Pengembalian not found' },
        { status: 404 }
      );
    }

    const userId = request.headers.get('authorization')?.replace('Bearer ', '') || null;
    await logActivity(
      userId ? parseInt(userId) : null,
      'UPDATE',
      'pengembalian',
      id,
      { peminjaman_id, kondisi }
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating pengembalian:', error);
    return NextResponse.json(
      { error: 'Error updating pengembalian' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const userId = request.headers.get('authorization')?.replace('Bearer ', '') || null;

    const result = await pool.query('DELETE FROM pengembalian WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Pengembalian not found' },
        { status: 404 }
      );
    }

    await logActivity(
      userId ? parseInt(userId) : null,
      'DELETE',
      'pengembalian',
      id,
      {}
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pengembalian:', error);
    return NextResponse.json(
      { error: 'Error deleting pengembalian' },
      { status: 500 }
    );
  }
}