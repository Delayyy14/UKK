import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const result = await pool.query('SELECT * FROM faq ORDER BY urutan ASC, created_at DESC');
        return NextResponse.json(result.rows);
    } catch (error: any) {
        console.error('Error fetching FAQ:', error);
        return NextResponse.json(
            { error: 'Error fetching FAQ' },
            { status: 500 }
        );
    }
}
