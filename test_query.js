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
    const log = [];
    try {
        const res = await pool.query("SELECT b.*, kb.nama as kategori_nama FROM berita b LEFT JOIN kategori_berita kb ON b.kategori_id = kb.id LIMIT 1");
        log.push('QUERY OK');
    } catch (e) {
        log.push('QUERY FAILED: ' + e.message);
    }
    fs.writeFileSync('db_status.txt', log.join('\n'));
    await pool.end();
}
run();
