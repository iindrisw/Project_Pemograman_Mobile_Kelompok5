import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// URL dan publishable key dibaca dari file .env di root proyek (awalan EXPO_PUBLIC_ wajib).
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn(
    'Supabase belum dikonfigurasi: isi EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_KEY di .env, lalu jalankan ulang dengan `npx expo start -c`.',
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage, // sesi login tersimpan (dipakai nanti bila pakai Supabase Auth)
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});