import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import FadeInView from '../components/FadeInView';
import ScreenHeader from '../components/ScreenHeader';
import { Field, SelectField } from '../components/FormField';
import { notify } from '../lib/notify';
import { ambilSaldo, isiSaldo, formatRupiah, formatTitik } from '../lib/saldo';

// Sumber dana yang umum dipakai di Indonesia (simulasi, tidak terhubung ke bank/e-wallet asli)
const METODE = [
  'Transfer Bank BCA',
  'Transfer Bank BRI',
  'Transfer Bank Mandiri',
  'Transfer Bank BNI',
  'GoPay',
  'OVO',
  'DANA',
  'ShopeePay',
  'QRIS',
];

const NOMINAL_CEPAT = [50000, 100000, 250000, 500000];
const MIN = 10000;
const MAX = 10000000;

export default function AddPayment({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const [metode, setMetode] = useState(METODE[0]);
  const [nominal, setNominal] = useState(''); // hanya angka, tanpa titik
  const [saldo, setSaldo] = useState(null);
  const [saving, setSaving] = useState(false);

  const angka = Number(nominal || 0);

  useEffect(() => {
    let aktif = true;
    ambilSaldo()
      .then((s) => { if (aktif) setSaldo(s); })
      .catch(() => {}); // gagal memuat saldo: form tetap bisa dipakai
    return () => { aktif = false; };
  }, []);

  const onSave = async () => {
    if (saving) return;

    let masalah = null;
    if (!angka) masalah = 'Isi nominal saldo.';
    else if (angka < MIN) masalah = `Minimal isi saldo ${formatRupiah(MIN)}.`;
    else if (angka > MAX) masalah = `Maksimal sekali isi ${formatRupiah(MAX)}.`;
    if (masalah) {
      notify('Nominal belum sesuai', masalah);
      return;
    }

    setSaving(true);
    try {
      const baru = await isiSaldo(angka, metode);
      notify('Berhasil', `Saldo bertambah ${formatRupiah(angka)}. Saldo kamu sekarang ${formatRupiah(baru)}.`);
      navigation.goBack();
    } catch (e) {
      notify('Gagal mengisi saldo', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader title="Isi Saldo" navigation={navigation} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FadeInView>
            <View style={styles.saldoCard}>
              <Text style={styles.saldoLabel}>Saldo kamu saat ini</Text>
              <Text style={styles.saldoValue}>{saldo === null ? '…' : formatRupiah(saldo)}</Text>
            </View>

            <Field
              label="Nominal isi saldo (Rp)"
              placeholder="Contoh: 100.000"
              value={formatTitik(nominal)}
              onChangeText={(v) => setNominal(v.replace(/\D/g, '').slice(0, 8))}
              keyboardType="number-pad"
              maxLength={11}
            />

            <View style={styles.chipRow}>
              {NOMINAL_CEPAT.map((n) => {
                const aktif = angka === n;
                return (
                  <TouchableOpacity
                    key={n}
                    style={[styles.chip, aktif && styles.chipActive]}
                    onPress={() => setNominal(String(n))}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityState={{ selected: aktif }}
                  >
                    <Text style={[styles.chipText, aktif && styles.chipTextActive]}>
                      {formatTitik(String(n))}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <SelectField label="Sumber dana" value={metode} options={METODE} onChange={setMetode} />

            {saldo !== null && angka >= MIN && angka <= MAX && (
              <Text style={styles.preview}>
                Saldo setelah diisi: <Text style={styles.previewBold}>{formatRupiah(saldo + angka)}</Text>
              </Text>
            )}

            <View style={styles.infoRow}>
              <Ionicons name="information-circle-outline" size={18} color={theme.textMuted} />
              <Text style={styles.infoText}>
                Ini saldo simulasi. Aplikasi belum terhubung ke uang sungguhan, jadi tidak ada dana yang dipotong
                dari bank atau e-wallet.
              </Text>
            </View>
          </FadeInView>
        </ScrollView>

        <View style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.6 }]}
            activeOpacity={0.85}
            onPress={onSave}
            disabled={saving}
            accessibilityRole="button"
          >
            {saving ? (
              <ActivityIndicator color={theme.onPrimary} />
            ) : (
              <Text style={styles.saveText}>Isi Saldo</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (t) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: t.background },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 16 },

    saldoCard: {
      padding: 18,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.surface,
      marginBottom: 22,
    },
    saldoLabel: { color: t.textMuted, fontSize: 12 },
    saldoValue: { color: t.text, fontSize: 26, fontWeight: '700', marginTop: 6 },

    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.surface,
    },
    chipActive: { backgroundColor: t.primary, borderColor: t.primary },
    chipText: { color: t.text, fontSize: 13, fontWeight: '600' },
    chipTextActive: { color: t.onPrimary },

    preview: { color: t.textMuted, fontSize: 13, marginTop: 4, marginBottom: 6 },
    previewBold: { color: t.text, fontWeight: '700' },

    infoRow: { flexDirection: 'row', gap: 8, marginTop: 16, alignItems: 'flex-start' },
    infoText: { flex: 1, color: t.textMuted, fontSize: 12, lineHeight: 18 },

    saveButton: {
      height: 54,
      marginHorizontal: 20,
      borderRadius: 16,
      backgroundColor: t.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveText: { color: t.onPrimary, fontSize: 15, fontWeight: '700' },
  });
