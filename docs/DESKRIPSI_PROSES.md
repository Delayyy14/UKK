# Deskripsi Proses Sistem Peminjaman Alat

Dokumen ini menjelaskan proses-proses utama dalam sistem aplikasi peminjaman alat.

## 1. Proses Login

### Deskripsi
Proses login memungkinkan pengguna untuk mengakses sistem berdasarkan role mereka (Admin, Petugas, atau Peminjam).

### Langkah-langkah:
1. **User membuka halaman login**
   - User mengakses halaman login melalui browser

2. **User memasukkan username dan password**
   - User mengisi form login dengan kredensial mereka

3. **User klik tombol Login**
   - Sistem menerima data login untuk diverifikasi

4. **Sistem validasi username dan password**
   - Sistem memeriksa apakah username dan password sesuai dengan data di database
   - Password di-hash menggunakan bcryptjs dan dibandingkan dengan hash yang tersimpan

5. **Jika username/password salah:**
   - Sistem menampilkan pesan error "Username atau password salah"
   - User dapat mencoba login kembali

6. **Jika username/password benar:**
   - Sistem melakukan logging aktivitas login (mencatat IP address dan waktu login)
   - Sistem menyimpan data user ke localStorage (session management)
   - Sistem melakukan redirect ke dashboard berdasarkan role user:
     - **Admin**: `/dashboard` (dapat mengakses semua fitur)
     - **Petugas**: `/dashboard` (dapat mengelola peminjaman dan pengembalian)
     - **Peminjam**: `/dashboard` (dapat mengajukan peminjaman dan mengembalikan alat)

### Output
- User berhasil masuk ke sistem dan diarahkan ke dashboard sesuai role
- Aktivitas login tercatat di activity log

---

## 2. Proses Peminjaman Alat

### Deskripsi
Proses peminjaman memungkinkan pengguna dengan role "Peminjam" untuk mengajukan permintaan peminjaman alat. Peminjaman harus disetujui oleh Petugas sebelum alat dapat diambil. Peminjam dapat mencetak bukti peminjaman untuk dibawa ke offline store.

### Alur Lengkap (sesuai dengan flowchart detail):
1. **Peminjam melihat daftar alat** - Peminjam membuka halaman daftar alat
2. **Peminjam mengajukan peminjaman** - Mengisi form peminjaman online
3. **Petugas menyetujui peminjaman** - Petugas meninjau dan menyetujui/tolak peminjaman
4. **Peminjam datang dengan bukti** - Peminjam mencetak PDF bukti peminjaman dan datang ke offline store
5. **Peminjam offline mengambil alat** - Peminjam mengambil alat secara fisik di lokasi
6. **Petugas mencatat peminjaman** - Petugas mengkonfirmasi dan mencatat pengambilan alat
7. **Petugas cetak bukti** - Petugas mencetak bukti pengambilan alat untuk peminjam

### Langkah-langkah:
1. **Peminjam membuka halaman peminjaman**
   - Peminjam mengakses halaman `/peminjam/pinjam`

2. **Sistem menampilkan daftar alat yang tersedia**
   - Sistem mengambil data alat dari database dengan status "tersedia" dan `jumlah_tersedia > 0`
   - Jika alat tidak tersedia, tombol menampilkan teks "Stok Habis"

3. **Peminjam memilih alat yang ingin dipinjam**
   - Peminjam memilih alat dari dropdown atau dari halaman daftar alat

4. **Validasi ketersediaan alat:**
   - Sistem memeriksa apakah alat memiliki stok yang tersedia (`jumlah_tersedia > 0`)
   - Jika tidak tersedia: tampilkan pesan "Stok Habis" dan proses dihentikan

5. **Peminjam mengisi form peminjaman:**
   - **Jumlah**: jumlah unit alat yang ingin dipinjam (maksimal sesuai stok tersedia)
   - **Tanggal Pinjam**: tanggal mulai peminjaman (harus >= tanggal hari ini)
   - **Tanggal Kembali**: tanggal pengembalian (harus >= tanggal pinjam)
   - **Alasan**: alasan peminjaman (opsional)

6. **Peminjam klik tombol "Ajukan Peminjaman"**
   - Sistem menerima data peminjaman untuk diproses

7. **Sistem validasi jumlah tidak melebihi stok:**
   - Sistem memeriksa apakah jumlah yang diminta tidak melebihi `jumlah_tersedia`
   - Jika melebihi: tampilkan pesan error dan proses dihentikan

