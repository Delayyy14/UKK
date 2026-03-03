import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/activityLog';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { judul, konten, foto, penulis, slug, kategori_id } = await request.json();

        const generatedSlug = slug || judul.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const result = await pool.query(
            `UPDATE berita 
       SET judul = $1, konten = $2, foto = $3, penulis = $4, slug = $5, kategori_id = $6, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $7 
       RETURNING *`,
            [judul, konten, foto || null, penulis || 'Admin', generatedSlug, kategori_id || null, id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Berita not found' }, { status: 404 });
        }

        const berita = result.rows[0];

        const authHeader = request.headers.get('authorization');
        const userId = authHeader?.replace('Bearer ', '') || null;

        if (userId) {
            await logActivity(
                parseInt(userId),
                'UPDATE',
                'berita',
                berita.id,
                { judul }
            );
        }

        return NextResponse.json(berita);
    } catch (error: any) {
        console.error('Error updating berita:', error);
        return NextResponse.json({ error: `Error updating berita: ${error.message}` }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const beritaResult = await pool.query('SELECT judul FROM berita WHERE id = $1', [id]);
        if (beritaResult.rows.length === 0) {
            return NextResponse.json({ error: 'Berita not found' }, { status: 404 });
        }

        await pool.query('DELETE FROM berita WHERE id = $1', [id]);

        const authHeader = request.headers.get('authorization');
        const userId = authHeader?.replace('Bearer ', '') || null;

        if (userId) {
            await logActivity(
                parseInt(userId),
                'DELETE',
                'berita',
                parseInt(id),
                { judul: beritaResult.rows[0].judul }
            );
        }

        return NextResponse.json({ message: 'Berita deleted' });
    } catch (error: any) {
        console.error('Error deleting berita:', error);
        return NextResponse.json({ error: `Error deleting berita: ${error.message}` }, { status: 500 });
    }
}
