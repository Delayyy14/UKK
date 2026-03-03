import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = searchParams.get('limit');

        let query = `
            SELECT b.*, kb.nama as kategori_nama 
            FROM berita b 
            LEFT JOIN kategori_berita kb ON b.kategori_id = kb.id 
            ORDER BY b.created_at DESC
        `;
        const params: any[] = [];

        if (limit) {
            query += ' LIMIT $1';
            params.push(parseInt(limit));
        }

        const result = await pool.query(query, params);
        return NextResponse.json(result.rows);
    } catch (error: any) {
        console.error('Error fetching berita:', error);
        return NextResponse.json({ error: 'Error fetching berita' }, { status: 500 });
    }
}
