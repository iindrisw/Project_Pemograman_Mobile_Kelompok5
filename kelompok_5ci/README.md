# Chikara Bake

Aplikasi pemesanan toko roti (React Native + Expo + Supabase) dengan sistem rekomendasi produk personal berbasis **hybrid filtering**.

## Coba cepat (tanpa install apa pun selain Expo Go)

1. Pasang **Expo Go** di HP (Android: Play Store, iOS: App Store).
2. Scan QR di bawah (Android: dari dalam Expo Go, iOS: dari aplikasi Kamera).

   ![QR Expo Go](docs/qr-expo-go.png)

   > QR ini dibuat saat publikasi. Cara membuat atau memperbaruinya ada di bagian *Membuat QR* di bawah.
3. Daftar akun baru lewat tab **Register**, lalu pilih produk dan checkout.
   Isi saldo dulu di Profile > Saldo & Pembayaran (saldo simulasi, bukan uang sungguhan).

## Fitur
- Login & register (Supabase Auth), peran **user** dan **admin**
- Admin: tambah, ubah, hapus produk (dengan foto). User: lihat menu, keranjang, checkout
- Checkout dengan validasi stok dan saldo (atomik di database), riwayat pesanan, harga dalam rupiah
- Best Sellers dari pembelian semua akun
- **Recommended for You**: rekomendasi personal dari riwayat keranjang dan pesanan (lihat `k5_recommender/`)

## Menjalankan dari source
```bash
npm install
cp .env.example .env      # isi URL & key Supabase milikmu
npx expo start            # scan QR di terminal dengan Expo Go
```
Pakai `npx expo start -c` kalau `.env` baru diubah.

## Menyiapkan Supabase sendiri
1. Buat project di supabase.com, matikan **Confirm email** (Authentication > Sign In / Providers > Email).
2. Buat bucket Storage bernama `produk` (public).
3. Jalankan file di folder `supabase/` berurutan di SQL Editor: `01_auth_roles.sql`, `03_best_seller.sql`, `04_riwayat_pesanan.sql`, `05_saldo.sql`, `06_pembayaran.sql`, `07_rekomendasi.sql`.
   Tabel `products` dan policy Storage perlu dibuat lebih dulu (kolom: `id, nama, harga, deskripsi, kategori, stok, foto_url, created_at`).
4. Akun admin: register dengan username `admin`. Kata sandi admin diberikan terpisah, jangan ditulis di repo.

## Membuat QR Expo Go
**A. Saat laptop menyala (paling mudah):** `npx expo start` lalu foto atau screenshot QR di terminal. QR hanya berlaku selama server hidup dan HP satu jaringan (`--tunnel` kalau beda jaringan).

**B. Tetap aktif tanpa laptop (EAS Update):**
```bash
npm i -g eas-cli
eas login
eas update --branch preview --message "versi uji"
```
Buka halaman proyek di expo.dev, ambil QR atau link update, lalu simpan sebagai `docs/qr-expo-go.png`. Variabel `.env` ikut tertanam saat perintah ini dijalankan.

## Struktur singkat
```
src/screens   layar aplikasi
src/lib       akses Supabase (auth, produk, saldo, pesanan, rekomendasi)
supabase/     skrip SQL
k5_recommender/  pelatihan & evaluasi model rekomendasi (Python)
```

## Tim
Kelompok 5, Pemrograman Mobile. [Sabbicarel edward piris, Indri setiawati, Prama, Farhan]
