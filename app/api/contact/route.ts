
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { name, email, subject, message } = await request.json();

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Name, email, and message are required' },
                { status: 400 }
            );
        }

        const client = await pool.connect();
        try {
            const query = `
        INSERT INTO contact_messages (name, email, subject, message)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
            const values = [name, email, subject, message];
            const result = await client.query(query, values);

            return NextResponse.json(result.rows[0], { status: 201 });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error submitting contact form:', error);
        return NextResponse.json(
            { error: 'Failed to submit message' },
            { status: 500 }
        );
    }
}
