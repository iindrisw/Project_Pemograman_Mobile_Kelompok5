import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProductResultModal({ hasil, onTambahLagi, onKembali, onCobaLagi, t }) {
  if (!hasil) return null;

  const styles = createStyles(t);
  const isSukses = hasil.tipe === 'sukses';

  return (
    <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={[styles.circle, isSukses ? styles.circleOk : styles.circleErr]}>
          <Text style={styles.circleText}>{isSukses ? '✓' : '!'}</Text>
        </View>
        <Text style={styles.title}>
          {isSukses ? 'Berhasil!' : 'Gagal menyimpan'}
        </Text>
        <Text style={styles.message}>
          {isSukses ? 'Produk berhasil disimpan.' : hasil.pesan}
        </Text>
      </View>

      <View style={styles.buttons}>
        {isSukses ? (
          <>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={onTambahLagi}
              activeOpacity={0.8}
            >
              <Text style={styles.btnPrimaryText}>Tambah Produk Lain</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnOutline]}
              onPress={onKembali}
              activeOpacity={0.8}
            >
              <Text style={styles.btnOutlineText}>Kembali ke Dashboard</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={onCobaLagi}
            activeOpacity={0.8}
          >
            <Text style={styles.btnPrimaryText}>Coba Lagi</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (t) => {
  const primary = t?.primary || '#2563EB';
  const textColor = t?.text || '#111827';
  const bgColor = t?.background || '#FFFFFF';
  
  return StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: bgColor,
      zIndex: 100,
      elevation: 100,
      paddingHorizontal: 24,
    },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
    title: { fontSize: 24, fontWeight: '700', color: textColor, marginBottom: 8 },
    message: {
      fontSize: 15,
      color: textColor,
      opacity: 0.7,
      textAlign: 'center',
    },
    buttons: { paddingBottom: 16, gap: 12 },
    btn: {
      height: 52,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnPrimary: { backgroundColor: primary },
    btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    btnOutline: { borderWidth: 1.5, borderColor: primary },
    btnOutlineText: { color: primary, fontSize: 16, fontWeight: '600' },
  });
};