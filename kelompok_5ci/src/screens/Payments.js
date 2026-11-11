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
import { ambilMetodeBayar, hapusMetodeBayar, jadikanDefaultMetode } from '../lib/pembayaran';
import { confirmDialog, notify } from '../lib/notify';

const pad = (n) => String(n).padStart(2, '0');

export default function Payments({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const muat = useCallback(async () => {
    try {
      setItems(await ambilMetodeBayar());
    } catch (e) {
      notify('Gagal memuat metode pembayaran', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Muat ulang tiap kali halaman ini kembali fokus (mis. setelah AddPayment)
  useFocusEffect(
    useCallback(() => {
      muat();
    }, [muat]),
  );

  const onDefault = async (id) => {
    try {
      await jadikanDefaultMetode(id);
      await muat();
    } catch (e) {
      notify('Gagal mengubah kartu utama', e.message);
    }
  };

  const onDelete = async (item) => {
    const ok = await confirmDialog('Hapus kartu?', `${item.brand} •••• ${item.last4}`);
    if (!ok) return;
    try {
      await hapusMetodeBayar(item.id);
      await muat();
    } catch (e) {
      notify('Gagal menghapus kartu', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Payment Methods" navigation={navigation} />

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <FadeInView>
            {items.length === 0 && (
              <Text style={styles.empty}>Belum ada kartu tersimpan. Tambahkan kartu pertamamu.</Text>
            )}

            {items.map((p) => (
              <View key={p.id} style={[styles.card, p.isDefault && styles.cardDefault]}>
                <View style={styles.cardTop}>
                  <View style={styles.brandRow}>
                    <Ionicons name="card-outline" size={20} color={theme.primary} />
                    <Text style={styles.brand}>{p.brand}</Text>
                  </View>
                  {p.isDefault && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Default</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.number}>•••• •••• •••• {p.last4}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.meta}>{p.holder}</Text>
                  <Text style={styles.meta}>Exp {pad(p.expMonth)}/{String(p.expYear).slice(-2)}</Text>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('AddPayment', { item: p })}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit kartu ${p.brand} berakhiran ${p.last4}`}
                    style={styles.editBtn}
                  >
                    <Ionicons name="create-outline" size={16} color={theme.primary} />
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                  {!p.isDefault && (
                    <TouchableOpacity onPress={() => onDefault(p.id)} accessibilityRole="button">
                      <Text style={styles.actionText}>Set as default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => onDelete(p)}
                    accessibilityRole="button"
                    accessibilityLabel={`Hapus kartu ${p.brand} berakhiran ${p.last4}`}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color={theme.danger || '#D64545'} />
                    <Text style={[styles.actionText, { color: theme.danger || '#D64545' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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
          <Text style={styles.addText}>Add New Payment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (t) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: t.background },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 16 },
    empty: { color: t.textMuted, textAlign: 'center', marginTop: 40, fontSize: 14 },
    card: {
      backgroundColor: t.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
      padding: 16,
      marginBottom: 14,
    },
    cardDefault: { borderColor: t.primary },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    brand: { color: t.text, fontSize: 15, fontWeight: '700' },
    badge: { backgroundColor: t.badgeBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    badgeText: { color: t.primary, fontSize: 11, fontWeight: '700' },
    number: { color: t.text, fontSize: 17, fontWeight: '600', letterSpacing: 1.5, marginBottom: 10 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
    meta: { color: t.textMuted, fontSize: 13 },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 14 },
    editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionText: { color: t.primary, fontSize: 13, fontWeight: '600' },
    deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
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