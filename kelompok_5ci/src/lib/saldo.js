import { supabase } from './supabase';

// 1250000 -> "Rp 1.250.000"
export const formatRupiah = (n) =>
  `Rp ${Math.round(Number(n) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

// "1250000" -> "1.250.000" (untuk isi kolom input)
export const formatTitik = (digits) =>
  String(digits || '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/* Saldo akun yang sedang login (0 kalau belum pernah isi). */
export async function ambilSaldo() {
  const { data: sesi } = await supabase.auth.getSession();
  const user = sesi?.session?.user;
  if (!user) return 0;

  const { data, error } = await supabase
    .from('dompet')
    .select('saldo')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw error;
  return Number(data?.saldo) || 0;
}

/* Tambah saldo. Mengembalikan saldo terbaru. */
export async function isiSaldo(jumlah, metode) {
  const { data, error } = await supabase.rpc('isi_saldo', {
    p_jumlah: jumlah,
    p_metode: metode || null,
  });
  if (error) throw error;
  return Number(data) || 0;
}

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
export const formatWaktu = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dua = (n) => String(n).padStart(2, '0');
  return `${dua(d.getDate())} ${BULAN[d.getMonth()]} ${d.getFullYear()} · ${dua(d.getHours())}:${dua(d.getMinutes())}`;
};

/* Mutasi saldo (isi saldo = plus, bayar pesanan = minus), terbaru di atas. */
export async function ambilRiwayatSaldo(batas = 30) {
  const { data, error } = await supabase
    .from('riwayat_saldo')
    .select('id, jumlah, metode, created_at')
    .order('created_at', { ascending: false })
    .limit(batas);
  if (error) throw error;
  return (data || []).map((r) => ({
    id: r.id,
    jumlah: Number(r.jumlah),
    metode: r.metode || 'Isi saldo',
    waktu: r.created_at,
  }));
}
