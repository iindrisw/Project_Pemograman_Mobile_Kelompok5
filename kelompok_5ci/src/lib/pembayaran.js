// Simpan di src/lib/pembayaran.js
// Helper untuk tabel public.payment_methods.
// Nomor kartu penuh dan CVV TIDAK dikirim ke database; hanya brand, 4 digit terakhir, dan masa berlaku.
import { supabase } from './supabase';

export const keMetode = (r) => ({
  id: r.id,
  holder: r.holder_name,
  brand: r.brand,
  last4: r.last4,
  expMonth: r.exp_month,
  expYear: r.exp_year,
  country: r.billing_country,
  zip: r.zip,
  isDefault: r.is_default,
});

// Validasi checksum nomor kartu (algoritma Luhn)
export const luhnValid = (digits) => {
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = Number(digits[i]);
    if (dbl) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    dbl = !dbl;
  }
  return digits.length > 0 && sum % 10 === 0;
};

export const deteksiBrand = (digits) => {
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2(2[2-9][1-9]|2[3-9]|[3-6]|7[01]|720))/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  return 'Card';
};

const pesanError = (error) => {
  if (error?.code === '42501' || /row-level security/i.test(error?.message || '')) {
    return new Error('Kamu harus login dulu untuk mengelola metode pembayaran.');
  }
  if (error?.code === '42P01') {
    return new Error('Tabel payment_methods belum dibuat. Jalankan file SQL di Supabase dulu.');
  }
  return error;
};

export const ambilMetodeBayar = async () => {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw pesanError(error);
  return data.map(keMetode);
};

// f = { holder, number (hanya angka), expMonth, expYear, country, zip, isDefault }
export const tambahMetodeBayar = async (f) => {
  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      holder_name: f.holder.trim(),
      brand: deteksiBrand(f.number),
      last4: f.number.slice(-4),
      exp_month: f.expMonth,
      exp_year: f.expYear,
      billing_country: f.country,
      zip: f.zip?.trim() || null,
      is_default: !!f.isDefault,
    })
    .select()
    .single();
  if (error) throw pesanError(error);
  return keMetode(data);
};

// Edit hanya data yang tersimpan: nama, masa berlaku, negara, ZIP, default.
// Nomor kartu tidak bisa diubah (tidak disimpan); hapus lalu tambah kartu baru.
export const updateMetodeBayar = async (id, f) => {
  const { data, error } = await supabase
    .from('payment_methods')
    .update({
      holder_name: f.holder.trim(),
      exp_month: f.expMonth,
      exp_year: f.expYear,
      billing_country: f.country,
      zip: f.zip?.trim() || null,
      is_default: !!f.isDefault,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw pesanError(error);
  return keMetode(data);
};

export const jadikanDefaultMetode = async (id) => {
  const { error } = await supabase.from('payment_methods').update({ is_default: true }).eq('id', id);
  if (error) throw pesanError(error);
};

export const hapusMetodeBayar = async (id) => {
  const { error } = await supabase.from('payment_methods').delete().eq('id', id);
  if (error) throw pesanError(error);
};