import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const result = await pool.query('SELECT * FROM kategori_berita ORDER BY nama ASC');
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching public kategori berita:', error);
        return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 });
    }
}
