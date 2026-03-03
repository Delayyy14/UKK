const { Pool } = require('pg');
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

async function test() {
    try {
        console.log('Testing migration 1: CREATE TABLE kategori_berita');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS kategori_berita (
                id SERIAL PRIMARY KEY,
                nama VARCHAR(255) NOT NULL,
                deskripsi TEXT,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Migration 1 success');

        console.log('Testing migration 2: ALTER TABLE berita');
        await pool.query(`
            ALTER TABLE berita ADD COLUMN IF NOT EXISTS kategori_id INTEGER REFERENCES kategori_berita(id) ON DELETE SET NULL;
        `);
        console.log('Migration 2 success');

        console.log('Testing Query: SELECT');
        const result = await pool.query(`
            SELECT b.*, kb.nama as kategori_nama 
            FROM berita b 
            LEFT JOIN kategori_berita kb ON b.kategori_id = kb.id 
            ORDER BY b.created_at DESC
        `);
        console.log('Query success, rows:', result.rows.length);

    } catch (err) {
        console.error('ERROR DETECTED:');
        console.error(err.message);
        console.error(err.stack);
    } finally {
        await pool.end();
    }
}

test();
