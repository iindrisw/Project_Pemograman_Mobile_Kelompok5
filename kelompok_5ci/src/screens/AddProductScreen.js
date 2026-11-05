import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import ProductForm from '../components/ProductForm';
import ProductResultModal from '../components/ProductResultModal'; // 👈 Import komponen baru
import { supabase } from '../lib/supabase';
import { uploadFoto, hapusFoto } from '../lib/produk';

export default function AddProductScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [formKey, setFormKey] = useState(0);
  const [hasil, setHasil] = useState(null);

  const simpan = async (v) => {
    let fotoUrl = null;
    try {
      fotoUrl = await uploadFoto(v.fotoUri);
      const { error } = await supabase.from('products').insert({
        nama: v.nama,
        harga: v.harga,
        deskripsi: v.deskripsi,
        kategori: v.kategori,
        stok: v.stok,
        foto_url: fotoUrl,
      });
      if (error) throw error;
      setHasil({ tipe: 'sukses' });
    } catch (e) {
      if (fotoUrl) await hapusFoto(fotoUrl).catch(() => {});
      setHasil({ tipe: 'gagal', pesan: e?.message || 'Terjadi kesalahan.' });
    }
  };

  const tambahLagi = () => {
    setFormKey((k) => k + 1);
    setHasil(null);
  };

  const tutupError = () => setHasil(null);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScreenHeader title="Tambah Produk" navigation={navigation} />
        <ProductForm
          key={formKey}
          fotoWajib
          submitLabel="Simpan Produk"
          onSubmit={simpan}
        />
      </SafeAreaView>

      {/* Panggil komponen modal hasil di sini */}
      <ProductResultModal
        hasil={hasil}
        onTambahLagi={tambahLagi}
        onKembali={() => navigation.goBack()}
        onCobaLagi={tutupError}
        t={theme}
      />
    </View>
  );
}

const createStyles = (t) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.background },
  safeArea: { flex: 1, backgroundColor: t.background },
});