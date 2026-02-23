import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/activityLog';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { nama, deskripsi, kategori_id, jumlah, status, foto, harga_per_hari } = await request.json();

    const result = await pool.query(
      `UPDATE alat 
       SET nama = $1, deskripsi = $2, kategori_id = $3, jumlah = $4, status = $5, foto = $6, harga_per_hari = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 
       RETURNING *`,
      [nama, deskripsi || null, kategori_id || null, jumlah, status, foto || null, harga_per_hari || 0, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Alat not found' },
        { status: 404 }
      );
    }

    const userId = request.headers.get('authorization')?.replace('Bearer ', '') || null;
    await logActivity(
      userId ? parseInt(userId) : null,
      'UPDATE',
      'alat',
      id,
      { nama, jumlah }
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating alat:', error);
    return NextResponse.json(
      { error: `Error updating alat: ${error.message}` },
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

    const result = await pool.query('DELETE FROM alat WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Alat not found' },
        { status: 404 }
      );
    }

    await logActivity(
      userId ? parseInt(userId) : null,
      'DELETE',
      'alat',
      id,
      {}
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting alat:', error);
    return NextResponse.json(
      { error: 'Error deleting alat' },
      { status: 500 }
    );
  }
}