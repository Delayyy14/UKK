import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendReplyEmail } from '@/lib/mail';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const { reply } = await request.json();

        if (!reply) {
            return NextResponse.json({ error: 'Balasan tidak boleh kosong' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            // Get original message details
            const result = await client.query('SELECT * FROM contact_messages WHERE id = $1', [id]);

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Pesan tidak ditemukan' }, { status: 404 });
            }

            const originalMessage = result.rows[0];

            // Send Email
            const emailResult = await sendReplyEmail(
                originalMessage.email,
                originalMessage.message,
                reply
            );

            if (!emailResult.success) {
                return NextResponse.json({ error: 'Gagal mengirim email balasan' }, { status: 500 });
            }

            // Update status to replied
            await client.query(
                "UPDATE contact_messages SET status = 'replied' WHERE id = $1",
                [id]
            );

            return NextResponse.json({ success: true, message: 'Balasan terkirim ke email user' });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Reply API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
