# Perencanaan Teknis: Integrasi Barcode Visual (Code128) & Bluetooth Barcode Scanner (HID)

## 1. Ringkasan & Konteks Proyek
Menambahkan fitur **Barcode Visual (Code128)** pada setiap produk dan dukungan **Bluetooth Barcode Scanner eksternal (mode HID Keyboard)** ke dalam aplikasi POS Expo (React Native) yang berada di direktori `pos/`.

- **Sifat Aplikasi**: Statis / *client-side only* (state produk, keranjang, dan riwayat disimpan secara lokal di React Context & `localStorage` pada Web).
- **Platform Target**: Universal Expo — berjalan di **Expo Go (Android/iOS)** maupun **Web Static Export** (`npm run build:web`).
- **Skenario Utama**:
  1. Setiap produk memiliki kode `barcode` unik dan menampilkan gambar garis barcode (Code128) berlatar putih kontras tinggi agar dapat di-scan langsung dari layar laptop/HP.
  2. Kasir mengarahkan Bluetooth Barcode Scanner (mode HID Keyboard — mengetik karakter cepat diikuti `Enter`) ke gambar barcode atau produk fisik.
  3. Layar Kasir menangkap input barcode, mencocokkan dengan data produk, menambahkan/menambah `qty` di keranjang, menampilkan notifikasi toast singkat, dan otomatis mengembalikan fokus ke input scanner agar siap scan beruntun.

---

## 2. Analisis Struktur Folder & File Codebase Saat Ini

Seluruh source code aplikasi Expo berada di dalam folder `pos/`:

| Path File | Peran Saat Ini | Rencana Perubahan |
| :--- | :--- | :--- |
| `pos/package.json` | Daftar dependency (`expo ~58.0.26`, `react 19.3.0`, `react-native 0.88.1`, `@expo/vector-icons`, `tailwindcss`) & script `build:web`. | Menambahkan library encoder barcode ringan (`jsbarcode`, dan opsional `react-native-svg` jika memakai SVG native). |
| `pos/src/types/index.ts` | Definisi interface `Product`, `CartItem`, `Transaction`, `Category`, `TabType`. | Menambahkan properti `barcode: string` pada interface `Product`. |
| `pos/src/data/initialProducts.ts` | Array `INITIAL_PRODUCTS` berisi 11 produk statis (`prod-1` s.d. `prod-11`). | Menambahkan `barcode` unik (13 digit, contoh `"8991002100018"`) pada setiap item. |
| `pos/src/context/POSContext.tsx` | Mengelola state `products`, `cart`, `transactions`, `localStorage` (`pos_products_v1`), serta fungsi `addToCart`, `updateCartQty`, `addProduct`, `updateProduct`, `deleteProduct`, `resetProducts`. | Menambahkan migrasi/fallback `barcode` saat load `localStorage`, fungsi `findProductByBarcode`, `addToCartByBarcode`, dan auto-generate barcode di `addProduct`. |
| `pos/src/components/Icons.tsx` | Kumpulan komponen ikon berbasis `@expo/vector-icons`. | Menambahkan `BarcodeIcon` (misal `Ionicons` `barcode-outline`). |
| `pos/src/components/BarcodeView.tsx` | *(File Baru)* | Komponen visual pembangkit garis barcode **Code128** berlatar putih terang (`#FFFFFF`) & bar hitam pekat (`#000000`). |
| `pos/src/screens/ProdukScreen.tsx` | Daftar katalog produk + Modal Tambah/Edit Produk (`formName`, `formCategory`, `formPrice`, `formStock`, `formDescription`). | Menampilkan kode & visual barcode pada kartu/detail produk, input `barcode` di form Tambah/Edit, serta modal perbesar/cetak barcode agar mudah di-scan dari layar. |
| `pos/src/screens/KasirScreen.tsx` | Filter kategori, input pencarian manual (`searchQuery`), grid produk, tombol `+ Tambah`, dan floating `bottomBar`. | Menambahkan input khusus **HID Barcode Scanner** (`autoFocus`, `showSoftInputOnFocus={false}`, `blurOnSubmit={false}`), listener `onSubmitEditing`, serta komponen toast notifikasi (hijau sukses / kuning-merah tidak ditemukan). |
| `pos/src/screens/KeranjangScreen.tsx` | Menampilkan `cart` dengan tombol `+` / `-` (`updateCartQty`) dan checkout. | Tidak perlu perubahan besar; verifikasi bahwa item yang masuk via scan barcode langsung sinkron dengan tombol `+` / `-` dan `cartTotalQty`. |

