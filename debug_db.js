const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

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

async function check() {
    try {
        const client = await pool.connect();
        console.log('--- Table: kategori_berita ---');
        const katTable = await client.query("SELECT * FROM information_schema.tables WHERE table_name = 'kategori_berita'");
        console.log('Exists:', katTable.rows.length > 0);

        console.log('--- Table: berita columns ---');
        const cols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'berita'");
        console.table(cols.rows);

        console.log('--- Test Query ---');
        const test = await client.query(`
            SELECT b.*, kb.nama as kategori_nama 
            FROM berita b 
            LEFT JOIN kategori_berita kb ON b.kategori_id = kb.id 
            LIMIT 1
        `);
        console.log('Query Success');
        client.release();
    } catch (e) {
        console.error('ERROR:', e.message);
    } finally {
        await pool.end();
    }
}
check();
