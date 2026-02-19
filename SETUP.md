# Panduan Setup Aplikasi Peminjaman Alat

## Prasyarat
1. Node.js (v18 atau lebih baru)
2. PostgreSQL (v12 atau lebih baru)
3. pgAdmin (opsional, untuk manajemen database)

## Langkah-langkah Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database PostgreSQL

#### A. Buat Database
Buka pgAdmin atau psql, lalu jalankan:
```sql
CREATE DATABASE peminjaman_alat;
```

#### B. Jalankan Schema SQL
Jalankan file `database/schema.sql` di database yang baru dibuat:
```bash
psql -U postgres -d peminjaman_alat -f database/schema.sql
```

Atau melalui pgAdmin:
1. Buka Query Tool pada database `peminjaman_alat`
2. Buka file `database/schema.sql`
3. Jalankan query tersebut

#### C. Setup Default Users (PENTING!)
Jalankan script untuk set password default users:
```bash
node scripts/setup-default-users.js
```

Ini akan set password untuk:
- **Admin**: username `admin`, password `admin123`
- **Petugas**: username `petugas`, password `petugas123`
- **Peminjam**: username `peminjam`, password `peminjam123`

### 3. Konfigurasi Database Connection

Edit file `lib/db.ts` jika koneksi database berbeda:
```typescript
const pool = new Pool({
  user: 'postgres',        // Username PostgreSQL Anda
  host: 'localhost',       // Host PostgreSQL
  database: 'peminjaman_alat',  // Nama database
  password: 'postgres',    // Password PostgreSQL Anda
  port: 5432,              // Port PostgreSQL
});
```

### 4. Jalankan Development Server
```bash
npm run dev
```

Buka browser ke: http://localhost:3000

### 5. Login
Gunakan salah satu akun default:
- Admin: `admin` / `admin123`
- Petugas: `petugas` / `petugas123`
- Peminjam: `peminjam` / `peminjam123`

**PENTING**: Ganti password default setelah login pertama kali untuk keamanan!

## Troubleshooting

### Error: Cannot connect to database
- Pastikan PostgreSQL sudah running
- Cek konfigurasi di `lib/db.ts`
- Pastikan database `peminjaman_alat` sudah dibuat

### Error: Password authentication failed
- Pastikan sudah menjalankan `scripts/setup-default-users.js`
- Atau reset password manual melalui SQL

### Error: Module not found
- Jalankan `npm install` lagi
- Pastikan semua dependencies terinstall dengan benar