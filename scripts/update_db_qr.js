const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

function getEnvUrl() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split('\n');
        for (const line of lines) {
            const parts = line.split('=');
            if (parts.length >= 2 && parts[0].trim() === 'DATABASE_URL') {
                return parts.slice(1).join('=').trim();
            }
        }
    }
    return process.env.DATABASE_URL;
}

const databaseUrl = getEnvUrl();
const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Migrating database for QR Code integration...');
        await pool.query(`
            ALTER TABLE alat ADD COLUMN IF NOT EXISTS barcode VARCHAR(255) UNIQUE;
            ALTER TABLE peminjaman ADD COLUMN IF NOT EXISTS kode_peminjaman VARCHAR(255) UNIQUE;
        `);
        console.log('Migration successful!');
    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await pool.end();
    }
}

run();