8. **Buat data peminjaman:**
   - Sistem membuat record baru di tabel `peminjaman` dengan status "pending"
   - Data yang disimpan: `user_id`, `alat_id`, `jumlah`, `tanggal_pinjam`, `tanggal_kembali`, `alasan`, `status = 'pending'`

9. **Log aktivitas peminjaman:**
   - Sistem mencatat aktivitas di tabel `activity_log`

10. **Tampilkan pesan sukses dan redirect:**
    - Sistem menampilkan pesan "Peminjaman berhasil diajukan"
    - User di-redirect ke dashboard untuk melihat status peminjaman

11. **Cetak Bukti Peminjaman (untuk status pending/disetujui):**
    - Peminjam dapat mengklik tombol "Cetak Bukti" di dashboard atau halaman kembalikan
    - Sistem menampilkan halaman bukti peminjaman dengan format profesional
    - Bukti mencakup: nomor peminjaman, informasi peminjam, informasi alat, detail peminjaman, dan status
    - Bukti dapat dicetak sebagai PDF untuk dibawa ke offline store
    - Bukti ini diperlukan untuk mengambil alat secara fisik di lokasi

### Catatan Penting:
- Status peminjaman dimulai dengan "pending" dan menunggu persetujuan dari Petugas
- Stok alat (`jumlah_tersedia`) **TIDAK** dikurangi saat peminjaman dibuat (hanya dikurangi setelah disetujui oleh Petugas)
- Peminjam dapat melihat status peminjaman mereka di dashboard

### Output
- Data peminjaman tersimpan dengan status "pending"
- Peminjam dapat melihat peminjaman mereka menunggu persetujuan

---

## 3. Proses Pengembalian Alat

### Deskripsi
Proses pengembalian memungkinkan pengguna dengan role "Peminjam" untuk mengembalikan alat yang telah dipinjam. Sistem akan memeriksa kondisi alat dan memperbarui stok sesuai kondisinya.

### Alur Lengkap (sesuai dengan flowchart detail):
1. **Peminjam datang, kembalikan barang** - Peminjam datang ke offline store dengan membawa alat yang dipinjam
2. **Peminjam mengembalikan alat** - Peminjam mengembalikan alat secara fisik ke petugas
3. **Petugas konfirmasi pengembalian** - Petugas memeriksa kondisi alat dan mengkonfirmasi pengembalian di sistem
4. **Petugas cetak bukti pengembalian** - Petugas mencetak bukti pengembalian untuk peminjam

### Langkah-langkah:
1. **Peminjam membuka halaman pengembalian**
   - Peminjam mengakses halaman `/peminjam/kembalikan`

2. **Sistem menampilkan daftar peminjaman aktif**
   - Sistem mengambil data peminjaman dengan status "sedang_dipinjam" atau "disetujui" yang belum dikembalikan

3. **Validasi ada peminjaman aktif:**
   - Sistem memeriksa apakah peminjam memiliki peminjaman aktif
   - Jika tidak ada: tampilkan pesan "Tidak ada peminjaman aktif" dan proses dihentikan

4. **Peminjam memilih peminjaman yang akan dikembalikan**
   - Peminjam memilih dari daftar peminjaman aktif mereka

5. **Peminjam mengisi form pengembalian:**
   - **Tanggal Kembali**: tanggal pengembalian aktual (default: tanggal hari ini)
   - **Kondisi Alat**: pilihan kondisi (baik, rusak_ringan, rusak_berat)
   - **Catatan**: catatan tambahan tentang kondisi alat (opsional)

6. **Peminjam klik tombol "Kembalikan"**
   - Sistem menerima data pengembalian untuk diproses

7. **Sistem validasi peminjaman belum dikembalikan:**
   - Sistem memeriksa apakah peminjaman tersebut belum memiliki record pengembalian
   - Jika sudah dikembalikan: tampilkan pesan error dan proses dihentikan

8. **Buat data pengembalian:**
   - Sistem membuat record baru di tabel `pengembalian`
   - Data yang disimpan: `peminjaman_id`, `tanggal_kembali`, `kondisi`, `catatan`, `denda` (default: 0)

9. **Update status peminjaman menjadi "selesai":**
   - Sistem mengupdate status peminjaman dari "sedang_dipinjam" menjadi "selesai"
   - Sistem mengisi field `tanggal_pengembalian` pada tabel peminjaman

