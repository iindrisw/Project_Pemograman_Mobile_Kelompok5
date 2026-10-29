import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import FadeInView from '../components/FadeInView';
import ScreenHeader from '../components/ScreenHeader';

const wallets = [
  { id: 'apple', letter: 'A', title: 'Apple Pay', subtitle: 'Pay with Face ID' },
  { id: 'google', letter: 'G', title: 'Google Pay', subtitle: 'Fast, secure checkout' },
  { id: 'paypal', letter: 'P', title: 'PayPal', subtitle: 'Link your PayPal account' },
];

const serifFont = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

/* Radio dengan titik yang "membal" saat dipilih */
function Radio({ selected }) {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? 1 : 0,
      friction: 5,
      tension: 140,
      useNativeDriver: true,
    }).start();
  }, [selected, scale]);

  return (
    <View
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: selected ? theme.primary : theme.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: theme.primary,
          transform: [{ scale }],
        }}
      />
    </View>
  );
}

export default function Payments({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState('card');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FadeInView distance={0} duration={300} style={{ flex: 1 }}>
        <ScreenHeader title="Payments" navigation={navigation} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Kartu tersimpan */}
          <FadeInView delay={80}>
            <View style={styles.sectionRow}>
              <Text style={styles.eyebrow}>YOUR SAVED CARD</Text>
              {selected === 'card' && <Text style={styles.selectedText}>Selected</Text>}
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setSelected('card')}
              accessibilityRole="button"
              accessibilityLabel="Visa card ending in 4829"
              style={styles.card}
            >
              <View style={styles.cardCircleLarge} />
              <View style={styles.cardCircleSmall} />

              <View style={styles.cardTop}>
                <Text style={styles.cardTagline}>Everyday, well spent.</Text>
                <MaterialCommunityIcons name="contactless-payment" size={26} color="#F5EBDD" />
              </View>

              <Text style={styles.cardNumber}>
                {'•••• •••• •••• '}
                <Text style={styles.cardNumberLast}>4829</Text>
              </Text>

              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.cardName}>SOPHIE MILLER</Text>
                  <Text style={styles.cardValid}>VALID THRU  08/28</Text>
                </View>
                <Text style={styles.cardBrand}>VISA</Text>
              </View>
            </TouchableOpacity>
          </FadeInView>

          {/* E-wallets */}
          <FadeInView delay={180}>
            <Text style={styles.sectionTitle}>E-wallets</Text>
          </FadeInView>

          {wallets.map((w, i) => (
            <FadeInView key={w.id} delay={240 + i * 80}>
              <TouchableOpacity
                style={[styles.walletRow, selected === w.id && styles.walletRowActive]}
                activeOpacity={0.85}
                onPress={() => setSelected(w.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: selected === w.id }}
              >
                <View style={styles.walletLetterBox}>
                  <Text style={styles.walletLetter}>{w.letter}</Text>
                </View>
                <View style={styles.walletInfo}>
                  <Text style={styles.walletTitle}>{w.title}</Text>
                  <Text style={styles.walletSubtitle}>{w.subtitle}</Text>
                </View>
                <Radio selected={selected === w.id} />
              </TouchableOpacity>
            </FadeInView>
          ))}

          <FadeInView delay={520} style={styles.secureRow}>
            <Ionicons name="lock-closed-outline" size={16} color={theme.textMuted} />
            <Text style={styles.secureText}>Encrypted & secure. Always.</Text>
          </FadeInView>
        </ScrollView>

        <FadeInView delay={600} style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.85}
            accessibilityRole="button"
            onPress={() => navigation.navigate('AddPayment')}
          >
            <Ionicons name="add" size={22} color={theme.onPrimary} />
            <Text style={styles.addButtonText}>Add New Payment</Text>
          </TouchableOpacity>
        </FadeInView>
      </FadeInView>
    </SafeAreaView>
  );
}

const createStyles = (t) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: t.background },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 16 },

    sectionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    eyebrow: { color: t.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.4 },
    selectedText: { color: t.primary, fontSize: 12, fontWeight: '600' },

    /* Kartu: warna coklat tetap di kedua mode (seperti kartu fisik) */
    card: {
      backgroundColor: '#5B3A29',
      borderRadius: 24,
      padding: 22,
      height: 204,
      overflow: 'hidden',
      justifyContent: 'space-between',
    },
    cardCircleLarge: {
      position: 'absolute',
      right: -70,
      top: -60,
      width: 260,
      height: 260,
      borderRadius: 130,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.10)',
    },
    cardCircleSmall: {
      position: 'absolute',
      right: -20,
      top: -20,
      width: 170,
      height: 170,
      borderRadius: 85,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.10)',
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardTagline: { color: '#F5EBDD', fontSize: 21, fontFamily: serifFont },
    cardNumber: { color: '#F5EBDD', fontSize: 22, letterSpacing: 2 },
    cardNumberLast: { letterSpacing: 1.5 },
    cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    cardName: { color: '#F5EBDD', fontSize: 12, letterSpacing: 0.6 },
    cardValid: { color: 'rgba(245,235,221,0.65)', fontSize: 11, marginTop: 4 },
    cardBrand: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', fontStyle: 'italic' },

    sectionTitle: { color: t.text, fontSize: 20, marginTop: 28, marginBottom: 14 },

    walletRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      marginBottom: 12,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.surface,
    },
    walletRowActive: { borderColor: t.primary },
    walletLetterBox: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: t.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    walletLetter: { color: t.text, fontSize: 20, fontWeight: '700' },
    walletInfo: { flex: 1, marginLeft: 14 },
    walletTitle: { color: t.text, fontSize: 15, fontWeight: '700' },
    walletSubtitle: { color: t.textMuted, fontSize: 12, marginTop: 3 },

    secureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 12,
    },
    secureText: { color: t.textMuted, fontSize: 12 },

    addButton: {
      height: 54,
      marginHorizontal: 20,
      borderRadius: 16,
      backgroundColor: t.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    addButtonText: { color: t.onPrimary, fontSize: 15, fontWeight: '700' },
  });
