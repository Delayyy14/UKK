const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'peminjaman_alat',
  password: 'postgres',
  port: 5432,
});

async function setupUsers() {
  try {
    // Hash passwords
    const adminHash = await bcrypt.hash('admin123', 10);
    const petugasHash = await bcrypt.hash('petugas123', 10);
    const peminjamHash = await bcrypt.hash('peminjam123', 10);

    // Update passwords
    await pool.query(
      "UPDATE users SET password = $1 WHERE username = 'admin'",
      [adminHash]
    );
    await pool.query(
      "UPDATE users SET password = $1 WHERE username = 'petugas'",
      [petugasHash]
    );
    await pool.query(
      "UPDATE users SET password = $1 WHERE username = 'peminjam'",
      [peminjamHash]
    );

    console.log('Default users setup completed!');
    console.log('Login credentials:');
    console.log('Admin: admin / admin123');
    console.log('Petugas: petugas / petugas123');
    console.log('Peminjam: peminjam / peminjam123');
  } catch (error) {
    console.error('Error setting up users:', error);
  } finally {
    await pool.end();
  }
}

setupUsers();