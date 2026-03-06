const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

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
    try {
        const client = await pool.connect();
        console.log('Connected to database');

        console.log('Creating revoked_tokens table...');
        await client.query(`
          CREATE TABLE IF NOT EXISTS revoked_tokens (
            id SERIAL PRIMARY KEY,
            jti VARCHAR(255) UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_revoked_tokens_jti ON revoked_tokens(jti);
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
