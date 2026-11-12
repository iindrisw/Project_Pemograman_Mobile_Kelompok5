import { supabase } from './supabase';

/*
  Catat "tambah ke keranjang" sebagai bahan model rekomendasi (hybrid filtering).
  Fire-and-forget: tidak pernah mengganggu alur belanja. Kalau belum login atau
  tabel belum ada, diam saja.
*/
export function catatKeranjang(productId) {
  if (productId == null) return;
  supabase.auth
    .getSession()
    .then(({ data }) => {
      if (!data?.session) return null;
      return supabase.from('keranjang_log').insert({ product_id: String(productId), aksi: 'tambah' });
    })
    .catch(() => {});
}

/*
  Id produk rekomendasi untuk akun yang sedang login, urut dari yang paling cocok.
  Hasilnya dihitung offline oleh k5_recommender/train.py lalu disimpan di tabel rekomendasi.
  Kosong = user belum punya riwayat / model belum dilatih -> bagian ini disembunyikan.
*/
export async function ambilIdRekomendasi(batas = 6) {
  const { data: sesi } = await supabase.auth.getSession();
  const user = sesi?.session?.user;
  if (!user) return [];

  const { data, error } = await supabase
    .from('rekomendasi')
    .select('product_id, rank')
    .eq('user_id', user.id)
    .order('rank', { ascending: true })
    .limit(batas);
  if (error) throw error;
  return (data || []).map((r) => String(r.product_id));
}
