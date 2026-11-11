import { supabase } from './supabase';

// Nomor pesanan unik, mis. #DC-K3F9ZA
export const buatNomorPesanan = () =>
  `#DC-${Date.now().toString(36).slice(-4)}${Math.random().toString(36).slice(2, 4)}`.toUpperCase();

/*
  Simpan pesanan ke tabel "penjualan" (1 baris per produk di keranjang).
  Nama, harga, dan foto DISALIN ke sini, jadi riwayat tidak berubah walau
  produknya nanti diedit atau dihapus.
  Panggil SEKALI saat checkout, hanya kalau berhasil:
    await catatPenjualan(cartItems, { nomorPesanan, catatan });
*/
export async function catatPenjualan(cartItems, { nomorPesanan, catatan } = {}) {
  const baris = (cartItems || [])
    .filter((i) => i && i.id != null && i.quantity > 0)
    .map((i) => ({
      product_id: String(i.id),
      jumlah: i.quantity,
      nomor_pesanan: nomorPesanan || null,
      nama: i.name,
      harga: i.price,
      foto_url: i.image || null,
      catatan: (catatan || '').trim() || null,
    }));
  if (baris.length === 0) return;

  const { error } = await supabase.from('penjualan').insert(baris);
  if (error) throw error;
}

/*
  Riwayat pesanan milik akun yang sedang login, terbaru di atas.
  Baris dengan nomor pesanan yang sama digabung jadi satu pesanan.
*/
export async function ambilRiwayatPesanan() {
  const { data: sesi } = await supabase.auth.getSession();
  const user = sesi?.session?.user;
  if (!user) return [];

  const { data, error } = await supabase
    .from('penjualan')
    .select('id, nomor_pesanan, nama, harga, foto_url, jumlah, catatan, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .order('id', { ascending: true })
    .limit(300);
  if (error) throw error;

  const peta = new Map();
  for (const r of data || []) {
    const kunci = r.nomor_pesanan || `baris-${r.id}`;
    if (!peta.has(kunci)) {
      peta.set(kunci, {
        kunci,
        id: r.nomor_pesanan || '',
        tanggal: r.created_at,
        catatan: r.catatan,
        items: [],
        total: 0,
      });
    }
    const o = peta.get(kunci);
    const harga = Number(r.harga) || 0;
    o.items.push({ nama: r.nama || 'Produk', jumlah: r.jumlah, harga, foto: r.foto_url });
    o.total += harga * r.jumlah;
  }
  return [...peta.values()];
}

/*
  Id produk terlaris dari SEMUA akun, urut dari yang paling banyak dibeli.
  Dihitung di database (fungsi produk_terlaris), jadi menjumlahkan semua user.
*/
export async function ambilIdTerlaris(batas = 6) {
  const { data, error } = await supabase.rpc('produk_terlaris', { batas });
  if (error) throw error;
  return (data || []).map((r) => String(r.product_id));
}
