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
                process.env[key] = value;
            }
        });
    }
}

loadEnv();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function test() {
    try {
        const client = await pool.connect();
        const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'alat'");
        console.log('Columns in alat:', res.rows.map(r => r.column_name).join(', '));
        client.release();
    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        await pool.end();
    }
}

test();