---

## 3. Catatan Arsitektur & Batasan Penting (Wajib Diperhatikan)

1. **Kompatibilitas Universal (Expo Go Mobile + Web Static)**:
   - **DILARANG** menggunakan tag HTML DOM mentah seperti `<svg>`, `<rect>`, `<div>`, atau `<canvas>` karena Expo Go (React Native Fabric) akan *crash* dengan error `View config getter callback for component rect must be a function`.
   - Untuk merender garis barcode Code128: gunakan `jsbarcode` hanya sebagai encoder pola biner (`JsBarcode(obj, value, { format: 'CODE128' })` untuk membaca string `"101100..."` tanpa DOM), lalu render bar menggunakan komponen `<View>` React Native murni (atau `<Svg>`/`<Rect>` dari `react-native-svg` dengan huruf kapital). Pendekatan `<View>` murni dari hasil encoding `jsbarcode` sangat direkomendasikan karena **zero native-module linking issue** dan 100% identik di Expo Go Android/iOS maupun Web Static.
2. **Standar Keterbacaan Barcode di Layar (Screen-Scannable)**:
   - Container barcode **wajib** memiliki background putih solid (`#FFFFFF`), *quiet zone* (padding kiri-kanan minimal `16px–24px`), dan bar hitam pekat (`#000000`) tanpa transparansi agar sensor optik/kamera scanner bisa membaca kontras dari layar laptop/HP.
   - Angka kode barcode dicetak jelas di bawah garis menggunakan font `monospace` dengan `letterSpacing`.
3. **Migrasi Data `localStorage` Lama**:
   - Di `POSContext.tsx`, key `pos_products_v1` mungkin sudah menyimpan array produk lama tanpa field `barcode`. Saat inisialisasi state `products`, lakukan normalisasi/backfill properti `barcode` agar data yang sudah tersimpan di browser tidak bernilai `undefined`.
4. **Konflik Fokus antara Input Scanner & Pencarian Manual**:
   - Di `KasirScreen.tsx` sudah terdapat `<TextInput>` pencarian manual (`searchQuery`).
   - Input scanner HID harus terpisah dari kolom pencarian manual agar saat kasir mengetik nama produk, hasil ketikan tidak dianggap scan barcode, dan saat scan selesai fokus kembali ke input scanner tanpa memunculkan keyboard virtual HP (`showSoftInputOnFocus={false}`).

---

## 4. Tahapan Implementasi Berurutan

### Tahap 1: Instalasi Dependency & Pembuatan Komponen `BarcodeView`
1. Masuk ke folder `pos/` dan pasang `jsbarcode` (library ringan tanpa dependency eksternal untuk menghitung checksum & pola biner Code128):
   ```bash
   cd pos && bun add jsbarcode
   ```
   *(Atau `npm install jsbarcode`).*
2. Tambahkan `BarcodeIcon` di `pos/src/components/Icons.tsx` menggunakan `Ionicons` (`name="barcode-outline"`).
3. Buat file baru `pos/src/components/BarcodeView.tsx`:
   - Props: `value: string`, `width?: number` (lebar per modul bar, default `2`), `height?: number` (default `56`), `showText?: boolean` (default `true`).
   - Gunakan `JsBarcode` ke objek penampung dummy (`const result: any = {}; JsBarcode(result, value, { format: 'CODE128' });`) di dalam `try/catch` untuk mengambil string biner `result.encodings[0].data` (`'1'` = garis hitam, `'0'` = spasi putih).
   - Kelompokkan karakter `'1'` dan `'0'` yang berurutan (Run-Length Encoding) agar jumlah `<View>` minimal dan tajam, lalu render berjejer horizontal (`flexDirection: 'row'`) di dalam wrapper putih solid (`backgroundColor: '#ffffff'`, `paddingHorizontal: 16`, `paddingVertical: 10`).
   - Jika `value` kosong atau invalid, tampilkan fallback teks `"Barcode tidak valid"` tanpa *crash*.

### Tahap 2: Pembaruan Tipe Data, Mock Data, dan `POSContext`
1. **`pos/src/types/index.ts`**:
   - Tambahkan `barcode: string;` ke dalam `interface Product`.
2. **`pos/src/data/initialProducts.ts`**:
   - Tambahkan properti `barcode` unik (format 13 digit string, misalnya `"8991002100018"` s.d. `"8991002100117"`) pada seluruh 11 produk di `INITIAL_PRODUCTS`.
