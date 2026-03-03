import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/activityLog';

export async function GET(request: NextRequest) {
    try {
        // Auto-migration - Run each query individually for better reliability
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS kategori_berita (
                    id SERIAL PRIMARY KEY,
                    nama VARCHAR(255) NOT NULL,
                    deskripsi TEXT,
                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await pool.query(`
                ALTER TABLE berita ADD COLUMN IF NOT EXISTS kategori_id INTEGER REFERENCES kategori_berita(id) ON DELETE SET NULL
            `);
        } catch (migrationError: any) {
            console.error('Migration error in berita API:', migrationError.message);
            // Non-critical: table or column might already exist or have issues, but we'll try to continue
        }

        const result = await pool.query(`
            SELECT b.*, kb.nama as kategori_nama 
            FROM berita b 
            LEFT JOIN kategori_berita kb ON b.kategori_id = kb.id 
            ORDER BY b.created_at DESC
        `);
        return NextResponse.json(result.rows);
    } catch (error: any) {
        console.error('Error fetching berita admin:', error);
        return NextResponse.json({
            error: 'Error fetching berita admin',
            details: error.message
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { judul, konten, foto, penulis, slug, kategori_id } = body;

        if (!judul || !konten) {
            return NextResponse.json({ error: 'Judul dan konten berita wajib diisi' }, { status: 400 });
        }

        // Generate slug from title if not provided
        const generatedSlug = (slug && slug.trim() !== '') ? slug : judul.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + Date.now(); // Add timestamp to avoid collisions

        // Ensure kategori_id is properly handled
        let parsedKategoriId = null;
        if (kategori_id && kategori_id !== '' && kategori_id !== 'undefined') {
            const parsed = parseInt(kategori_id as string);
            if (!isNaN(parsed)) {
                parsedKategoriId = parsed;
            }
        }

        console.log('Inserting news with:', { judul, generatedSlug, parsedKategoriId });

        const result = await pool.query(
            `INSERT INTO berita (judul, konten, foto, penulis, slug, kategori_id) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING id, judul, created_at`,
            [judul, konten, foto || null, penulis || 'Admin', generatedSlug, parsedKategoriId]
        );

        const berita = result.rows[0];

        // Temporarily skip logActivity to debug 500 error
        /*
        const authHeader = request.headers.get('authorization');
        const userId = authHeader?.replace('Bearer ', '') || null;
        if (userId && !isNaN(parseInt(userId))) {
            await logActivity(parseInt(userId), 'CREATE', 'berita', berita.id, { judul });
        }
        */

        return NextResponse.json(berita, { status: 201 });
    } catch (error: any) {
        console.error('CRITICAL ERROR in POST /api/admin/berita:', error);
        return NextResponse.json({
            error: 'Gagal membuat berita: ' + error.message,
            message: error.message,
            code: error.code,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
