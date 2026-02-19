import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/activityLog';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { nama, deskripsi } = await request.json();

    const result = await pool.query(
      'UPDATE kategori SET nama = $1, deskripsi = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [nama, deskripsi || null, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Kategori not found' },
        { status: 404 }
      );
    }

    const userId = request.headers.get('authorization')?.replace('Bearer ', '') || null;
    await logActivity(
      userId ? parseInt(userId) : null,
      'UPDATE',
      'kategori',
      id,
      { nama }
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating kategori:', error);
    return NextResponse.json(
      { error: 'Error updating kategori' },
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

    const result = await pool.query('DELETE FROM kategori WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Kategori not found' },
        { status: 404 }
      );
    }

    await logActivity(
      userId ? parseInt(userId) : null,
      'DELETE',
      'kategori',
      id,
      {}
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting kategori:', error);
    return NextResponse.json(
      { error: 'Error deleting kategori' },
      { status: 500 }
    );
  }
}