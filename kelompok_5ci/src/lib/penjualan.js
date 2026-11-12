import { supabase } from './supabase';

/*
  Checkout: SATU panggilan ke database yang melakukan semuanya sekaligus (atomik):
    - harga dihitung ulang oleh server dari tabel produk (bukan dari aplikasi)
    - stok dicek lalu dikurangi
    - saldo dicek lalu dipotong
    - pesanan dicatat
  Kalau salah satu gagal (stok kurang / saldo kurang), TIDAK ada yang berubah.
  Mengembalikan { nomorPesanan, total, saldo } (saldo = sisa saldo).
*/
export async function buatPesanan(cartItems, catatan) {
  const items = (cartItems || [])
    .filter((i) => i && i.id != null && i.quantity > 0)
    .map((i) => ({ id: String(i.id), jumlah: i.quantity }));
  if (items.length === 0) throw new Error('Keranjang kosong.');

  const { data, error } = await supabase.rpc('buat_pesanan', {
    p_items: items,
    p_catatan: (catatan || '').trim() || null,
  });
  if (error) throw error;
  return {
    nomorPesanan: data.nomor_pesanan,
    total: Number(data.total),
    saldo: Number(data.saldo),
  };
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
