const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim();
                process.env[key] = value.replace(/(^["']|["']$)/g, '');
            }
        });
    }
}
loadEnv();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function run() {
    try {
        const client = await pool.connect();

        console.log('--- Repairing Categories ---');
        await client.query(`
            CREATE TABLE IF NOT EXISTS kategori_berita (
                id SERIAL PRIMARY KEY,
                nama VARCHAR(255) NOT NULL,
                deskripsi TEXT,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('--- Repairing Berita Columns ---');
        await client.query(`
            ALTER TABLE berita 
            ADD COLUMN IF NOT EXISTS kategori_id INTEGER REFERENCES kategori_berita(id) ON DELETE SET NULL;
        `);

        // Populate categories if empty
        const katCount = await client.query('SELECT COUNT(*) FROM kategori_berita');
        if (katCount.rows[0].count === '0') {
            await client.query(`
                INSERT INTO kategori_berita (nama, deskripsi) VALUES 
                ('Umum', 'Berita Umum'),
                ('Tips', 'Tips & Trik'),
                ('Pengumuman', 'Pengumuman Resmi');
            `);
        }

        client.release();
        console.log('REPAIR COMPLETED');
    } catch (e) {
        console.error('REPAIR ERROR:', e.message);
    } finally {
        await pool.end();
    }
}
run();
