import React, { useMemo, useState } from 'react';
import {
  LayoutAnimation,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import FadeInView from '../components/FadeInView';
import ScreenHeader from '../components/ScreenHeader';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// TODO: ganti dengan kontak asli Dapur Chikara
const WHATSAPP_NUMBER = '6281222884298'; // format internasional, tanpa + atau 0 di depan
const SUPPORT_EMAIL = 'sabbicareledwardpiris15@gmail.com';

const serifFont = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

const faqs = [
  {
    q: 'When will my bread arrive?',
    a: 'We deliver Tuesday–Sunday, 7am–1pm. Choose your delivery window at checkout. We’ll send a little nudge when your bakes are on the way.',
  },
  {
    q: 'Can I change or cancel an order?',
    a: 'You can change or cancel an order until it starts baking. Head to My Orders, or chat with us and we’ll sort it out.',
  },
  {
    q: 'Do you offer gluten-free bakes?',
    a: 'We bake a small rotating selection of gluten-free treats. Check the Menu for what’s fresh today.',
  },
  {
    q: 'How do I keep my bread fresh?',
    a: 'Keep it in a paper bag or bread box at room temperature. For longer storage, slice and freeze, then toast straight from the freezer.',
  },
];

export default function Support({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    // Animasi buka/tutup accordion
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === index ? null : index);
  };

  const openWhatsApp = () => Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}`).catch(() => {});
  const openEmail = () => Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => {});

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FadeInView distance={0} duration={300} style={{ flex: 1 }}>
        <ScreenHeader title="Support" navigation={navigation} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <FadeInView delay={80}>
            <Text style={styles.eyebrow}>A LITTLE HELP, FRESHLY SERVED</Text>
            <Text style={styles.headline}>We’re here for you.</Text>
            <Text style={styles.subtitle}>
              From your first loaf to your weekly ritual, let’s make every order a good one.
            </Text>
          </FadeInView>

          <FadeInView delay={170}>
            <Text style={styles.sectionTitle}>Frequently asked questions</Text>
          </FadeInView>

          {faqs.map((item, i) => {
            const open = openIndex === i;
            return (
              <FadeInView key={item.q} delay={230 + i * 70}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => toggleFaq(i)}
                  style={[styles.faqCard, open && styles.faqCardOpen]}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                >
                  <View style={styles.faqHeader}>
                    <Text style={styles.faqQuestion}>{item.q}</Text>
                    <Ionicons name={open ? 'remove' : 'add'} size={20} color={theme.text} />
                  </View>
                  {open && <Text style={styles.faqAnswer}>{item.a}</Text>}
                </TouchableOpacity>
              </FadeInView>
            );
          })}

          <FadeInView delay={540} style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Real people, daily · 7am–5pm</Text>
          </FadeInView>
        </ScrollView>

        <FadeInView delay={620} style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85} onPress={openWhatsApp}>
            <Ionicons name="chatbubble-outline" size={20} color={theme.onPrimary} />
            <Text style={styles.primaryButtonText}>Chat on WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85} onPress={openEmail}>
            <Ionicons name="mail-outline" size={20} color={theme.text} />
            <Text style={styles.secondaryButtonText}>Email Us</Text>
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

    eyebrow: { color: t.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.4 },
    headline: { color: t.text, fontSize: 30, fontFamily: serifFont, marginTop: 10 },
    subtitle: { color: t.textMuted, fontSize: 15, lineHeight: 23, marginTop: 10 },
    sectionTitle: { color: t.text, fontSize: 20, marginTop: 28, marginBottom: 14 },

    faqCard: {
      padding: 16,
      marginBottom: 12,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.surface,
    },
    faqCardOpen: { backgroundColor: t.badgeBg, borderColor: t.primary },
    faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    faqQuestion: { flex: 1, color: t.text, fontSize: 15, fontWeight: '700' },
    faqAnswer: { color: t.text, fontSize: 14, lineHeight: 21, marginTop: 12 },

    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
    statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: t.success },
    statusText: { color: t.textMuted, fontSize: 13 },

    actions: { paddingHorizontal: 20, gap: 12, paddingTop: 8 },
    primaryButton: {
      height: 54,
      borderRadius: 16,
      backgroundColor: t.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    primaryButtonText: { color: t.onPrimary, fontSize: 15, fontWeight: '700' },
    secondaryButton: {
      height: 54,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.surface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    secondaryButtonText: { color: t.text, fontSize: 15, fontWeight: '700' },
  });
