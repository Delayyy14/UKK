import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const client = await pool.connect();
        try {
            await client.query('DELETE FROM contact_messages WHERE id = $1', [params.id]);
            return NextResponse.json({ success: true, message: 'Message deleted successfully' });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error deleting message:', error);
        return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { name, email, subject, message, status } = body;

        const client = await pool.connect();
        try {
            const result = await client.query(
                `UPDATE contact_messages 
                 SET name = $1, email = $2, subject = $3, message = $4, status = COALESCE($5, status)
                 WHERE id = $6
                 RETURNING *`,
                [name, email, subject, message, status, params.id]
            );

            if (result.rowCount === 0) {
                return NextResponse.json({ error: 'Message not found' }, { status: 404 });
            }

            return NextResponse.json({ success: true, message: 'Message updated successfully', data: result.rows[0] });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error updating message:', error);
        return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
    }
}
