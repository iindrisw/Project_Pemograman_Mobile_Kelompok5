// Helper bersama untuk tabel products + bucket 'produk'.
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy'; // SDK 54. Untuk SDK 53 ke bawah: 'expo-file-system'
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

// Nama bucket Storage. Harus SAMA dengan nama bucket di dashboard Supabase.
export const BUCKET = 'produk';

export const KATEGORI = ['Bread', 'Pastries', 'Cakes', 'Drinks', 'Other'];

// Harga di aplikasi ini ditampilkan dalam dolar ($), sama seperti Cart.
export const formatHarga = (n) => `$${Number(n).toFixed(2)}`;

// Baris Supabase -> bentuk item yang dipakai screen (Menu, Detail, Cart).
// price tetap berupa string '$6.50' supaya CartContext yang sudah ada tidak berubah.
export const keItem = (row) => ({
  id: row.id,
  name: row.nama,
  category: row.kategori,
  price: formatHarga(row.harga),
  image: row.foto_url,
  description: row.deskripsi,
  stok: row.stok,
});

export const ambilSemuaProduk = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(keItem);
};

export const ambilProduk = async (id) => {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? keItem(data) : null;
};

// Upload: foto lokal (URI) -> Storage -> URL publik.
// Native (Android/iOS): URI file:// dibaca sebagai base64 lalu diubah ke ArrayBuffer
// (fetch().blob() tidak andal di React Native). Web: URI blob: cukup di-fetch.
export const uploadFoto = async (uri) => {
  const ext = (uri.split('?')[0].split('.').pop() || 'jpg').toLowerCase();
  const aman = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
  const path = `produk/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${aman}`;

  let body;
  if (Platform.OS === 'web') {
    body = await (await fetch(uri)).blob();
  } else {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    body = decode(base64);
  }

  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType: `image/${aman === 'jpg' ? 'jpeg' : aman}`,
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
};

// URL publik -> path di dalam bucket (mis. 'produk/123-abc.jpg').
export const pathDariUrl = (url) => url?.split(`/storage/v1/object/public/${BUCKET}/`)[1];

export const hapusFoto = async (url) => {
  const path = pathDariUrl(url);
  if (path) await supabase.storage.from(BUCKET).remove([path]);
};