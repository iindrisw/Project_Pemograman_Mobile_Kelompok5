import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import FadeInView from '../components/FadeInView';
import ScreenHeader from '../components/ScreenHeader';
import AnimatedSwitch from '../components/AnimatedSwitch';
import ChangePasswordModal from '../components/ChangePasswordModal';
import LanguageModal from '../components/LanguageModal';

export default function Settings({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [push, setPush] = useState(true);
  const [promo, setPromo] = useState(false);
  const [language, setLanguage] = useState('English');
  const [showPassword, setShowPassword] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);

  const toggles = [
    {
      key: 'push',
      icon: 'notifications-outline',
      title: 'Push Notifications',
      subtitle: 'Order updates, fresh from the oven.',
      value: push,
      onChange: setPush,
    },
    {
      key: 'promo',
      icon: 'mail-outline',
      title: 'Email Promo Updates',
      subtitle: 'Seasonal bakes & little treats.',
      value: promo,
      onChange: setPromo,
    },
    {
      key: 'dark',
      icon: 'moon-outline',
      title: 'Dark Mode',
      subtitle: 'A softer glow after sundown.',
      value: isDark,
      onChange: toggleTheme, // memakai state theme global
    },
  ];

  const account = [
    { key: 'password', icon: 'key-outline', title: 'Change Password', onPress: () => setShowPassword(true) },
    { key: 'language', icon: 'globe-outline', title: 'Language', value: language, onPress: () => setShowLanguage(true) },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <FadeInView distance={0} duration={300} style={{ flex: 1 }}>
        <ScreenHeader title="Settings" navigation={navigation} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <FadeInView delay={80}>
            <Text style={styles.eyebrow}>MAKE YOURSELF AT HOME</Text>
            <Text style={styles.intro}>
              A few little preferences to make your bakery experience feel like you.
            </Text>
          </FadeInView>

          <FadeInView delay={160}>
            <Text style={[styles.eyebrow, styles.groupLabel]}>PREFERENCES</Text>
            <View style={styles.group}>
              {toggles.map((row, i) => (
                <View key={row.key} style={[styles.row, i < toggles.length - 1 && styles.rowDivider]}>
                  <Ionicons name={row.icon} size={22} color={theme.primary} style={styles.rowIcon} />
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{row.title}</Text>
                    <Text style={styles.rowSubtitle}>{row.subtitle}</Text>
                  </View>
                  <AnimatedSwitch value={row.value} onValueChange={row.onChange} label={row.title} />
                </View>
              ))}
            </View>
          </FadeInView>

          <FadeInView delay={260}>
            <Text style={[styles.eyebrow, styles.groupLabel]}>ACCOUNT</Text>
            <View style={styles.group}>
              {account.map((row, i) => (
                <TouchableOpacity
                  key={row.key}
                  activeOpacity={0.7}
                  style={[styles.row, styles.accountRow, i < account.length - 1 && styles.rowDivider]}
                  onPress={row.onPress}
                  accessibilityRole="button"
                >
                  <Ionicons name={row.icon} size={22} color={theme.primary} style={styles.rowIcon} />
                  <Text style={[styles.rowTitle, { flex: 1 }]}>{row.title}</Text>
                  {row.value ? <Text style={styles.rowValue}>{row.value}</Text> : null}
                  <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </FadeInView>
        </ScrollView>

        <FadeInView delay={400}>
          <Text style={styles.version}>Dapur Chikara · Version 1.0.0</Text>
        </FadeInView>
      </FadeInView>

      <ChangePasswordModal visible={showPassword} onClose={() => setShowPassword(false)} />
      <LanguageModal
        visible={showLanguage}
        current={language}
        onClose={() => setShowLanguage(false)}
        onSave={setLanguage}
      />
    </SafeAreaView>
  );
}

const createStyles = (t) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: t.background },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
    eyebrow: { color: t.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.4 },
    intro: { color: t.textMuted, fontSize: 15, lineHeight: 23, marginTop: 10 },
    groupLabel: { marginTop: 28, marginBottom: 12 },

    group: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.surface,
      paddingHorizontal: 16,
    },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
    accountRow: { paddingVertical: 20 },
    rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.border },
    rowIcon: { marginRight: 14 },
    rowText: { flex: 1, paddingRight: 12 },
    rowTitle: { color: t.text, fontSize: 15, fontWeight: '700' },
    rowSubtitle: { color: t.textMuted, fontSize: 12, marginTop: 4 },
    rowValue: { color: t.textMuted, fontSize: 13, marginRight: 10 },

    version: { textAlign: 'center', color: t.textMuted, fontSize: 12, paddingBottom: 12 },
  });
