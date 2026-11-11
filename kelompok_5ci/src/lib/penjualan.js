import { supabase } from './supabase';

/*
  Catat pembelian ke tabel "penjualan" (1 baris per produk di keranjang).
  Panggil SEKALI saat pesanan benar-benar selesai (checkout berhasil), mis.:
    await catatPenjualan(cartItems);
  cartItems = isi keranjang: [{ id, quantity, ... }]
*/
export async function catatPenjualan(cartItems) {
  const baris = (cartItems || [])
    .filter((i) => i && i.id != null && i.quantity > 0)
    .map((i) => ({ product_id: String(i.id), jumlah: i.quantity }));
  if (baris.length === 0) return;

  const { error } = await supabase.from('penjualan').insert(baris);
  if (error) throw error;
}

/*
  Id produk terlaris dari SEMUA akun, urut dari yang paling banyak dibeli.
  Penghitungan dilakukan di database (fungsi produk_terlaris), jadi hasilnya
  menjumlahkan pembelian semua user, bukan hanya akun yang sedang login.
*/
export async function ambilIdTerlaris(batas = 6) {
  const { data, error } = await supabase.rpc('produk_terlaris', { batas });
  if (error) throw error;
  return (data || []).map((r) => String(r.product_id));
}
