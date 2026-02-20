const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'peminjaman_alat',
    password: 'postgres',
    port: 5432,
});

const createTableQuery = `
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

(async () => {
    const client = await pool.connect();
    try {
        await client.query(createTableQuery);
        console.log('Table contact_messages created, migration successful.');
    } catch (err) {
        console.error('Error creating table:', err);
        process.exit(1);
    } finally {
        client.release();
        pool.end();
    }
})();
