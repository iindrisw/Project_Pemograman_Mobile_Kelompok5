import React, { useMemo } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import ProductForm from '../components/ProductForm';
import { supabase } from '../lib/supabase';
import { uploadFoto, hapusFoto } from '../lib/produk';

export default function EditProductScreen({ route, navigation }) {
  const item = route.params.item; // bentuk item aplikasi (name, price, image, ...)
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Nilai awal berasal dari item, jadi form langsung valid dan tombol aktif.
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
      // Foto diganti: upload baru -> update baris -> baru hapus file lama.
      if (v.fotoUri) {
        fotoBaruUrl = await uploadFoto(v.fotoUri);
        perubahan.foto_url = fotoBaruUrl;
      }
      const { error } = await supabase.from('products').update(perubahan).eq('id', item.id);
      if (error) throw error;
      if (fotoBaruUrl) await hapusFoto(item.image);

      Alert.alert('Berhasil', 'Produk diubah.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      // Update gagal: buang foto baru agar tidak jadi file yatim; foto lama tetap utuh.
      if (fotoBaruUrl) await hapusFoto(fotoBaruUrl).catch(() => {});
      Alert.alert('Gagal mengubah', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Ubah Produk" navigation={navigation} />
      <ProductForm initial={initial} fotoWajib={false} submitLabel="Simpan Perubahan" onSubmit={simpan} />
    </SafeAreaView>
  );
}

const createStyles = (t) => StyleSheet.create({ safeArea: { flex: 1, backgroundColor: t.background } });