import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import FadeInView from '../components/FadeInView';
import ScreenHeader from '../components/ScreenHeader';
import { Field, SelectField, ToggleCard } from '../components/FormField';

const LABELS = [
  { id: 'Home', icon: 'home-outline' },
  { id: 'Office', icon: 'business-outline' },
  { id: 'Other', icon: 'location-outline' },
];

const STATES = ['California', 'Florida', 'Illinois', 'New Jersey', 'New York', 'Texas', 'Washington'];
const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Indonesia'];

export default function AddAddress({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const [label, setLabel] = useState('Home');
  const [form, setForm] = useState({
    name: '', phone: '', street: '', apt: '', city: '', zip: '', note: '',
  });
  const [state, setState] = useState('New York');
  const [country, setCountry] = useState('United States');
  const [isDefault, setIsDefault] = useState(true);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const onSave = () => {
    // TODO: simpan ke state global / backend
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader title="Add New Address" navigation={navigation} />

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
          <TouchableOpacity style={styles.saveButton} activeOpacity={0.85} onPress={onSave} accessibilityRole="button">
            <Text style={styles.saveText}>Save Address</Text>
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
