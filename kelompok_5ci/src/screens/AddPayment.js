import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import FadeInView from '../components/FadeInView';
import ScreenHeader from '../components/ScreenHeader';
import { Field, SelectField, ToggleCard } from '../components/FormField';

const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Indonesia'];

const formatCardNumber = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
};

export default function AddPayment({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [country, setCountry] = useState('United States');
  const [zip, setZip] = useState('');
  const [isDefault, setIsDefault] = useState(true);

  const onSave = () => {
    // TODO: kirim ke payment provider (jangan simpan nomor kartu mentah)
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader title="Add New Payment" navigation={navigation} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FadeInView>
            <Text style={styles.eyebrow}>A LITTLE EASIER AT CHECKOUT</Text>
            <Text style={styles.intro}>Save a card for your next fresh-from-the-oven favorite.</Text>

            <View style={styles.sectionRow}>
              <Text style={styles.eyebrow}>CARD DETAILS</Text>
              <View style={styles.brands}>
                <View style={styles.brandChip}><Text style={styles.brandText}>VISA</Text></View>
                <View style={styles.brandChip}><Text style={styles.brandText}>Mastercard</Text></View>
              </View>
            </View>

            <Field label="Cardholder name" placeholder="Sophie Miller"
              value={name} onChangeText={setName} autoCapitalize="words" textContentType="name" />

            <Field
              label="Card number"
              placeholder="4242 4242 4242 4242"
              value={number}
              onChangeText={(v) => setNumber(formatCardNumber(v))}
              keyboardType="number-pad"
              maxLength={19}
              textContentType="creditCardNumber"
              right={<Ionicons name="card-outline" size={22} color={theme.textMuted} />}
            />

            <View style={styles.row}>
              <Field label="Expiry date" style={styles.half} placeholder="MM / YY"
                value={expiry} onChangeText={(v) => setExpiry(formatExpiry(v))} keyboardType="number-pad" maxLength={7} />
              <Field
                label="Security code (CVV)"
                style={styles.half}
                placeholder="•••"
                value={cvv}
                onChangeText={(v) => setCvv(v.replace(/\D/g, '').slice(0, 4))}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                right={<Ionicons name="help-circle-outline" size={22} color={theme.textMuted} />}
              />
            </View>

            <View style={styles.row}>
              <SelectField label="Billing country" style={styles.half} value={country} options={COUNTRIES} onChange={setCountry} />
              <Field label="ZIP code" style={styles.half} placeholder="11201"
                value={zip} onChangeText={setZip} keyboardType="number-pad" maxLength={10} />
            </View>

            <ToggleCard
              title="Set as default payment"
              subtitle="Use this card for future orders."
              value={isDefault}
              onChange={setIsDefault}
            />

            <View style={styles.secureRow}>
              <Ionicons name="lock-closed-outline" size={16} color={theme.textMuted} />
              <Text style={styles.secureText}>Encrypted & secure. Always.</Text>
            </View>
          </FadeInView>
        </ScrollView>

        <View style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
          <TouchableOpacity style={styles.saveButton} activeOpacity={0.85} onPress={onSave} accessibilityRole="button">
            <Text style={styles.saveText}>Save Payment</Text>
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
    eyebrow: { color: t.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.4 },
    intro: { color: t.textMuted, fontSize: 15, lineHeight: 23, marginTop: 10, marginBottom: 26 },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    brands: { flexDirection: 'row', gap: 8 },
    brandChip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.surface,
    },
    brandText: { color: t.primary, fontSize: 12, fontWeight: '700' },
    row: { flexDirection: 'row', gap: 12 },
    half: { flex: 1 },
    secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
    secureText: { color: t.textMuted, fontSize: 12 },
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
