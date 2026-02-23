const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

function log(msg) {
    console.log(msg);
    fs.appendFileSync('migration.log', msg + '\n');
}

function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                process.env[parts[0].trim()] = parts.slice(1).join('=').trim();
            }
        });
    }
}

loadEnv();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
});

async function migrate() {
    log('Starting migration script...');
    try {
        const client = await pool.connect();
        log('Connected to database');

        log('Checking for columns...');
        const checkRes = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'alat' AND column_name = 'harga_per_hari'");

        if (checkRes.rows.length === 0) {
            log('Adding harga_per_hari to alat...');
            await client.query("ALTER TABLE alat ADD COLUMN harga_per_hari DECIMAL(10, 2) DEFAULT 0");
            log('Done adding harga_per_hari');
        } else {
            log('harga_per_hari already exists in alat');
        }

        const checkRes2 = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'peminjaman' AND column_name = 'total_harga'");
        if (checkRes2.rows.length === 0) {
            log('Adding total_harga to peminjaman...');
            await client.query("ALTER TABLE peminjaman ADD COLUMN total_harga DECIMAL(12, 2) DEFAULT 0");
            log('Done adding total_harga');
        } else {
            log('total_harga already exists in peminjaman');
        }

        client.release();
        log('Migration completed successfully');
    } catch (err) {
        log('Migration FAILED: ' + err.message);
        log(err.stack);
    } finally {
        await pool.end();
        log('Pool closed');
        process.exit(0);
    }
}

migrate();
