# Issue 02: Migrasi Data Statis POS ke Backend Hono D1 (Products & Transactions)

## Konteks & Tujuan
Mengganti seluruh data statis (*mock/hardcoded array/local state*) pada aplikasi POS **Expo** agar terhubung secara *real-time* ke database **Cloudflare D1** melalui backend **Hono**.
Skema database Hono D1 terdiri dari 5 tabel utama:
1. `users`
2. `sessions`
3. `products`
4. `transaction` (header transaksi penjualan)
5. `transaction_items` (detail item barang per transaksi)

## Aturan Wajib untuk AI Agent
1. **Cocokkan Skema & Endpoint Backend:** Periksa file skema SQL (`schema.sql`) dan file rute Hono (`products` dan `transaction` / `transactions`) di folder backend sebelum menulis service di Expo agar nama kolom (`id`, `name`, `price`, `stock`, `total_amount`, `payment_method`, `product_id`, `quantity`, `subtotal`, dll.) 100% identik.
2. **Gunakan `apiFetch` dari Issue 01:** Seluruh request ke API wajib melewati `src/services/api.ts` agar header `Authorization: Bearer <token>` selalu terkirim.
3. **Hapus Total Data Statis:** Hapus atau kosongkan seluruh file mock data setelah terhubung ke API agar tidak ada data statis yang tersisa atau tercampur.
4. **Wajib 3 Status UI:** Setiap layar yang memuat data API harus menangani status **Loading**, **Error + Tombol Retry**, dan **Empty State**.

---

## Langkah Pengerjaan (Kerjakan Berurutan)

### Langkah 1: Audit File Data Statis di Proyek Expo
- Pindai folder `app/`, `src/`, `components/`, `constants/`, `data/`, `hooks/`, dan `store/`.
- Identifikasi semua komponen yang masih mengimpor array produk statis, riwayat transaksi statis, atau menyimpan transaksi baru hanya ke state lokal/AsyncStorage tanpa dikirim ke backend Hono.

### Langkah 2: Buat Product Service (`src/services/productService.ts`)
- Definisikan interface `Product` sesuai kolom tabel `products` di D1.
- Buat fungsi pemanggil endpoint produk Hono:
  - `getProducts(search?: string)`: mengambil daftar produk aktif dari tabel `products`.
  - `createProduct(payload)`: menambah produk baru (jika fitur kelola produk tersedia di UI).
  - `updateProduct(id, payload)`: memperbarui data/stok produk.
  - `deleteProduct(id)`: menghapus produk.

### Langkah 3: Buat Transaction Service (`src/services/transactionService.ts`)
- Definisikan interface `Transaction` dan `TransactionItem` sesuai kolom tabel `transaction` dan `transaction_items` di D1.
- Buat fungsi pemanggil endpoint transaksi Hono:
  - `createTransaction(payload)`: mengirim header transaksi (metode bayar, total bayar, kembalian/catatan) beserta daftar `items` (`product_id`, `quantity`, `price` / `subtotal`) untuk disimpan ke tabel `transaction` dan `transaction_items` sekaligus mengurangi stok di tabel `products`.
  - `getTransactions()`: mengambil daftar riwayat transaksi dari tabel `transaction`.
  - `getTransactionDetail(id)`: mengambil rincian item dari tabel `transaction_items` berdasarkan ID transaksi.

### Langkah 4: Hubungkan Layar Kasir, Produk & Riwayat Transaksi
- **Layar Kasir (`KasirScreen` / halaman POS utama):**
  - Muat daftar produk dari `getProducts()` saat halaman dibuka.
  - Validasi jumlah item di keranjang agar tidak melebihi nilai `stock` produk dari server.
  - Saat tombol **Bayar / Checkout** ditekan:
    - Tampilkan loading pada tombol pembayaran dan cegah klik ganda.
    - Kirim data keranjang ke `createTransaction()`.
    - Jika sukses, tampilkan ringkasan struk, kosongkan keranjang belanja, dan panggil ulang `getProducts()` agar tampilan stok produk langsung terbarui.
    - Jika gagal, tampilkan pesan error dari server tanpa menghapus isi keranjang kasir.
- **Layar Manajemen Produk (jika ada):**
  - Sambungkan form tambah/edit/hapus produk ke `productService.ts` dan muat ulang daftar setelah perubahan berhasil.
- **Layar Riwayat Transaksi:**
  - Ganti daftar transaksi statis dengan `getTransactions()` dan sambungkan modal/halaman detail struk ke `getTransactionDetail(id)`.

### Langkah 5: Bersihkan Mock Data & Verifikasi Build
- Hapus file data statis lama yang sudah tidak terpakai dan pastikan tidak ada lagi `import` ke file mock tersebut.
- Jalankan `bunx tsc --noEmit` hingga **0 error**.
- Jalankan `npx expo export --platform web` untuk memastikan seluruh aplikasi siap di-deploy ke Cloudflare Workers.

## Kriteria Penerimaan
- [ ] Daftar produk di layar kasir diambil langsung dari tabel `products` di D1 melalui backend Hono.
- [ ] Proses checkout menyimpan data ke tabel `transaction` dan `transaction_items`, serta memperbarui sisa `stock` produk secara akurat.
- [ ] Riwayat transaksi dan detail item struk menampilkan data asli dari database D1.
- [ ] Tidak ada lagi data statis (*dummy/mock*) yang digunakan di komponen produksi.
- [ ] `bunx tsc --noEmit` dan `npx expo export --platform web` selesai tanpa error.