import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

/*
 * Bottom navigation tunggal untuk seluruh aplikasi.
 *
 * Cara pakai di screen (sama seperti useTheme, tidak perlu kode nav lagi):
 *
 *   import BottomNav from '../components/BottomNav';
 *   ...
 *   <BottomNav active="Home" />        // 'Menu' | 'Home' | 'Profile'
 *
 * Mau tambah / ubah tab? Cukup edit array TABS di bawah ini.
 * `route` harus sama dengan name di Stack.Screen pada App.js.
 */
export const TABS = [
  { route: 'Menu', label: 'Menu', icon: 'bag-outline' },
  { route: 'Home', label: 'Beranda', icon: 'home-outline' },
  { route: 'Profile', label: 'Profil', icon: 'person-outline' },
];

// Tinggi dasar nav (belum termasuk safe area bawah). Dipakai kalau screen
// butuh menyisakan ruang di bawah kontennya.
export const BOTTOM_NAV_HEIGHT = 70;

export default function BottomNav({ active }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bottomNav,
        { height: BOTTOM_NAV_HEIGHT + insets.bottom, paddingBottom: insets.bottom + 8 },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = tab.route === active;
        return (
          <TouchableOpacity
            key={tab.route}
            style={styles.navItem}
            activeOpacity={0.8}
            onPress={() => {
              if (!isActive) navigation.navigate(tab.route);
            }}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
          >
            {isActive ? (
              <View style={styles.activeIcon}>
                <Ionicons name={tab.icon} size={19} color={theme.onPrimary} />
              </View>
            ) : (
              <Ionicons name={tab.icon} size={24} color={theme.navInactive} />
            )}
            <Text style={isActive ? styles.activeLabel : styles.label}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const createStyles = (t) =>
  StyleSheet.create({
    bottomNav: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: t.surface,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: t.navBorder,
    },
    navItem: { minWidth: 60, alignItems: 'center', justifyContent: 'center' },
    label: { marginTop: 2, color: t.navInactive, fontSize: 11 },
    activeIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: t.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeLabel: { marginTop: 2, color: t.primary, fontSize: 11, fontWeight: '700' },
  });