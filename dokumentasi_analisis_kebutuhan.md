# DOKUMENTASI ANALISIS KEBUTUHAN SISTEM

**Proyek:** Aplikasi Mobile "Dapur Chikara"  
**Metode Pengumpulan Data:** Wawancara Klien (Arif Nur Shidiq)  
**Analis/Developer:** kelompok 5
**Pencatatan:** Sabbicarel Edward Piris

---

## 1. Ringkasan Hasil Wawancara Stakeholder

Berdasarkan sesi pengumpulan data dengan pihak pemilik Dapur Chikara, beberapa poin utama terkait kebutuhan sistem dan preferensi pengguna telah diidentifikasi sebagai berikut:

*   **Identitas Merek (Branding) di Awal Aplikasi:** Klien menginginkan agar pelanggan langsung mengenali Dapur Chikara sebagai *Artisanal Bakery* sesaat setelah membuka aplikasi. 
*   **Katalog dan Penemuan Produk:** Sistem diharapkan memiliki halaman beranda utama yang menampilkan seluruh kategori menu secara terstruktur. Selain itu, klien secara spesifik meminta adanya halaman terpisah untuk produk-produk terbaru (*New Arrivals*) agar lebih mudah disorot dan dipromosikan.
*   **Manajemen Akun dan Keamanan:** sistem diharapkan memiliki fitur pembelian/payment, Untuk mempermudah kelancaran transaksi maka dibuat lah user harus memiliki akun.   Sistem juga harus mengakomodasi pelanggan untuk mengelola profil pribadi dan menyimpan daftar alamat pengiriman mereka.
*   **Kenyamanan Pengalaman Pengguna (UI/UX):** Mengingat target pasar sering kali menelusuri menu makanan di malam hari kami berdiskusi dengan klient untuk menambahkan fitur mode malam

---

## 2. Pemetaan Kebutuhan (Requirement Mapping)

Berdasarkan ringkasan poin-poin hasil wawancara di atas, kebutuhan bisnis klien diterjemahkan secara langsung ke dalam arsitektur aplikasi (layar/ *screens*) sebagai berikut:

| Kebutuhan Bisnis (Dari Wawancara) | Implementasi Fitur / Nama Screen | Deskripsi Fungsionalitas |
| :--- | :--- | :--- |
| Menampilkan identitas *Artisanal Bakery*, nilai *Fresh, Tasty, Natural*, serta profil toko (*About Us*). | **`OnboardingScreen.js`** | Layar sambutan dengan animasi/scroll yang berisi profil *brand*, *tagline* "Freshly Baked", dan visualisasi *Venn Diagram* dari nilai jual toko. |
| Menampilkan semua kategori menu dan produk secara menyeluruh. | **`HomeScreen.js`** | Halaman beranda utama yang menampilkan daftar produk dan kategori untuk dieksplorasi oleh pengguna. |
| Menyoroti produk terbaru atau promosi khusus. | **`NewArrivalsScreen.js`** | Halaman khusus yang memfilter dan menampilkan daftar produk yang baru rilis dari oven. |
| Pendaftaran akun untuk keamanan dan kemudahan transaksi lanjutan. | **`Login.js` & `Signup.js`** | Halaman autentikasi bagi pengguna baru untuk mendaftar, dan pengguna lama untuk masuk ke dalam sistem. |
| Pengaturan data diri dan manajemen pengiriman. | **`ProfileScreen.js` & `Address.js`** | Halaman untuk mengubah data profil pengguna dan menyimpan/mengedit daftar alamat pengiriman (*Delivery Address*). |
| Menampilkan riwayat transaksi dan pesanan pengguna. | **`MyOrders.js`** | Halaman yang menampilkan daftar pesanan yang sedang diproses maupun yang sudah selesai. |
| Tampilan yang nyaman untuk penggunaan di malam hari (*Eye-friendly*). | **`ThemeContext.js`** (Global Theme) | Implementasi *Global State* untuk fitur *Light/Dark Mode* yang mengubah warna latar dan teks secara otomatis di seluruh *screen* aplikasi. |
