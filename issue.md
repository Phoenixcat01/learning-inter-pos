# Project Planning: Point of Sale (POS) Web App

## 1. Ringkasan Proyek
Membangun aplikasi POS (Point of Sale) berbasis **Web Static** menggunakan framework **Expo** (React Native for Web) dan **Tailwind CSS** (NativeWind). Aplikasi difokuskan pada antarmuka kasir yang cepat, pengelolaan keranjang, katalog produk, dan pencatatan riwayat transaksi secara lokal (mock/client-side storage).

---

## 2. Tech Stack & Kebutuhan Dasar
- **Framework**: Expo (React Native dengan dukungan Web)
- **Styling**: Tailwind CSS (via NativeWind / Tailwind setup untuk Expo Web)
- **Target Output**: Static Web Export (menghasilkan static asset yang siap di-hosting tanpa butuh server Node.js aktif)
- **Data & State**: In-memory state / Local Storage (Mock data untuk produk, keranjang, dan riwayat transaksi)

---

## 3. Fitur & Modul Utama
Aplikasi memiliki 5 menu/fitur navigasi utama:

1. **Kasir**
   - Menampilkan grid/katalog produk yang siap dijual.
   - Fitur pencarian cepat dan filter kategori sederhana.
   - Tombol cepat untuk memasukkan produk ke dalam keranjang.

2. **Keranjang**
   - Menampilkan daftar produk yang sedang dipilih beserta kuantitas dan subtotal.
   - Pengaturan jumlah pesanan (+ / - / hapus item).
   - Kalkulasi otomatis total harga belanja.
   - Tombol checkout untuk menyelesaikan pesanan.

3. **Riwayat**
   - Menampilkan daftar transaksi yang sudah berhasil di-checkout.
   - Menampilkan ringkasan transaksi (tanggal/jam, ID nota, item terjual, total bayar).

4. **Produk**
   - Menampilkan katalog produk lengkap (nama, kategori, harga, stok).
   - Form/modal sederhana untuk menambah atau memperbarui produk.

5. **Lainnya (Placeholder)**
   - Menu penampung untuk kebutuhan mendatang (pengaturan, info toko, dsb).
   - Status saat ini: Tampilan *empty state* / placeholder bersih.

---

## 4. Rencana Tahapan Implementasi (High-Level Steps)

### Tahap 1: Inisialisasi Proyek & Konfigurasi
- Inisialisasi project Expo baru di direktori kerja.
- Setup Tailwind CSS (NativeWind) dan pastikan styling berfungsi pada target web.
- Pastikan konfigurasi static web export Expo berjalan dengan baik.

### Tahap 2: Struktur Layout & Navigasi
- Buat layout dasar yang rapi dan responsif (sidebar atau bottom tab navigasi).
- Hubungkan navigasi ke 5 halaman utama: **Kasir**, **Keranjang**, **Riwayat**, **Produk**, dan **Lainnya**.

### Tahap 3: Mock Data & Global State
- Siapkan mock data awal (katalog produk contoh dan kategori).
- Buat state management sederhana (Context/Zustand) untuk:
  - Menyimpan item di keranjang belanja.
  - Menyimpan data riwayat transaksi saat checkout berhasil.
  - Menyimpan daftar produk aktif.

### Tahap 4: Implementasi Alur Antarmuka
- Hubungkan halaman **Kasir** dengan aksi tambah ke **Keranjang**.
- Buat alur checkout di **Keranjang** yang mencatat transaksi ke **Riwayat**.
- Tampilkan daftar riwayat transaksi di halaman **Riwayat**.
- Sediakan antarmuka manajemen produk dasar di halaman **Produk**.
- Buat halaman kosong informatif untuk halaman **Lainnya**.

### Tahap 5: Finalisasi & Build Web Static
- Validasi fungsionalitas end-to-end (pilih produk -> keranjang -> bayar -> cek riwayat).
- Jalankan perintah static export (`npx expo export --platform web`) dan uji coba hasil build statis di web server lokal.

---

## 5. Kriteria Selesai (Acceptance Criteria)
- [ ] Project Expo berhasil dibuat dan dapat dijalankan di web (`npx expo start --web`).
- [ ] Styling Tailwind teraplikasi secara konsisten di seluruh layar.
- [ ] Navigasi ke 5 menu berfungsi normal.
- [ ] Alur transaksi dari Kasir hingga tersimpan di Riwayat berjalan tanpa error.
- [ ] Aplikasi berhasil diekspor menjadi web statis siap saji.
