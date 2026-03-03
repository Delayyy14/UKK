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

async function fix() {
    try {
        const client = await pool.connect();
        console.log('Connected to database');

        console.log('Synchronizing contact_messages table structure...');

        // 1. Add status column if it doesn't exist
        await client.query(`
            ALTER TABLE contact_messages 
            ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'unread';
        `);

        // 2. Adjust constraint if needed (optional but good for consistency with schema.sql)
        try {
            await client.query(`
                ALTER TABLE contact_messages 
                DROP CONSTRAINT IF EXISTS contact_messages_status_check;
                
                ALTER TABLE contact_messages 
                ADD CONSTRAINT contact_messages_status_check 
                CHECK (status IN ('unread', 'read', 'replied'));
            `);
        } catch (e) {
            console.log('Note: Could not add constraint, possibly column needs conversion first.');
        }

        console.log('Fix successful');
        client.release();
    } catch (err) {
        console.error('Fix failed:', err);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

fix();
