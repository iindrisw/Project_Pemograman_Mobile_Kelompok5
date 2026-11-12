# k5_recommender: hybrid filtering Chikara Bake

Model rekomendasi produk personal dari **riwayat keranjang** dan **riwayat pesanan**.

## Cara kerja singkat
- Tiap pasangan (user, produk) diberi bobot: tambah ke keranjang = 1, dibeli = 3 (dijumlahkan; pembelian berulang memakai `1 + ln(jumlah)`).
- Produk diubah jadi vektor konten: TF-IDF (nama + deskripsi) + one-hot kategori.
- Model **BPR dengan embedding**:
  `vektor_item(i) = E[i] + F[i]·W`, `skor(u,i) = P[u]·vektor_item(i) + b[i]`
  - `E[i]`: embedding bebas hasil perilaku (collaborative)
  - `F[i]·W`: embedding dari fitur konten (content-based)
  - Gabungan keduanya = hybrid. Produk baru yang belum pernah dibeli tetap punya skor lewat `F[i]·W`.

## Menjalankan
```bash
cd k5_recommender
pip install -r requirements.txt

# 1) Uji pipeline dengan data SINTETIS (bukan hasil penelitian)
python train.py --source synthetic

# 2) Data asli
python train.py --source csv --data-dir data/real
```

### Menyiapkan data asli
Di Supabase > SQL Editor, jalankan tiap query lalu klik **Download CSV**, simpan di `k5_recommender/data/real/`:

| File | Query |
|---|---|
| `products.csv` | `select id, nama, kategori, deskripsi, harga from products;` |
| `penjualan.csv` | `select user_id, product_id, jumlah, created_at from penjualan;` |
| `keranjang_log.csv` | `select user_id, product_id, aksi, created_at from keranjang_log;` |

Data pribadi: `user_id` hanya berupa kode acak, tapi jangan unggah CSV mentah ke repo publik.

## Evaluasi (untuk laporan / jurnal)
- **Precision@5** = rata-rata (jumlah produk relevan di 5 teratas / 5)
- **Recall@5** = rata-rata (jumlah produk relevan di 5 teratas / jumlah produk relevan user)
- Produk yang sudah ada di data training tidak ikut direkomendasikan.
- Dibandingkan dengan 3 baseline: **Popularity**, **Content-only** (cosine), **CF-only** (BPR tanpa fitur konten). Selisih Hybrid vs CF-only adalah ablation untuk menunjukkan kontribusi komponen konten.
- Dua skenario:
  - `standar`: 20% interaksi terakhir tiap user disembunyikan (split berdasarkan waktu)
  - `item_baru`: 20% produk disembunyikan seluruhnya dari training (cold-start item)
- Hasil dirata-rata dari beberapa seed (`--seeds`, default 5) beserta simpangan baku.
- `--target beli` menganggap hanya pembelian sebagai item relevan (lebih ketat dari `semua`).

## Hasil & batasan yang jujur
- Angka dari `--source synthetic` hanya membuktikan kode berjalan. Pembangkit data sintetis dibuat dari selera berbasis kategori dan rasa, jadi **tidak boleh dilaporkan sebagai hasil penelitian**.
- Data kelompok sendiri akan kecil. Kumpulkan data sebanyak mungkin (mis. minta 30 sampai 50 teman mencoba aplikasi lewat QR Expo Go dan berbelanja), lalu laporkan juga jumlah user, produk, dan interaksi. Hasil data kecil punya simpangan baku besar, jadi tampilkan mean ± std.
- Pengaturan yang bisa dibahas di paper: `--dim`, `--reg`, `--lr`, `--epochs`, bobot keranjang vs pembelian (`W_KERANJANG`, `W_BELI` di `train.py`).

## Memasukkan hasil ke aplikasi
1. `train.py` menulis `artifacts/<sumber>/rekomendasi.csv` (kolom: `user_id, product_id, rank, skor, strategi`).
2. Di Supabase jalankan `truncate public.rekomendasi;` lalu import CSV lewat **Table Editor > rekomendasi > Insert > Import data from CSV**.
3. Buka Home di aplikasi: bagian **Recommended for You** muncul untuk user yang punya riwayat.
   User baru (tanpa riwayat) tidak melihat bagian itu; mereka tetap melihat Best Sellers.
