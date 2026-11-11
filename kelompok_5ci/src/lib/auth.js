import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';

/*
  Supabase Auth butuh email, sedangkan aplikasi ini pakai username.
  Jadi username diubah jadi email "palsu": username@dapurchikara.app
  (tidak ada email yang dikirim; "Confirm email" di Supabase harus MATI).
*/
const EMAIL_DOMAIN = 'dapurchikara.app';

const bersihkan = (username) => String(username || '').trim().toLowerCase();
export const usernameKeEmail = (username) => `${bersihkan(username)}@${EMAIL_DOMAIN}`;

/* Ambil profil (username + role) milik user yang sedang login. null kalau belum login. */
export async function ambilProfilSaya() {
  const { data: sesi } = await supabase.auth.getSession();
  const user = sesi?.session?.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, role')
    .eq('id', user.id)
    .maybeSingle();
  if (error) throw error;
  return data; // { id, username, role: 'user' | 'admin' }
}

/* Register: semua akun baru otomatis role 'user' (kecuali username "admin", diatur trigger di database). */
export async function daftar(username, password) {
  const { data, error } = await supabase.auth.signUp({
    email: usernameKeEmail(username),
    password,
  });

  if (error) {
    if (/already registered|already exists/i.test(error.message)) {
      throw new Error('That username is already taken.');
    }
    throw new Error(error.message);
  }

  // Tidak ada session = "Confirm email" di Supabase masih menyala,
  // atau username sudah dipakai (Supabase menyamarkannya).
  if (!data.session) {
    console.warn('[auth] signUp tidak mengembalikan session. Cek: Authentication > Providers > Email > matikan "Confirm email".');
    throw new Error('Could not complete registration. The username may already be taken.');
  }

  return ambilProfilSaya();
}

/* Login: kembalikan profil supaya pemanggil tahu role-nya. */
export async function masuk(username, password) {
  const { error } = await supabase.auth.signInWithPassword({
    email: usernameKeEmail(username),
    password,
  });
  if (error) {
    if (/invalid login credentials/i.test(error.message)) {
      throw new Error('Incorrect username or password.');
    }
    throw new Error(error.message);
  }
  return ambilProfilSaya();
}

export async function keluar() {
  await supabase.auth.signOut();
}

/*
  Hook untuk layar lain:
    const { profil, isAdmin, loading } = useProfil();
  Dipakai nanti untuk menampilkan tombol tambah / edit / hapus produk khusus admin.
*/
export function useProfil() {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);

  const muat = useCallback(async () => {
    try {
      setProfil(await ambilProfilSaya());
    } catch {
      setProfil(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    muat();
    const { data } = supabase.auth.onAuthStateChange(() => { muat(); });
    return () => data.subscription.unsubscribe();
  }, [muat]);

  return { profil, isAdmin: profil?.role === 'admin', loading };
}

