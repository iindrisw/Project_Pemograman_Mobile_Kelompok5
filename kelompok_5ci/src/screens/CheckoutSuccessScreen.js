import React, { useEffect, useMemo } from 'react';
import {
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import FadeInView from '../components/FadeInView';

// Nomor pesanan sementara; ganti dengan ID dari backend kalau sudah ada
const makeOrderId = () => `#DC-${Math.floor(10000 + Math.random() * 90000)}`;

export default function CheckoutSuccessScreen({ navigation, route }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  // Data pesanan dikirim dari CartScreen lewat route params
  const orderId = useMemo(() => route?.params?.orderId || makeOrderId(), [route?.params?.orderId]);
  const totalAmount = route?.params?.totalAmount || '$0.00';

  const goHome = () => navigation.navigate('Home');

  // Tombol back Android kembali ke Home, bukan ke keranjang
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      goHome();
      return true;
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = [
    { label: 'Order ID', value: orderId },
    { label: 'Payment status', value: 'Paid', success: true },
    { label: 'Total amount', value: totalAmount },
    { label: 'Estimated pickup', value: '15 – 20 minutes' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <FadeInView delay={50} style={styles.iconWrap}>
          <View style={styles.iconRing}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark" size={48} color={theme.onPrimary} />
            </View>
          </View>
        </FadeInView>

        <FadeInView delay={160}>
          <Text style={styles.title}>Order placed!</Text>
          <Text style={styles.subtitle}>
            Thank you for ordering from <Text style={styles.brandBold}>Dapur Chikara</Text>. Your
            bakes are getting ready.
          </Text>
        </FadeInView>

        <FadeInView delay={260} style={styles.card}>
          {rows.map((row, i) => (
            <View key={row.label}>
              <View style={styles.rowItem}>
                <Text style={styles.labelText}>{row.label}</Text>
                <Text style={[styles.valueText, row.success && { color: theme.success }]}>
                  {row.value}
                </Text>
              </View>
              {i < rows.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </FadeInView>

        <FadeInView delay={360} style={styles.infoBox}>
          <MaterialCommunityIcons name="information-outline" size={20} color={theme.primary} />
          <Text style={styles.infoText}>
            Our bakers have started on your order. You can follow its progress in My Orders.
          </Text>
        </FadeInView>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('MyOrders')}
          accessibilityRole="button"
        >
          <Text style={styles.primaryBtnText}>Track my order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.85}
          onPress={goHome}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryBtnText}>Back to home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (t) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: t.background },
    container: { padding: 24, alignItems: 'center', paddingBottom: 40 },

    iconWrap: { marginTop: 28, marginBottom: 24, alignItems: 'center' },
    iconRing: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: t.badgeBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconCircle: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: t.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      shadowColor: t.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },

    title: { fontSize: 26, fontWeight: '700', color: t.text, textAlign: 'center', marginBottom: 8 },
    subtitle: {
      fontSize: 14,
      color: t.textMuted,
      textAlign: 'center',
      paddingHorizontal: 10,
      marginBottom: 26,
      lineHeight: 21,
    },
    brandBold: { fontWeight: '700', color: t.text },

    card: {
      width: '100%',
      backgroundColor: t.surface,
      borderRadius: 20,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: t.border,
      marginBottom: 16,
    },
    rowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    labelText: { fontSize: 14, color: t.textMuted },
    valueText: { fontSize: 14, fontWeight: '700', color: t.text },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: t.border },

    infoBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.surface,
    },
    infoText: { flex: 1, fontSize: 13, color: t.textMuted, lineHeight: 19 },

    footer: {
      paddingHorizontal: 24,
      paddingTop: 12,
      backgroundColor: t.surface,
      borderTopWidth: 1,
      borderTopColor: t.border,
      gap: 10,
    },
    primaryBtn: {
      backgroundColor: t.primary,
      borderRadius: 16,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
    },
    primaryBtnText: { color: t.onPrimary, fontSize: 16, fontWeight: '700' },
    secondaryBtn: {
      borderRadius: 16,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: t.border,
    },
    secondaryBtnText: { color: t.text, fontSize: 15, fontWeight: '600' },
  });
