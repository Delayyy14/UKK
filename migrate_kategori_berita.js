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

        console.log('Creating kategori_berita table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS kategori_berita (
                id SERIAL PRIMARY KEY,
                nama VARCHAR(255) NOT NULL,
                deskripsi TEXT,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Adding kategori_id to berita table...');
        // First check if column exists
        const checkColumn = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='berita' AND column_name='kategori_id';
        `);

        if (checkColumn.rows.length === 0) {
            await client.query(`
                ALTER TABLE berita 
                ADD COLUMN kategori_id INTEGER REFERENCES kategori_berita(id) ON DELETE SET NULL;
            `);
        }

        console.log('Creating index for berita(kategori_id)...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_berita_kategori ON berita(kategori_id);
        `);

        // Insert some default categories if table is empty
        const checkCats = await client.query('SELECT COUNT(*) FROM kategori_berita');
        if (parseInt(checkCats.rows[0].count) === 0) {
            console.log('Inserting default categories...');
            await client.query(`
                INSERT INTO kategori_berita (nama, deskripsi) VALUES 
                ('Umum', 'Berita seputar informasi umum'),
                ('Tips', 'Tips dan trik pendakian'),
                ('Event', 'Informasi mengenai event terbaru'),
                ('Pengumuman', 'Pengumuman resmi dari pengelola');
            `);
        }

        console.log('Migration completed successfully!');
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
