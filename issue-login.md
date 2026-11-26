# Issue 01: Implementasi Fitur Login & Manajemen Sesi (Expo PWA + Hono Backend)

## Konteks & Tujuan
Membangun sistem autentikasi penuh pada aplikasi frontend **Expo (SDK 52 / React Native + Expo Web PWA)** yang terhubung ke tabel **`users`** dan **`sessions`** pada backend **Hono (Cloudflare Workers + D1)**.

## Aturan Wajib untuk AI Agent
1. **Periksa Endpoint Backend Terlebih Dahulu:** Sebelum membuat kode di Expo, baca file rute autentikasi pada folder backend Hono (misalnya `/api/login`, `/api/logout`, `/api/me` atau sesuai rute yang tersedia) untuk memastikan nama path URL, HTTP method, nama field request, dan bentuk response JSON 100% cocok.
2. **Kompatibel dengan Expo Web (PWA) & Native:** Jangan langsung memanggil `expo-secure-store` tanpa pengecekan platform karena akan menyebabkan error di browser PWA. Gunakan abstraksi penyimpanan token (`Platform.OS === 'web'` memakai `localStorage`, selain web memakai `AsyncStorage` atau `expo-secure-store`).
3. **Tanpa Data Akun Hardcoded:** Hapus semua simulasi login statis atau bypass user dummy.

---

## Langkah Pengerjaan (Kerjakan Berurutan)

### Langkah 1: Konfigurasi Environment & Penyimpanan Token (`src/utils/tokenStorage.ts`)
- Pastikan file `.env` berisi `EXPO_PUBLIC_API_URL=https://api.belajarastrojs.workers.dev`.
- Buat modul `src/utils/tokenStorage.ts` yang mengekspor 3 fungsi asinkron:
  - `getToken(): Promise<string | null>`
  - `saveToken(token: string): Promise<void>`
  - `removeToken(): Promise<void>`
- Gunakan `window.localStorage` saat `Platform.OS === 'web'`, dan `@react-native-async-storage/async-storage` (atau `expo-secure-store`) untuk platform native.

### Langkah 2: Buat HTTP Client Terpusat (`src/services/api.ts`)
- Buat fungsi pembungkus `apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T>` menggunakan `fetch` bawaan:
  - Mengambil base URL dari `process.env.EXPO_PUBLIC_API_URL`.
  - Otomatis membaca token lewat `getToken()` dan menyisipkan header `Authorization: Bearer <token>` jika token tersedia.
  - Menyisipkan header `Content-Type: application/json`.
  - Jika status response `401 Unauthorized`, otomatis panggil `removeToken()` agar sesi lokal dibersihkan.
  - Jika `!response.ok`, ambil pesan error dari JSON response backend dan lempar sebagai `new Error(message)`.

### Langkah 3: Buat Auth Service & Auth Context (`src/services/authService.ts` & `src/context/AuthContext.tsx`)
- Di `authService.ts`, sesuaikan tipe data `User` dengan kolom tabel `users` di D1 (`id`, `nama` / `name`, `email`, dll.) dan buat fungsi:
  - `login(email, password)`: mengirim request ke endpoint login Hono, menyimpan session token via `saveToken()`, dan mengembalikan data user.
  - `getCurrentUser()`: memanggil endpoint profil/sesi aktif (`/api/me`) untuk memvalidasi token di tabel `sessions`.
  - `logout()`: memanggil endpoint logout Hono untuk menghapus sesi di database D1, lalu memanggil `removeToken()`.
- Di `AuthContext.tsx`, kelola state global `user`, `isLoading`, `signIn`, dan `signOut`:
  - Saat aplikasi pertama kali dibuka, jalankan `getCurrentUser()` untuk mengecek apakah token sesi masih valid di server.

### Langkah 4: Bangun Halaman Login & Proteksi Rute
- Buat atau perbarui layar `LoginScreen` (atau `app/login.tsx`):
  - Input **Email** (`autoCapitalize="none"`, `keyboardType="email-address"`) dan **Password** (`secureTextEntry` + tombol tampilkan/sembunyikan sandi).
  - Validasi input kosong sebelum mengirim request.
  - Tampilkan indikator loading (`ActivityIndicator`) pada tombol masuk dan nonaktifkan tombol selama request berlangsung agar tidak terjadi pengiriman ganda.
  - Tampilkan pesan error yang jelas di layar jika email/password salah atau koneksi gagal.
- Terapkan **Route Guard**:
  - Jika `user === null` dan `isLoading === false`, arahkan pengguna ke halaman Login.
  - Jika `user !== null`, arahkan langsung ke layar utama kasir/dashboard POS dan sediakan tombol **Logout** yang memanggil `signOut()`.

### Langkah 5: Verifikasi Kompilasi
- Jalankan `bunx tsc --noEmit` untuk memastikan tidak ada error TypeScript.
- Jalankan `npx expo export --platform web` untuk memastikan kode login tidak bermasalah saat dibundel untuk PWA.

## Kriteria Penerimaan
- [ ] Login berhasil memverifikasi kredensial ke tabel `users` dan membuat sesi baru di tabel `sessions` lewat backend Hono.
- [ ] Refresh browser pada mode PWA tetap mempertahankan status login selama token di tabel `sessions` masih valid.
- [ ] Token kedaluwarsa atau tidak valid (`401`) otomatis membersihkan sesi lokal dan mengembalikan pengguna ke layar Login.
- [ ] Tombol Logout menghapus sesi di backend Hono dan mengarahkan kembali ke halaman Login.