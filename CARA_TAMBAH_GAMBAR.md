# Cara Menambahkan Gambar di Halaman Login dan Register

## 📁 Lokasi Folder untuk Menyimpan Gambar

Gambar harus disimpan di folder **`public`** di root project Anda.

```
UKK/
├── public/
│   ├── login-bg.jpg      ← Gambar untuk halaman login
│   ├── register-bg.jpg   ← Gambar untuk halaman register
│   └── logo.png          ← Logo (opsional)
├── app/
├── components/
└── ...
```

## 🖼️ Cara Menambahkan Gambar

### Langkah 1: Buat Folder `public` (jika belum ada)

Folder `public` sudah dibuat otomatis. Jika belum ada, buat folder dengan nama `public` di root project.

### Langkah 2: Masukkan Gambar ke Folder `public`

1. Siapkan gambar yang ingin digunakan
2. Simpan gambar dengan nama:
   - `login-bg.jpg` untuk halaman login
   - `register-bg.jpg` untuk halaman register
3. Paste/copy gambar ke folder `public`

### Langkah 3: Format Gambar yang Disarankan

- **Format**: JPG, PNG, atau WebP
- **Ukuran**: Direkomendasikan minimal 1920x1080px untuk kualitas HD
- **Nama file**: Gunakan nama yang sesuai (login-bg.jpg, register-bg.jpg)

## 📝 Cara Menggunakan Gambar

Kode sudah diupdate untuk menggunakan gambar. Gambar akan otomatis muncul jika file ada di folder `public`.

### Contoh Struktur File:

```
public/
├── login-bg.jpg       ← Background halaman login
├── register-bg.jpg    ← Background halaman register
└── logo.png           ← Logo (jika ingin digunakan)
```

### Path Gambar di Kode:

Di Next.js, file di folder `public` bisa diakses dengan path:
- `/login-bg.jpg` (bukan `/public/login-bg.jpg`)
- `/register-bg.jpg` (bukan `/public/register-bg.jpg`)

## ⚙️ Fallback

Jika gambar tidak ditemukan, sistem akan menggunakan gradient biru sebagai fallback. Jadi aplikasi tetap berfungsi meskipun gambar belum diupload.

## 🎨 Tips

1. **Ukuran File**: Usahakan gambar tidak terlalu besar (max 2-3MB) untuk loading cepat
2. **Rasio Aspect**: Gambar landscape (16:9) direkomendasikan
3. **Kualitas**: Gunakan gambar HD untuk tampilan yang lebih baik
4. **Optimasi**: Kompres gambar sebelum upload untuk performa lebih baik

## 🔄 Mengganti Gambar

Untuk mengganti gambar:
1. Hapus gambar lama di folder `public`
2. Masukkan gambar baru dengan nama yang sama (`login-bg.jpg` atau `register-bg.jpg`)
3. Refresh browser (atau restart dev server jika perlu)

## 📌 Contoh Gambar yang Cocok

- Gambar peralatan/alat yang relevan dengan aplikasi
- Gambar workplace/workshop
- Gambar teknologi/manajemen
- Gambar abstract dengan warna biru (sesuai tema)

## 🚀 Setelah Menambahkan Gambar

1. Simpan gambar di folder `public`
2. Refresh halaman login/register di browser
3. Gambar akan muncul otomatis!

---

**Catatan**: Pastikan nama file sesuai dengan yang ada di kode:
- Login: `login-bg.jpg`
- Register: `register-bg.jpg`