10. **Cek kondisi alat dan update stok:**
    - Sistem memeriksa kondisi alat yang dikembalikan:
      - **Jika kondisi = "baik" atau "rusak_ringan"**:
        - Sistem menambahkan jumlah alat kembali ke `jumlah_tersedia`
        - Alat dapat dipinjam kembali
      - **Jika kondisi = "rusak_berat"**:
        - Sistem **TIDAK** menambahkan jumlah alat ke `jumlah_tersedia`
        - Alat perlu diperbaiki terlebih dahulu sebelum dapat dipinjam kembali
        - Admin/Petugas perlu memperbaiki atau mengganti alat tersebut

11. **Log aktivitas pengembalian:**
    - Sistem mencatat aktivitas di tabel `activity_log`

12. **Tampilkan pesan sukses dan redirect:**
    - Sistem menampilkan pesan "Pengembalian berhasil"
    - User di-redirect ke dashboard

### Logika Stok:
- **Kondisi Baik**: `jumlah_tersedia += jumlah yang dikembalikan`
- **Kondisi Rusak Ringan**: `jumlah_tersedia += jumlah yang dikembalikan` (masih bisa dipakai)
- **Kondisi Rusak Berat**: `jumlah_tersedia` **TIDAK** di-update (perlu diperbaiki)

### Catatan Penting:
- Hanya peminjaman dengan status "sedang_dipinjam" atau "disetujui" yang dapat dikembalikan
- Setiap peminjaman hanya dapat dikembalikan sekali
- Kondisi alat menentukan apakah stok akan ditambahkan kembali atau tidak

### Output
- Data pengembalian tersimpan
- Status peminjaman berubah menjadi "selesai"
- Stok alat diperbarui sesuai kondisi (kecuali rusak berat)
- Aktivitas pengembalian tercatat di activity log

---

## Catatan Teknis

### Teknologi yang Digunakan:
- **Frontend**: Next.js 14 dengan React dan Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **Authentication**: bcryptjs untuk hashing password, localStorage untuk session
- **File Upload**: Upload gambar ke folder `public/uploads`

### Struktur Database:
- `users`: Data pengguna (admin, petugas, peminjam)
- `kategori`: Kategori alat
- `alat`: Data alat/peralatan
- `peminjaman`: Data peminjaman
- `pengembalian`: Data pengembalian
- `activity_log`: Log aktivitas pengguna

### Status Peminjaman:
- `pending`: Menunggu persetujuan
- `disetujui`: Disetujui oleh petugas
- `ditolak`: Ditolak oleh petugas
- `sedang_dipinjam`: Sedang dipinjam
- `selesai`: Sudah dikembalikan

### Kondisi Pengembalian:
- `baik`: Alat dalam kondisi baik, langsung masuk ke stok
- `rusak_ringan`: Alat sedikit rusak tapi masih bisa dipakai, masuk ke stok
- `rusak_berat`: Alat rusak parah, perlu diperbaiki, tidak masuk ke stok

---

## Cara Menggunakan Flowchart

1. Buka website [https://app.diagrams.net/](https://app.diagrams.net/)
2. Klik **"Open Existing Diagram"**
3. Pilih file flowchart yang diinginkan dari folder `docs/`:
   - `FLOWCHART_LOGIN.drawio` - Untuk proses login
   - `FLOWCHART_PEMINJAMAN.drawio` - Untuk proses peminjaman (alur sistem)
   - `FLOWCHART_PEMINJAMAN_DETAILED.drawio` - **Alur peminjaman detail dengan interaksi Petugas-Peminjam** (sesuai foto referensi)
   - `FLOWCHART_PENGEMBALIAN.drawio` - Untuk proses pengembalian (alur sistem)
   - `FLOWCHART_PENGEMBALIAN_DETAILED.drawio` - **Alur pengembalian detail dengan interaksi Petugas-Peminjam** (sesuai foto referensi)
4. File akan terbuka dan dapat diedit di diagrams.net
5. Setelah selesai, simpan kembali atau export sebagai gambar/PDF

### Catatan Flowchart:
- **Flowchart dengan nama "_DETAILED"** menunjukkan alur lengkap dengan interaksi antara Petugas dan Peminjam sesuai dengan proses offline store
- Flowchart detail ini sesuai dengan foto referensi yang menunjukkan kolom Petugas dan Peminjam
