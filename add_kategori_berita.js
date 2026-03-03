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

async function migrate() {
    try {
        console.log('Connecting to database...');
        const client = await pool.connect();
        console.log('Connected to database');

        console.log('Adding kategori column to berita table...');
        await client.query(`
            ALTER TABLE berita 
            ADD COLUMN IF NOT EXISTS kategori VARCHAR(100) DEFAULT 'Umum';
        `);
        console.log('Column added successfully!');

        client.release();
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
