import React, { useMemo, useState } from 'react';
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
import { Field, SelectField, ToggleCard } from '../components/FormField';
import { tambahAlamat, updateAlamat } from '../lib/alamat';
import { notify } from '../lib/notify';

const LABELS = [
  { id: 'Home', icon: 'home-outline' },
  { id: 'Office', icon: 'business-outline' },
  { id: 'Other', icon: 'location-outline' },
];

const STATES = ['California', 'Florida', 'Illinois', 'New Jersey', 'New York', 'Texas', 'Washington'];
const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Indonesia'];

// Mengembalikan pesan error pertama, atau null kalau valid
const validate = (f) => {
  if (f.name.trim().length < 2) return 'Isi nama lengkap.';
  if (f.phone.replace(/\D/g, '').length < 8) return 'Nomor telepon tidak valid.';
  if (f.street.trim().length < 3) return 'Isi alamat jalan.';
  if (!f.city.trim()) return 'Isi nama kota.';
  if (f.zip.trim().length < 3) return 'Isi kode pos.';
  return null;
};

export default function AddAddress({ navigation, route }) {
  // Kalau dibuka dari tombol Edit, item alamat dikirim lewat route.params.item
  const editing = route?.params?.item || null;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const [label, setLabel] = useState(editing?.label || 'Home');
  const [form, setForm] = useState({
    name: editing?.name || '',
    phone: editing?.phone || '',
    street: editing?.street || '',
    apt: editing?.apt || '',
    city: editing?.city || '',
    zip: editing?.zip || '',
    note: editing?.note || '',
  });
  const [state, setState] = useState(editing?.state || 'New York');
  const [country, setCountry] = useState(editing?.country || 'United States');
  const [isDefault, setIsDefault] = useState(editing ? editing.isDefault : true);
  const [saving, setSaving] = useState(false);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const onSave = async () => {
    if (saving) return;
    const problem = validate(form);
    if (problem) {
      notify('Data belum lengkap', problem);
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, label, state, country, isDefault };
      if (editing) await updateAlamat(editing.id, payload);
      else await tambahAlamat(payload);
      navigation.goBack(); // halaman Address memuat ulang saat fokus kembali
    } catch (e) {
      notify(editing ? 'Gagal memperbarui alamat' : 'Gagal menyimpan alamat', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader title={editing ? 'Edit Address' : 'Add New Address'} navigation={navigation} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FadeInView>
            <Text style={styles.intro}>A new place for your favorite bakes to call home.</Text>

            <Text style={styles.label}>Address label</Text>
            <View style={styles.chipRow}>
              {LABELS.map((l) => {
                const active = label === l.id;
                return (
                  <TouchableOpacity
                    key={l.id}
                    activeOpacity={0.8}
                    onPress={() => setLabel(l.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Ionicons name={l.icon} size={18} color={active ? theme.primary : theme.textMuted} />
                    <Text style={[styles.chipText, active && { color: theme.text, fontWeight: '700' }]}>{l.id}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.row}>
              <Field label="Full name" style={styles.half} placeholder="Sophie Miller"
                value={form.name} onChangeText={set('name')} autoCapitalize="words" textContentType="name" />
              <Field label="Phone number" style={styles.half} placeholder="(917) 555-0124"
                value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" textContentType="telephoneNumber" />
            </View>

            <Field label="Street address" placeholder="124 Maple Street"
              value={form.street} onChangeText={set('street')} textContentType="streetAddressLine1" />

            <View style={styles.row}>
              <Field label="Apartment, suite (optional)" style={styles.half} placeholder="Apt 3B"
                value={form.apt} onChangeText={set('apt')} />
              <Field label="City" style={styles.half} placeholder="Brooklyn"
                value={form.city} onChangeText={set('city')} textContentType="addressCity" />
            </View>

            <View style={styles.row}>
              <SelectField label="State" style={styles.half} value={state} options={STATES} onChange={setState} />
              <Field label="ZIP code" style={styles.half} placeholder="11201"
                value={form.zip} onChangeText={set('zip')} keyboardType="number-pad" maxLength={10} />
            </View>

            <SelectField label="Country" value={country} options={COUNTRIES} onChange={setCountry} />

            <Field label="Delivery instructions (optional)" placeholder="Leave at the door. Ring once, please."
              value={form.note} onChangeText={set('note')} multiline />

            <ToggleCard
              title="Set as default address"
              subtitle="Your first choice for fresh deliveries."
              value={isDefault}
              onChange={setIsDefault}
            />
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
              <Text style={styles.saveText}>{editing ? 'Update Address' : 'Save Address'}</Text>
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
    intro: { color: t.textMuted, fontSize: 15, lineHeight: 23, marginBottom: 20 },
    label: { color: t.text, fontSize: 13, fontWeight: '700', marginBottom: 8 },
    chipRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
    chip: {
      flex: 1,
      height: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.surface,
    },
    chipActive: { borderColor: t.primary, backgroundColor: t.badgeBg },
    chipText: { color: t.textMuted, fontSize: 14, fontWeight: '500' },
    row: { flexDirection: 'row', gap: 12 },
    half: { flex: 1 },
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