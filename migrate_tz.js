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

async function migrate() {
    try {
        const client = await pool.connect();
        console.log('Connected to database');

        console.log('Converting TIMESTAMP columns to TIMESTAMPTZ...');

        // Define tables and columns to migrate
        const migrations = [
            ['users', 'created_at'], ['users', 'updated_at'],
            ['kategori', 'created_at'], ['kategori', 'updated_at'],
            ['alat', 'created_at'], ['alat', 'updated_at'],
            ['peminjaman', 'created_at'], ['peminjaman', 'updated_at'],
            ['pengembalian', 'created_at'],
            ['activity_log', 'created_at'],
            ['contact_messages', 'created_at']
        ];

        for (const [table, column] of migrations) {
            console.log(`Migrating ${table}.${column}...`);
            await client.query(`
                ALTER TABLE ${table} 
                ALTER COLUMN ${column} TYPE TIMESTAMPTZ 
                USING ${column} AT TIME ZONE 'UTC';
            `);
        }

        console.log('Setting database timezone to Asia/Jakarta...');
        await client.query("ALTER DATABASE postgres SET timezone TO 'Asia/Jakarta';");

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
