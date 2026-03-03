import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/activityLog';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { nama, deskripsi } = await request.json();

        const result = await pool.query(
            'UPDATE kategori_berita SET nama = $1, deskripsi = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
            [nama, deskripsi || null, id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Kategori berita not found' }, { status: 404 });
        }

        const kategori = result.rows[0];
        const authHeader = request.headers.get('authorization');
        const userId = authHeader?.replace('Bearer ', '') || null;

        if (userId) {
            await logActivity(parseInt(userId), 'UPDATE', 'kategori_berita', kategori.id, { nama });
        }

        return NextResponse.json(kategori);
    } catch (error) {
        console.error('Error updating kategori berita:', error);
        return NextResponse.json({ error: 'Error updating kategori berita' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const checkRes = await pool.query('SELECT nama FROM kategori_berita WHERE id = $1', [id]);
        if (checkRes.rows.length === 0) {
            return NextResponse.json({ error: 'Kategori berita not found' }, { status: 404 });
        }

        // Check if category is used? (Optional but recommended)
        const checkUsed = await pool.query('SELECT COUNT(*) FROM berita WHERE kategori_id = $1', [id]);
        if (parseInt(checkUsed.rows[0].count) > 0) {
            return NextResponse.json({
                error: 'Kategori ini tidak bisa dihapus karena masih digunakan oleh berita lain.'
            }, { status: 400 });
        }

        await pool.query('DELETE FROM kategori_berita WHERE id = $1', [id]);

        const authHeader = request.headers.get('authorization');
        const userId = authHeader?.replace('Bearer ', '') || null;

        if (userId) {
            await logActivity(parseInt(userId), 'DELETE', 'kategori_berita', parseInt(id), { nama: checkRes.rows[0].nama });
        }

        return NextResponse.json({ message: 'Kategori berita deleted' });
    } catch (error) {
        console.error('Error deleting kategori berita:', error);
        return NextResponse.json({ error: 'Error deleting kategori berita' }, { status: 500 });
    }
}