3. **`pos/src/context/POSContext.tsx`**:
   - Buat helper utilitas kecil untuk normalisasi produk saat load dari `localStorage` (`STORAGE_KEYS.PRODUCTS`): jika ada item yang belum punya `barcode`, isi otomatis dari `INITIAL_PRODUCTS` berdasarkan `id` atau generate kode fallback `"8991002..."`.
   - Perbarui `addProduct`: ubah tipe parameter menjadi `Omit<Product, 'id' | 'sku' | 'barcode'> & { barcode?: string }`. Jika `barcode` tidak diisi user, generate otomatis string 13 digit unik.
   - Tambahkan helper/method pada `POSContextType`:
     - `findProductByBarcode(code: string): Product | undefined` — mencocokkan `p.barcode.trim() === code.trim()` (dan bisa fallback cek `p.sku` jika diinginkan, utamakan `p.barcode`).
     - `scanBarcodeToCart(code: string): { success: boolean; product?: Product; reason?: 'empty' | 'not_found' | 'out_of_stock' | 'max_stock' }` — mencari produk berdasarkan `code`, memvalidasi stok (`product.stock <= 0` atau qty keranjang sudah mencapai `product.stock`), lalu memanggil logika penambahan ke `cart` (`qty = 1` jika baru, `+1` jika sudah ada) tanpa memicu `window.alert` yang memblokir alur scan beruntun.

### Tahap 3: Visualisasi & Manajemen Barcode di `ProdukScreen.tsx`
1. **Tampilan Kartu Produk**:
   - Tampilkan label/chip kode `barcode` di bawah atau di samping `sku` (misal dengan `BarcodeIcon` kecil + angka `p.barcode`).
   - Tambahkan tombol aksi **"Barcode"** (ikon barcode) pada setiap kartu produk di `actionRow` (sejajar dengan tombol Edit & Hapus) untuk membuka modal preview barcode berukuran besar.
2. **Modal Preview / Perbesar & Cetak Barcode**:
   - Buat modal khusus saat tombol Barcode pada produk diklik:
     - Menampilkan nama produk, SKU, harga, dan `<BarcodeView value={selectedBarcodeProduct.barcode} width={2.5} height={90} />` di atas kartu putih bersih dengan padding lebar (*quiet zone*) agar mudah langsung di-scan menggunakan alat Bluetooth scanner dari layar laptop atau HP.
     - Pada platform Web (`Platform.OS === 'web'`), sediakan tombol opsional **"Cetak Barcode"** (memanggil `window.print()` atau membuka tampilan siap cetak) dan tombol **"Tutup"**.
3. **Form Tambah / Edit Produk**:
   - Tambahkan state `formBarcode` dan field `TextInput` **"Kode Barcode"** di modal Tambah/Edit Produk (beserta tombol kecil **"Auto"** untuk men-generate nomor barcode acak 13 digit secara instan, serta mendukung input langsung dari scanner ke field tersebut).
   - Simpan `barcode: formBarcode.trim()` pada pemanggilan `addProduct` dan `updateProduct`.

### Tahap 4: Input Bluetooth HID Scanner & Notifikasi Toast di `KasirScreen.tsx`
1. **Input Khusus Scanner (`TextInput` HID Listener)**:
   - Tambahkan state `scanValue`, `isScannerFocused`, dan `scannerInputRef = useRef<TextInput>(null)`.
   - Tambahkan bar/input khusus scanner di bagian atas `KasirScreen` (di atas atau berdampingan rapi dengan kolom pencarian manual):
     - Menampilkan status visual yang jelas: indikator hijau **"Scanner Siap (Auto-Scan Aktif)"** saat fokus aktif, atau tombol/banner **"Klik untuk Aktifkan Scanner"** jika fokus sedang berpindah.
     - Properti `TextInput` scanner:
       - `ref={scannerInputRef}`
       - `value={scanValue}`
       - `onChangeText={setScanValue}`
       - `autoFocus={true}`
       - `showSoftInputOnFocus={false}` *(mencegah keyboard virtual muncul di HP Android/iOS saat alat Bluetooth HID terhubung)*
       - `blurOnSubmit={false}` *(mencegah fokus lepas setelah scanner mengirim tombol Enter)*
       - `returnKeyType="done"`
       - `onSubmitEditing={handleBarcodeSubmit}`
   - Pastikan **tidak mengganggu kolom pencarian manual**:
     - Tambahkan flag/state `isManualSearchFocused` pada `<TextInput>` pencarian manual (`onFocus={() => setIsManualSearchFocused(true)}`, `onBlur={() => setIsManualSearchFocused(false)}`).
     - Saat fokus berada di kolom pencarian manual, jangan tarik fokus paksa ke scanner. Saat kasir menekan tombol aktivasi scanner atau selesai mengedit pencarian manual, fokus dapat dikembalikan ke `scannerInputRef.current?.focus()`.
