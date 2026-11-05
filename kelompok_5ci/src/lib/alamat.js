// Simpan di src/lib/alamat.js
// Helper untuk tabel public.addresses (RLS: tiap user hanya melihat miliknya).
import { supabase } from './supabase';

// Baris DB -> bentuk item untuk screen
export const keAlamat = (r) => ({
  id: r.id,
  label: r.label,
  name: r.full_name,
  phone: r.phone,
  street: r.street,
  apt: r.apt,
  city: r.city,
  state: r.state,
  zip: r.zip,
  country: r.country,
  note: r.note,
  isDefault: r.is_default,
});

const pesanError = (error) => {
  if (error?.code === '42501' || /row-level security/i.test(error?.message || '')) {
    return new Error('Kamu harus login dulu untuk mengelola alamat.');
  }
  if (error?.code === '42P01') {
    return new Error('Tabel addresses belum dibuat. Jalankan file SQL di Supabase dulu.');
  }
  return error;
};

export const ambilAlamat = async () => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw pesanError(error);
  return data.map(keAlamat);
};

// user_id diisi otomatis oleh database (default auth.uid())
export const tambahAlamat = async (f) => {
  const { data, error } = await supabase
    .from('addresses')
    .insert({
      label: f.label,
      full_name: f.name.trim(),
      phone: f.phone.trim(),
      street: f.street.trim(),
      apt: f.apt?.trim() || null,
      city: f.city.trim(),
      state: f.state,
      zip: f.zip.trim(),
      country: f.country,
      note: f.note?.trim() || null,
      is_default: !!f.isDefault,
    })
    .select()
    .single();
  if (error) throw pesanError(error);
  return keAlamat(data);
};

export const updateAlamat = async (id, f) => {
  const { data, error } = await supabase
    .from('addresses')
    .update({
      label: f.label,
      full_name: f.name.trim(),
      phone: f.phone.trim(),
      street: f.street.trim(),
      apt: f.apt?.trim() || null,
      city: f.city.trim(),
      state: f.state,
      zip: f.zip.trim(),
      country: f.country,
      note: f.note?.trim() || null,
      is_default: !!f.isDefault,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw pesanError(error);
  return keAlamat(data);
};

export const jadikanDefaultAlamat = async (id) => {
  const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', id);
  if (error) throw pesanError(error);
};

export const hapusAlamat = async (id) => {
  const { error } = await supabase.from('addresses').delete().eq('id', id);
  if (error) throw pesanError(error);
};