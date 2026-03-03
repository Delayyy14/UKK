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
        await client.query("SELECT * FROM berita LIMIT 1");
        fs.writeFileSync('error_log.txt', 'SUCCESS');
        client.release();
    } catch (e) {
        fs.writeFileSync('error_log.txt', e.message);
    } finally {
        await pool.end();
    }
}
run();
