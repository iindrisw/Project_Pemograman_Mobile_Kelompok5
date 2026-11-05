import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import { supabase } from '../lib/supabase';
import { hapusFoto } from '../lib/produk';

export default function HapusProductScreen({ route, navigation }) {
  const { item } = route.params; // Menerima data produk yang akan dihapus
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState(null); // null | { tipe: 'sukses' } | { tipe: 'gagal', pesan: string }

  const prosesHapus = async () => {
    setLoading(true);
    try {
      // 1. Hapus data dari tabel 'products'
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      // 2. Hapus file foto dari storage jika ada
      const fotoUrl = item.foto_url || item.image;
      if (fotoUrl) {
        await hapusFoto(fotoUrl).catch(() => {});
      }

      setHasil({ tipe: 'sukses' });
    } catch (e) {
      setHasil({ tipe: 'gagal', pesan: e?.message || 'Terjadi kesalahan saat menghapus produk.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScreenHeader title="Hapus Produk" navigation={navigation} />
        
        <View style={styles.container}>
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>Konfirmasi Hapus</Text>
            <Text style={styles.warningText}>
              Apakah kamu yakin ingin menghapus produk <Text style={styles.boldText}>"{item.nama || item.name}"</Text>? Tindakan ini tidak dapat dibatalkan.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.btn, styles.btnDanger]}
            onPress={prosesHapus}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnDangerText}>Ya, Hapus Produk</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnOutline]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.btnOutlineText}>Batal</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Modal Hasil Sukses / Gagal (Serupa dengan Tambah & Edit Produk) */}
      {hasil && (
        <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
          <View style={styles.contentModal}>
            <View style={[styles.circle, hasil.tipe === 'sukses' ? styles.circleOk : styles.circleErr]}>
              <Text style={styles.circleText}>{hasil.tipe === 'sukses' ? '✓' : '!'}</Text>
            </View>
            <Text style={styles.titleModal}>
              {hasil.tipe === 'sukses' ? 'Berhasil Dihapus!' : 'Gagal Menghapus'}
            </Text>
            <Text style={styles.messageModal}>
              {hasil.tipe === 'sukses' ? 'Produk telah dihapus dari sistem.' : hasil.pesan}
            </Text>
          </View>

          <View style={styles.buttonsModal}>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimaryModal]}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.btnPrimaryTextModal}>Kembali ke Dashboard</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const createStyles = (t) => {
  const primary = t?.primary || '#2563EB';
  const textColor = t?.text || '#111827';
  const bgColor = t?.background || '#FFFFFF';

  return StyleSheet.create({
    root: { flex: 1, backgroundColor: bgColor },
    safeArea: { flex: 1, backgroundColor: bgColor },
    container: { flex: 1, padding: 24, justifyContent: 'center' },
    warningCard: {
      backgroundColor: t?.card || '#F9FAFB',
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t?.border || '#E5E7EB',
      marginBottom: 24,
      alignItems: 'center',
    },
    warningTitle: { fontSize: 18, fontWeight: '700', color: textColor, marginBottom: 8 },
    warningText: { fontSize: 14, color: textColor, opacity: 0.7, textAlign: 'center', lineHeight: 20 },
    boldText: { fontWeight: '700', opacity: 1 },
    btn: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    btnDanger: { backgroundColor: '#EF4444' },
    btnDangerText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    btnOutline: { borderWidth: 1.5, borderColor: t?.border || '#D1D5DB' },
    btnOutlineText: { color: textColor, fontSize: 16, fontWeight: '600' },
    
    // Overlay Modal Styles
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: bgColor,
      zIndex: 100,
      elevation: 100,
      paddingHorizontal: 24,
    },
    contentModal: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    circle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    circleOk: { backgroundColor: '#22C55E' },
    circleErr: { backgroundColor: '#EF4444' },
    circleText: { color: '#fff', fontSize: 52, fontWeight: '700' },
    titleModal: { fontSize: 24, fontWeight: '700', color: textColor, marginBottom: 8 },
    messageModal: { fontSize: 15, color: textColor, opacity: 0.7, textAlign: 'center' },
    buttonsModal: { paddingBottom: 16 },
    btnPrimaryModal: { backgroundColor: primary, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    btnPrimaryTextModal: { color: '#fff', fontSize: 16, fontWeight: '600' },
  });
};