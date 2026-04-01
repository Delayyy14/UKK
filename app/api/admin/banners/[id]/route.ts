import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/activityLog';

// GET Single Banner
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await pool.query(
      'SELECT * FROM banners WHERE id = $1',
      [params.id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Banner tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching banner:', error);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

// UPDATE Banner
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { title, paragraph, background_url, order_index, is_active } = await request.json();

    if (!title || !background_url) {
      return NextResponse.json({ error: 'Judul dan URL gambar wajib diisi' }, { status: 400 });
    }

    const result = await pool.query(
      `UPDATE banners 
       SET title = $1, paragraph = $2, background_url = $3, order_index = $4, is_active = $5, updated_at = NOW() 
       WHERE id = $6 RETURNING *`,
      [title, paragraph || null, background_url, order_index || 0, is_active ?? true, params.id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Banner tidak ditemukan' }, { status: 404 });
    }

    const banner = result.rows[0];
    const userId = request.headers.get('x-user-id');

    await logActivity(
      userId ? parseInt(userId) : null,
      'UPDATE',
      'banners',
      null,
      { title, order_index }
    );

    return NextResponse.json(banner);
  } catch (error: any) {
    console.error('Error updating banner:', error);
    return NextResponse.json({ error: `Gagal memperbarui: ${error.message}` }, { status: 500 });
  }
}

// DELETE Banner
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await pool.query(
      'DELETE FROM banners WHERE id = $1 RETURNING title',
      [params.id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Banner tidak ditemukan' }, { status: 404 });
    }

    const banner = result.rows[0];
    const userId = request.headers.get('x-user-id');

    await logActivity(
      userId ? parseInt(userId) : null,
      'DELETE',
      'banners',
      null,
      { title: banner.title }
    );

    return NextResponse.json({ message: 'Banner berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return NextResponse.json({ error: `Gagal menghapus: ${error.message}` }, { status: 500 });
  }
}
