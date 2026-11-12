import { supabase } from './supabase';
import { hitungRekomendasi } from './modelRekomendasi';

/*
  Dipanggil tombol "Update Rekomendasi" (admin) di ProfileScreen.
  Alur: ambil data semua akun (RPC admin_data_latih) -> latih model di HP ->
  simpan hasilnya ke tabel rekomendasi (RPC admin_simpan_rekomendasi).
  Kedua RPC menolak non-admin di sisi database (lihat supabase/08_latih_rekomendasi.sql).
*/
export async function latihDanSimpanRekomendasi() {
  const { data, error } = await supabase.rpc('admin_data_latih');
  if (error) throw new Error(error.message || 'Gagal mengambil data latih.');

  // Beri kesempatan layar menampilkan indikator loading sebelum perhitungan berjalan.
  await new Promise((resolve) => setTimeout(resolve, 50));
  const { rows, ringkasan } = hitungRekomendasi(data);

  const { error: errSimpan } = await supabase.rpc('admin_simpan_rekomendasi', { p_rows: rows });
  if (errSimpan) throw new Error(errSimpan.message || 'Gagal menyimpan rekomendasi.');

  return ringkasan;
}
