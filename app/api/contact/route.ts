import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/token';

export async function POST(request: Request) {
    try {
        const token = cookies().get('auth_token')?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload) {
            return NextResponse.json(
                { error: 'Anda harus login terlebih dahulu untuk mengirim pesan.' },
                { status: 401 }
            );
        }

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
