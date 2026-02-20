import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit');

        let query = `
      SELECT a.*, k.nama as kategori_nama 
      FROM alat a 
      LEFT JOIN kategori k ON a.kategori_id = k.id 
    `;

        // Sort by id descending to show newest first if limited, or just ID
        query += ` ORDER BY a.id ASC`;

        if (limit) {
            query += ` LIMIT ${parseInt(limit)}`;
        }

        const result = await pool.query(query);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Error fetching products' },
            { status: 500 }
        );
    }
}
