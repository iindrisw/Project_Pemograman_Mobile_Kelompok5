// Validator bersama untuk form Tambah dan Ubah (fungsi murni).
// Mengembalikan '' bila valid, atau pesan error bila tidak.

export const validasiNama = (nilai) => {
  if (!nilai.trim()) return 'Nama produk wajib diisi.';
  if (nilai.trim().length < 3) return 'Nama minimal 3 karakter.';
  return '';
};

export const validasiHarga = (nilai) => {
  if (!nilai.trim()) return 'Harga wajib diisi.';
  const n = Number(nilai);
  if (Number.isNaN(n)) return 'Harga harus berupa angka.';
  if (n <= 0) return 'Harga harus lebih dari 0.';
  return '';
};

export const validasiStok = (nilai) => {
  if (!nilai.trim()) return 'Stok wajib diisi.';
  const n = Number(nilai);
  if (!Number.isInteger(n)) return 'Stok harus bilangan bulat.';
  if (n < 0) return 'Stok tidak boleh negatif.';
  return '';
};

export const validasiFoto = (fotoUri, wajib = true) => {
  if (wajib && !fotoUri) return 'Foto produk wajib dipilih.';
  return '';
};