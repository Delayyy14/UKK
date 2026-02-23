import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/activityLog';

export async function POST(request: NextRequest) {
    const client = await pool.connect();
    try {
        const { items } = await request.json();
        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
        }

        await client.query('BEGIN');

        const results = [];
        for (const item of items) {
            const { nama, deskripsi } = item;

            if (!nama) continue;

            const res = await client.query(
                'INSERT INTO kategori (nama, deskripsi) VALUES ($1, $2) RETURNING id',
                [nama, deskripsi || null]
            );
            results.push(res.rows[0]);
        }

        await client.query('COMMIT');

        const userId = request.headers.get('authorization')?.replace('Bearer ', '') || null;
        await logActivity(
            userId ? parseInt(userId) : null,
            'CREATE_BULK',
            'kategori',
            null,
            { count: items.length }
        );

        return NextResponse.json({ success: true, count: results.length }, { status: 201 });
    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Error bulk creating kategori:', error);
        return NextResponse.json(
            { error: `Gagal import: ${error.message}` },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
