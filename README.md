# Aplikasi Peminjaman Alat

Aplikasi web untuk manajemen peminjaman alat dengan 3 level pengguna: Admin, Petugas, dan Peminjam.

## Teknologi

- **Framework**: Next.js 14
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS
- **Authentication**: Custom authentication dengan bcryptjs

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database PostgreSQL

1. Buat database baru di PostgreSQL:
```sql
CREATE DATABASE peminjaman_alat;
```

2. Jalankan script schema:
```bash
psql -U postgres -d peminjaman_alat -f database/schema.sql
```

Atau jalankan file `database/schema.sql` di pgAdmin.

### 3. Konfigurasi Database

Edit file `lib/db.ts` jika diperlukan untuk menyesuaikan konfigurasi database:
- Host: localhost
- Port: 5432
- Database: peminjaman_alat
- User: postgres
- Password: postgres

### 4. Setup Default Users

Default users sudah termasuk di schema.sql, namun password perlu di-hash ulang. Jalankan script untuk membuat password hash:

```bash
node scripts/setup-default-users.js
```

Atau login dengan password default yang perlu diubah:
- Admin: username: `admin`, password: `admin123`
- Petugas: username: `petugas`, password: `petugas123`
- Peminjam: username: `peminjam`, password: `peminjam123`

**PENTING**: Pastikan untuk mengubah password default setelah pertama kali login!

### 5. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Fitur

### Admin
- ✅ Login/Logout
- ✅ CRUD User
- ✅ CRUD Alat
- ✅ CRUD Kategori
- ✅ CRUD Data Peminjaman
- ✅ CRUD Pengembalian
- ✅ Log Aktifitas

### Petugas
- ✅ Login/Logout
- ✅ Menyetujui Peminjaman
- ✅ Memantau Pengembalian
- ✅ Mencetak Laporan

### Peminjam
- ✅ Login/Logout
- ✅ Melihat Daftar Alat
- ✅ Mengajukan Peminjaman
- ✅ Mengembalikan Alat

## Struktur Project

```
├── app/
│   ├── admin/          # Halaman admin
│   ├── petugas/        # Halaman petugas
│   ├── peminjam/       # Halaman peminjam
│   ├── api/            # API routes
│   ├── login/          # Halaman login
│   └── dashboard/      # Dashboard
├── components/         # Komponen React
├── lib/               # Utilities & helpers
├── database/          # Database schema
└── public/            # Static files
```

## Database Schema

- `users` - Data pengguna
- `kategori` - Kategori alat
- `alat` - Data alat/peralatan
- `peminjaman` - Data peminjaman
- `pengembalian` - Data pengembalian
- `activity_log` - Log aktivitas sistem

## Catatan

- Pastikan PostgreSQL sudah running sebelum menjalankan aplikasi
- Default password untuk semua user adalah `[username]123` (contoh: admin123)
- Password disimpan dalam bentuk hash menggunakan bcryptjs
- Activity log mencatat semua aktivitas penting di sistem