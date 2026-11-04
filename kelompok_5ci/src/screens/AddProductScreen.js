import React, { useMemo } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import ProductForm from '../components/ProductForm';
import { supabase } from '../lib/supabase';
import { uploadFoto, hapusFoto } from '../lib/produk';

export default function AddProductScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const simpan = async (v) => {
    let fotoUrl = null;
    try {
      // Urutan: upload foto DULU, baru insert baris (foto_url sudah ada).
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
      Alert.alert('Berhasil', 'Produk ditambahkan.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      // Insert gagal setelah upload berhasil: hapus foto supaya tidak jadi file yatim.
      if (fotoUrl) await hapusFoto(fotoUrl).catch(() => {});
      Alert.alert('Gagal menyimpan', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Tambah Produk" navigation={navigation} />
      <ProductForm fotoWajib submitLabel="Simpan Produk" onSubmit={simpan} />
    </SafeAreaView>
  );
}

const createStyles = (t) => StyleSheet.create({ safeArea: { flex: 1, backgroundColor: t.background } });