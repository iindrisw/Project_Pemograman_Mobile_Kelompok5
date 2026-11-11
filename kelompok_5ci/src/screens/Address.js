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
import { ambilAlamat, hapusAlamat, jadikanDefaultAlamat } from '../lib/alamat';
import { confirmDialog, notify } from '../lib/notify';

const ICONS = { Home: 'home-outline', Office: 'business-outline', Other: 'location-outline' };

export default function Address({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const muat = useCallback(async () => {
    try {
      setItems(await ambilAlamat());
    } catch (e) {
      notify('Gagal memuat alamat', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Muat ulang tiap kali halaman ini kembali fokus (mis. setelah AddAddress)
  useFocusEffect(
    useCallback(() => {
      muat();
    }, [muat]),
  );

  const onDefault = async (id) => {
    try {
      await jadikanDefaultAlamat(id);
      await muat();
    } catch (e) {
      notify('Gagal mengubah alamat utama', e.message);
    }
  };

  const onDelete = async (item) => {
    const ok = await confirmDialog('Hapus alamat?', `${item.label} - ${item.street}`);
    if (!ok) return;
    try {
      await hapusAlamat(item.id);
      await muat();
    } catch (e) {
      notify('Gagal menghapus alamat', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Shipping Addresses" navigation={navigation} />

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <FadeInView>
            {items.length === 0 && (
              <Text style={styles.empty}>Belum ada alamat. Tambahkan alamat pertamamu.</Text>
            )}

            {items.map((a) => (
              <View key={a.id} style={[styles.card, a.isDefault && styles.cardDefault]}>
                <View style={styles.cardTop}>
                  <View style={styles.labelRow}>
                    <Ionicons name={ICONS[a.label] || 'location-outline'} size={18} color={theme.primary} />
                    <Text style={styles.labelText}>{a.label}</Text>
                  </View>
                  {a.isDefault && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Default</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.name}>{a.name}</Text>
                <Text style={styles.line}>{a.phone}</Text>
                <Text style={styles.line}>{a.street}{a.apt ? `, ${a.apt}` : ''}</Text>
                <Text style={styles.line}>{a.city}, {a.state} {a.zip}</Text>
                <Text style={styles.line}>{a.country}</Text>
                {!!a.note && <Text style={styles.note}>“{a.note}”</Text>}

                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('AddAddress', { item: a })}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit alamat ${a.label}`}
                    style={styles.editBtn}
                  >
                    <Ionicons name="create-outline" size={16} color={theme.primary} />
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                  {!a.isDefault && (
                    <TouchableOpacity onPress={() => onDefault(a.id)} accessibilityRole="button">
                      <Text style={styles.actionText}>Set as default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => onDelete(a)}
                    accessibilityRole="button"
                    accessibilityLabel={`Hapus alamat ${a.label}`}
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
          onPress={() => navigation.navigate('AddAddress')}
          accessibilityRole="button"
        >
          <Ionicons name="add" size={20} color={theme.onPrimary} />
          <Text style={styles.addText}>Add New Address</Text>
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
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    labelText: { color: t.text, fontSize: 15, fontWeight: '700' },
    badge: { backgroundColor: t.badgeBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    badgeText: { color: t.primary, fontSize: 11, fontWeight: '700' },
    name: { color: t.text, fontSize: 14, fontWeight: '600', marginBottom: 2 },
    line: { color: t.textMuted, fontSize: 13, lineHeight: 20 },
    note: { color: t.textMuted, fontSize: 12, fontStyle: 'italic', marginTop: 6 },
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