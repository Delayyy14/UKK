-- Database Schema for Aplikasi Peminjaman Alat

-- Users table with roles: admin, petugas, peminjam
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    foto VARCHAR(500),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'petugas', 'peminjam')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS kategori (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment/Alat table
CREATE TABLE IF NOT EXISTS alat (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    kategori_id INTEGER REFERENCES kategori(id) ON DELETE SET NULL,
    jumlah INTEGER NOT NULL DEFAULT 0,
    jumlah_tersedia INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'tersedia' CHECK (status IN ('tersedia', 'tidak_tersedia', 'rusak')),
    foto VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan requests/Peminjaman table
CREATE TABLE IF NOT EXISTS peminjaman (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    alat_id INTEGER REFERENCES alat(id) ON DELETE CASCADE,
    jumlah INTEGER NOT NULL,
    tanggal_pinjam DATE NOT NULL,
    tanggal_kembali DATE,
    tanggal_pengembalian DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'disetujui', 'ditolak', 'sedang_dipinjam', 'selesai')),
    alasan TEXT,
    catatan TEXT,
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Returns/Pengembalian table
CREATE TABLE IF NOT EXISTS pengembalian (
    id SERIAL PRIMARY KEY,
    peminjaman_id INTEGER REFERENCES peminjaman(id) ON DELETE CASCADE,
    tanggal_kembali DATE NOT NULL,
    kondisi VARCHAR(20) DEFAULT 'baik' CHECK (kondisi IN ('baik', 'rusak_ringan', 'rusak_berat')),
    catatan TEXT,
    denda DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Log table
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(255),
    record_id INTEGER,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_alat_kategori ON alat(kategori_id);
CREATE INDEX IF NOT EXISTS idx_alat_status ON alat(status);
CREATE INDEX IF NOT EXISTS idx_peminjaman_user ON peminjaman(user_id);
CREATE INDEX IF NOT EXISTS idx_peminjaman_alat ON peminjaman(alat_id);
CREATE INDEX IF NOT EXISTS idx_peminjaman_status ON peminjaman(status);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at);

-- Insert default admin user (password: admin123)
-- Note: Run scripts/setup-default-users.js to set proper password hashes
-- Or manually hash passwords using bcrypt before inserting
-- For now, passwords need to be set using the setup script or manually
INSERT INTO users (username, password, nama, email, role) 
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Administrator', 'admin@example.com', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert default petugas user (password: petugas123)
INSERT INTO users (username, password, nama, email, role) 
VALUES ('petugas', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Petugas', 'petugas@example.com', 'petugas')
ON CONFLICT (username) DO NOTHING;

-- Insert default peminjam user (password: peminjam123)
INSERT INTO users (username, password, nama, email, role) 
VALUES ('peminjam', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Peminjam', 'peminjam@example.com', 'peminjam')
ON CONFLICT (username) DO NOTHING;

-- IMPORTANT: After running this schema, execute scripts/setup-default-users.js
-- to set proper password hashes for all default users