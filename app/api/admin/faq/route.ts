import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/activityLog';

export async function GET(request: NextRequest) {
    try {
        const result = await pool.query('SELECT * FROM faq ORDER BY urutan ASC, id ASC');
        return NextResponse.json(result.rows);
    } catch (error: any) {
        console.error('Error fetching FAQ admin:', error);
        return NextResponse.json(
            { error: 'Error fetching FAQ admin' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { pertanyaan, jawaban, urutan } = await request.json();

        const result = await pool.query(
            `INSERT INTO faq (pertanyaan, jawaban, urutan) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
            [pertanyaan, jawaban, urutan || 0]
        );

        const faq = result.rows[0];

        const authHeader = request.headers.get('authorization');
        const userId = authHeader?.replace('Bearer ', '') || null;

        if (userId) {
            await logActivity(
                parseInt(userId),
                'CREATE',
                'faq',
                faq.id,
                { pertanyaan }
            );
        }

        return NextResponse.json(faq, { status: 201 });
    } catch (error: any) {
        console.error('Error creating FAQ:', error);
        return NextResponse.json(
            { error: `Error creating FAQ: ${error.message}` },
            { status: 500 }
        );
    }
}
