import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/activityLog';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { pertanyaan, jawaban, urutan } = await request.json();

        const result = await pool.query(
            `UPDATE faq 
       SET pertanyaan = $1, jawaban = $2, urutan = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 
       RETURNING *`,
            [pertanyaan, jawaban, urutan || 0, id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
        }

        const faq = result.rows[0];

        const authHeader = request.headers.get('authorization');
        const userId = authHeader?.replace('Bearer ', '') || null;

        if (userId) {
            await logActivity(
                parseInt(userId),
                'UPDATE',
                'faq',
                faq.id,
                { pertanyaan }
            );
        }

        return NextResponse.json(faq);
    } catch (error: any) {
        console.error('Error updating FAQ:', error);
        return NextResponse.json(
            { error: `Error updating FAQ: ${error.message}` },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const faqResult = await pool.query('SELECT pertanyaan FROM faq WHERE id = $1', [id]);
        if (faqResult.rows.length === 0) {
            return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
        }

        await pool.query('DELETE FROM faq WHERE id = $1', [id]);

        const authHeader = request.headers.get('authorization');
        const userId = authHeader?.replace('Bearer ', '') || null;

        if (userId) {
            await logActivity(
                parseInt(userId),
                'DELETE',
                'faq',
                parseInt(id),
                { pertanyaan: faqResult.rows[0].pertanyaan }
            );
        }

        return NextResponse.json({ message: 'FAQ deleted' });
    } catch (error: any) {
        console.error('Error deleting FAQ:', error);
        return NextResponse.json(
            { error: `Error deleting FAQ: ${error.message}` },
            { status: 500 }
        );
    }
}
