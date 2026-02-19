import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/activityLog';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { user_id, alat_id, jumlah, tanggal_pinjam, tanggal_kembali, status, alasan } = await request.json();

    // Get current data before update to check status change
    const oldDataResult = await pool.query('SELECT status, alat_id, jumlah FROM peminjaman WHERE id = $1', [id]);

    if (oldDataResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Peminjaman not found' },
        { status: 404 }
      );
    }

    const oldData = oldDataResult.rows[0];

    // Update the record
    const result = await pool.query(
      `UPDATE peminjaman 
       SET user_id = $1, alat_id = $2, jumlah = $3, tanggal_pinjam = $4, 
           tanggal_kembali = $5, status = $6, alasan = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 
       RETURNING *`,
      [user_id, alat_id, jumlah, tanggal_pinjam, tanggal_kembali || null, status, alasan || null, id]
    );

    // If status changed to 'disetujui', decrease available stock
    if (status === 'disetujui' && oldData.status !== 'disetujui') {
      await pool.query(
        `UPDATE alat 
         SET jumlah_tersedia = jumlah_tersedia - $1
         WHERE id = $2`,
        [jumlah, alat_id]
      );
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Peminjaman not found' },
        { status: 404 }
      );
    }

    const userId = request.headers.get('authorization')?.replace('Bearer ', '') || null;
    await logActivity(
      userId ? parseInt(userId) : null,
      'UPDATE',
      'peminjaman',
      id,
      { user_id, alat_id, status }
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating peminjaman:', error);
    return NextResponse.json(
      { error: 'Error updating peminjaman' },
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

    const result = await pool.query('DELETE FROM peminjaman WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Peminjaman not found' },
        { status: 404 }
      );
    }

    await logActivity(
      userId ? parseInt(userId) : null,
      'DELETE',
      'peminjaman',
      id,
      {}
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting peminjaman:', error);
    return NextResponse.json(
      { error: 'Error deleting peminjaman' },
      { status: 500 }
    );
  }
}