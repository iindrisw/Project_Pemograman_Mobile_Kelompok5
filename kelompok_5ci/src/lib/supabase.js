import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Nilai diambil dari file .env di root project (bukan ditulis langsung di kode).
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_KEY belum terbaca. ' +
      'Pastikan file bernama ".env" ada di root project, lalu jalankan: npx expo start -c',
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,      // session disimpan, jadi tidak logout saat aplikasi ditutup
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,  // tidak dipakai di React Native / tanpa login OAuth
  },
});
