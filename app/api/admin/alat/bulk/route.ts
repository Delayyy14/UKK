import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/activityLog';

export async function POST(request: NextRequest) {
    const client = await pool.connect();
    try {
        const { items } = await request.json();
        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
        }

        // Ambil semua kategori untuk mapping nama -> id dan id -> id
        const kategoriRes = await client.query('SELECT id, nama FROM kategori');
        const kategoriMap = new Map();
        kategoriRes.rows.forEach(k => {
            kategoriMap.set(k.nama.toLowerCase(), k.id);
            kategoriMap.set(k.id.toString(), k.id);
        });

        await client.query('BEGIN');

        const results = [];
        let errorMsg = null;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const { nama, deskripsi, kategori_id, kategori, jumlah, status, harga_per_hari } = item;

            if (!nama || jumlah === undefined) continue;

            let finalKategoriId = null;

            // Cari ID kategori berdasarkan ID atau Nama
            const katInput = (kategori_id || kategori || '').toString().trim().toLowerCase();
            if (katInput) {
                if (kategoriMap.has(katInput)) {
                    finalKategoriId = kategoriMap.get(katInput);
                } else {
                    // Jika input adalah angka tapi tidak ada di map, maka ID tidak valid
                    if (!isNaN(parseInt(katInput)) && !kategoriMap.has(katInput)) {
                        errorMsg = `Baris ${i + 1}: Kategori ID "${katInput}" tidak ditemukan di database.`;
                        break;
                    }
                    // Jika input adalah teks tapi tidak ada di map
                    errorMsg = `Baris ${i + 1}: Kategori "${katInput}" tidak ditemukan. Pastikan kategori sudah dibuat.`;
                    break;
                }
            }

            try {
                const res = await client.query(
                    `INSERT INTO alat (nama, deskripsi, kategori_id, jumlah, jumlah_tersedia, status, harga_per_hari) 
                     VALUES ($1, $2, $3, $4, $4, $5, $6) 
                     RETURNING id`,
                    [
                        nama,
                        deskripsi || null,
                        finalKategoriId,
                        parseInt(jumlah.toString()),
                        status || 'tersedia',
                        parseFloat(harga_per_hari?.toString() || '0')
                    ]
                );
                results.push(res.rows[0]);
            } catch (err: any) {
                errorMsg = `Baris ${i + 1}: ${err.message}`;
                break;
            }
        }

        if (errorMsg) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: errorMsg }, { status: 400 });
        }

        await client.query('COMMIT');

        const userId = request.headers.get('authorization')?.replace('Bearer ', '') || null;
        await logActivity(
            userId ? parseInt(userId) : null,
            'CREATE_BULK',
            'alat',
            null,
            { count: items.length }
        );

        return NextResponse.json({ success: true, count: results.length }, { status: 201 });
    } catch (error: any) {
        if (client) await client.query('ROLLBACK');
        console.error('Error bulk creating alat:', error);
        return NextResponse.json(
            { error: `Gagal import: ${error.message}` },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
