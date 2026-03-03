import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/activityLog';

export async function GET() {
    try {
        const result = await pool.query('SELECT * FROM kategori_berita ORDER BY id');
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching kategori berita:', error);
        return NextResponse.json({ error: 'Error fetching kategori berita' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { nama, deskripsi } = await request.json();

        const result = await pool.query(
            'INSERT INTO kategori_berita (nama, deskripsi) VALUES ($1, $2) RETURNING *',
            [nama, deskripsi || null]
        );

        const kategori = result.rows[0];
        const authHeader = request.headers.get('authorization');
        const userId = authHeader?.replace('Bearer ', '') || null;

        if (userId) {
            await logActivity(parseInt(userId), 'CREATE', 'kategori_berita', kategori.id, { nama });
        }

        return NextResponse.json(kategori, { status: 201 });
    } catch (error) {
        console.error('Error creating kategori berita:', error);
        return NextResponse.json({ error: 'Error creating kategori berita' }, { status: 500 });
    }
}
