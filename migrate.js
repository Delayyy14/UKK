const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Basic .env parser
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length === 2) {
                process.env[parts[0].trim()] = parts[1].trim();
            }
        });
    }
}

loadEnv();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('Using DB URL:', process.env.DATABASE_URL ? 'FOUND' : 'NOT FOUND');
    try {
        const client = await pool.connect();
        console.log('Connected to database');

        console.log('Running migration...');
        await client.query(`
      ALTER TABLE alat ADD COLUMN IF NOT EXISTS harga_per_hari DECIMAL(10, 2) DEFAULT 0;
      ALTER TABLE peminjaman ADD COLUMN IF NOT EXISTS total_harga DECIMAL(12, 2) DEFAULT 0;
    `);

        console.log('Migration successful');
        client.release();
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

migrate();