2. **Handler `handleBarcodeSubmit`**:
   - Ambil nilai `const code = scanValue.trim()`. Langsung kosongkan `setScanValue('')`.
   - Jika `code` kosong, langsung kembalikan fokus dan hentikan proses.
   - Panggil `scanBarcodeToCart(code)` dari `POSContext`.
   - Setelah diproses, jalankan `setTimeout(() => scannerInputRef.current?.focus(), 50)` agar scanner siap menerima tembakan barcode barang berikutnya secara beruntun tanpa menyentuh layar.
3. **Notifikasi Toast / Banner Singkat di `KasirScreen.tsx`**:
   - Tambahkan state `toast: { type: 'success' | 'error' | 'warning'; message: string } | null` dengan auto-hide timer (`useEffect` `setTimeout` 2500ms dan clear timeout saat toast baru muncul agar tidak bertumpuk).
   - **Jika berhasil ditemukan & masuk keranjang**: Tampilkan toast berwarna hijau di bagian atas layar kasir:
     `"✓ [Nama Produk] berhasil dimasukkan ke keranjang"`
   - **Jika stok habis / melebihi stok**: Tampilkan toast peringatan kuning/oranye:
     `"Stok [Nama Produk] habis atau sudah mencapai batas maksimal"`
   - **Jika barcode tidak ditemukan**: Tampilkan toast peringatan/error merah:
     `"Barcode [kode] tidak ditemukan"` (aplikasi tetap berjalan normal tanpa crash atau alert modal yang memblokir).

### Tahap 5: Verifikasi Akhir & Uji Coba
1. **Sinkronisasi Keranjang (`KeranjangScreen.tsx`)**:
   - Uji scan barcode produk yang sama 2–3 kali beruntun di `KasirScreen` $\rightarrow$ buka tab `Keranjang` $\rightarrow$ pastikan produk tergabung dalam 1 baris dengan `qty` bertambah sesuai jumlah scan, dan tombol `+` / `-` tetap mengubah kuantitas & subtotal dengan benar.
2. **Validasi Kode & Build**:
   - Jalankan pengecekan TypeScript (`cd pos && bun x tsc --noEmit`) dan pastikan **0 error**.
   - Jalankan build web statis (`cd pos && bun run build:web`) dan pastikan folder `pos/dist` ter-generate tanpa error.
   - Uji coba alur langsung di Web Browser (simulasi ketik kode barcode di input scanner lalu tekan `Enter`, serta scan gambar barcode dari modal `Produk` menggunakan scanner fisik).

---

## 5. Kriteria Selesai (Acceptance Criteria)
- [ ] Setiap item di `INITIAL_PRODUCTS` memiliki `barcode` unik dan data lama di `localStorage` tetap aman tanpa `undefined`.
- [ ] Komponen `BarcodeView` merender garis barcode **Code128** berlatar putih kontras tinggi yang dapat terbaca alat Bluetooth Barcode Scanner langsung dari layar laptop/HP, dan berjalan tanpa error di Expo Go maupun Web.
- [ ] Halaman `Produk` menampilkan kode & visual barcode pada detail/modal produk (termasuk modal perbesar barcode & input barcode pada form produk baru/edit).
- [ ] Layar `Kasir` memiliki input HID scanner yang otomatis fokus setelah setiap scan tanpa mengganggu input pencarian produk manual.
- [ ] Scan barcode produk yang cocok otomatis menambah item (`qty = 1`, atau `+1` jika sudah ada di keranjang) dan menampilkan toast hijau `"✓ [Nama Produk] berhasil dimasukkan ke keranjang"`.
- [ ] Scan barcode yang tidak terdaftar menampilkan notifikasi `"Barcode [kode] tidak ditemukan"` tanpa crash dan fokus scanner tetap terjaga.
- [ ] `tsc --noEmit` dan `bun run build:web` lulus tanpa error.
