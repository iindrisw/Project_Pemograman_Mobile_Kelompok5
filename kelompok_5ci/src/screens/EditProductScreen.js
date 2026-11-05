import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import ProductForm from '../components/ProductForm';
import ProductResultModal from '../components/ProductResultModal'; // 👈 Import modal hasil yang sama
import { supabase } from '../lib/supabase';
import { uploadFoto, hapusFoto } from '../lib/produk';

export default function EditProductScreen({ route, navigation }) {
  const item = route.params.item;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  // State untuk mengontrol tampilan modal sukses / gagal
  const [hasil, setHasil] = useState(null);

  const initial = {
    nama: item.name,
    harga: String(parseFloat(String(item.price).replace(/[^0-9.]/g, ''))),
    deskripsi: item.description || '',
    kategori: item.category,
    stok: String(item.stok ?? 0),
    fotoUrl: item.image,
  };

  const simpan = async (v) => {
    let fotoBaruUrl = null;
    try {
      const perubahan = {
        nama: v.nama,
        harga: v.harga,
        deskripsi: v.deskripsi,
        kategori: v.kategori,
        stok: v.stok,
      };

      if (v.fotoUri) {
        fotoBaruUrl = await uploadFoto(v.fotoUri);
        perubahan.foto_url = fotoBaruUrl;
      }

      const { error } = await supabase.from('products').update(perubahan).eq('id', item.id);
      if (error) throw error;
      if (fotoBaruUrl) await hapusFoto(item.image);

      // Set hasil sukses (menggunakan modal, bukan Alert)
      setHasil({ tipe: 'sukses' });
    } catch (e) {
      if (fotoBaruUrl) await hapusFoto(fotoBaruUrl).catch(() => {});
      // Set hasil gagal dengan pesan errornya
      setHasil({ tipe: 'gagal', pesan: e?.message || 'Terjadi kesalahan.' });
    }
  };

  const tutupError = () => setHasil(null);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScreenHeader title="Ubah Produk" navigation={navigation} />
        <ProductForm initial={initial} fotoWajib={false} submitLabel="Simpan Perubahan" onSubmit={simpan} />
      </SafeAreaView>

      {/* Modal / Overlay hasil sukses atau gagal ubah produk */}
      <ProductResultModal
        hasil={hasil}
        onTambahLagi={() => navigation.goBack()} // Untuk edit, tombol "Tambah Lain" bisa langsung kembali ke dashboard/list
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