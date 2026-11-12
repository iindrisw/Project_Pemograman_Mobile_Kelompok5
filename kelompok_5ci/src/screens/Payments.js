import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import FadeInView from '../components/FadeInView';
import ScreenHeader from '../components/ScreenHeader';
import { notify } from '../lib/notify';
import { ambilSaldo, ambilRiwayatSaldo, formatRupiah, formatWaktu } from '../lib/saldo';

export default function Payments({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const [saldo, setSaldo] = useState(0);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);

  const muat = useCallback(async () => {
    try {
      const [s, r] = await Promise.all([ambilSaldo(), ambilRiwayatSaldo()]);
      setSaldo(s);
      setRiwayat(r);
    } catch (e) {
      notify('Gagal memuat saldo', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Muat ulang tiap kali halaman ini kembali fokus (mis. setelah isi saldo atau checkout)
  useFocusEffect(useCallback(() => { muat(); }, [muat]));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Saldo & Pembayaran" navigation={navigation} />

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <FadeInView>
            <View style={styles.saldoCard}>
              <View style={styles.saldoTop}>
                <Ionicons name="wallet-outline" size={20} color={theme.primary} />
                <Text style={styles.saldoLabel}>Saldo Saya</Text>
              </View>
              <Text style={styles.saldoValue}>{formatRupiah(saldo)}</Text>
              <Text style={styles.saldoNote}>
                Saldo simulasi, dipakai untuk membayar pesanan saat checkout.
              </Text>
            </View>

            <Text style={styles.eyebrow}>RIWAYAT SALDO</Text>

            {riwayat.length === 0 ? (
              <Text style={styles.empty}>Belum ada transaksi. Isi saldo untuk mulai memesan.</Text>
            ) : (
              riwayat.map((r) => {
                const masuk = r.jumlah >= 0;
                return (
                  <View key={r.id} style={styles.row}>
                    <View style={styles.rowIcon}>
                      <Ionicons
                        name={masuk ? 'arrow-down-outline' : 'arrow-up-outline'}
                        size={16}
                        color={masuk ? theme.success || theme.primary : theme.danger || '#D64545'}
                      />
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{r.metode}</Text>
                      <Text style={styles.rowDate}>{formatWaktu(r.waktu)}</Text>
                    </View>
                    <Text
                      style={[
                        styles.rowAmount,
                        { color: masuk ? theme.success || theme.primary : theme.danger || '#D64545' },
                      ]}
                    >
                      {masuk ? '+' : '−'}{formatRupiah(Math.abs(r.jumlah))}
                    </Text>
                  </View>
                );
              })
            )}
          </FadeInView>
        </ScrollView>
      )}

      <View style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('AddPayment')}
          accessibilityRole="button"
        >
          <Ionicons name="add" size={20} color={theme.onPrimary} />
          <Text style={styles.addText}>Isi Saldo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (t) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: t.background },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 16 },

    saldoCard: {
      backgroundColor: t.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: t.primary,
      padding: 18,
      marginBottom: 26,
    },
    saldoTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    saldoLabel: { color: t.textMuted, fontSize: 13, fontWeight: '600' },
    saldoValue: { color: t.text, fontSize: 30, fontWeight: '700', marginTop: 10 },
    saldoNote: { color: t.textMuted, fontSize: 12, marginTop: 8, lineHeight: 18 },

    eyebrow: { color: t.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
    empty: { color: t.textMuted, textAlign: 'center', marginTop: 24, fontSize: 14 },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      padding: 12,
      marginBottom: 8,
      gap: 12,
    },
    rowIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: t.badgeBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowInfo: { flex: 1 },
    rowTitle: { color: t.text, fontSize: 14, fontWeight: '600' },
    rowDate: { color: t.textMuted, fontSize: 11, marginTop: 2 },
    rowAmount: { fontSize: 14, fontWeight: '700' },

    addButton: {
      height: 54,
      marginHorizontal: 20,
      borderRadius: 16,
      backgroundColor: t.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    addText: { color: t.onPrimary, fontSize: 15, fontWeight: '700' },
  });
