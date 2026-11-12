import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import FadeInView from '../components/FadeInView';
import { supabase } from '../lib/supabase';
import { useProfil } from '../lib/auth';
import { latihDanSimpanRekomendasi } from '../lib/latihRekomendasi';
import { uploadFoto } from '../lib/produk';

// Nama route tiap menu (harus sama dengan name di Stack.Screen pada App.js)
const routeByLabel = {
  'My Orders': 'MyOrders',
  'Saldo & Pembayaran': 'Payments',
  'Settings': 'Settings',
  'Help & Support': 'Support',
};

const profileOptions = [
  { label: 'My Orders', icon: 'bag-handle-outline' },
  { label: 'Saldo & Pembayaran', icon: 'wallet-outline' },
  { label: 'Settings', icon: 'settings-outline' },
  { label: 'Help & Support', icon: 'help-circle-outline' },
];

export default function ProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [melatih, setMelatih] = useState(false);
  const [avatarUri, setAvatarUri] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const { isAdmin, profil } = useProfil();

  // Ambil username dari akun Supabase yang sedang login
  useEffect(() => {
    let aktif = true;
    supabase.auth.getUser().then(({ data }) => {
      if (aktif) {
        setUsername(data?.user?.user_metadata?.username || '');
        setAvatarUri(data?.user?.user_metadata?.avatar_url || null);
      }
    });
    return () => { aktif = false; };
  }, []);

  const changeAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (result.canceled) return;

      setAvatarLoading(true);
      const avatarUrl = await uploadFoto(result.assets[0].uri);
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      });
      if (error) throw error;

      setAvatarUri(avatarUrl);
    } catch (error) {
      Alert.alert('Profile photo not updated', error.message || 'Please try again.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const goToHome = () => navigation.navigate('Home');
  // Admin ke Menu (ada tombol kelola produk), user biasa ke UserMenu
  const goToMenu = () => navigation.navigate(isAdmin ? 'Menu' : 'UserMenu');

  // Admin: latih ulang model hybrid dari keranjang + pesanan semua akun, simpan ke tabel rekomendasi
  const perbaruiRekomendasi = async () => {
    if (melatih) return;
    setMelatih(true);
    try {
      const r = await latihDanSimpanRekomendasi();
      Alert.alert(
        'Rekomendasi diperbarui',
        `${r.nUser} akun, ${r.nProduk} produk, ${r.nInteraksi} pasangan akun-produk diproses.\n` +
          `${r.nBaris} rekomendasi disimpan.`,
      );
    } catch (e) {
      Alert.alert('Gagal memperbarui rekomendasi', e?.message || 'Terjadi kesalahan.');
    } finally {
      setMelatih(false);
    }
  };

  const logOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        }),
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FadeInView distance={12} duration={350} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 100 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileHeader}>
            <TouchableOpacity
              style={styles.avatar}
              onPress={changeAvatar}
              disabled={avatarLoading}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
            >
              {avatarLoading ? (
                <ActivityIndicator color={theme.primary} />
              ) : avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={34} color={theme.textMuted} />
              )}
              <View style={styles.avatarEdit}>
                <Ionicons name="camera" size={12} color={theme.onPrimary} />
              </View>
            </TouchableOpacity>
            <Text style={styles.name}>{username || profil?.username || 'Guest'}</Text>
            <Text style={styles.avatarHint}>Tap to change photo</Text>
          </View>

          <View style={styles.optionsCard}>
            {profileOptions.map((option, index) => {
              const rowStyle = [
                styles.optionRow,
                index === profileOptions.length - 1 && styles.lastOptionRow,
              ];
              const rowContent = (
                <>
                  <Ionicons name={option.icon} size={18} color={theme.textMuted} />
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
                </>
              );

              if (routeByLabel[option.label]) {
                return (
                  <TouchableOpacity
                    key={option.label}
                    style={rowStyle}
                    onPress={() => navigation.navigate(routeByLabel[option.label])}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                  >
                    {rowContent}
                  </TouchableOpacity>
                );
              }

              return (
                <View key={option.label} style={rowStyle}>
                  {rowContent}
                </View>
              );
            })}
          </View>

          {/* Khusus admin: latih ulang model rekomendasi dari data penjualan & keranjang */}
          {isAdmin && (
            <TouchableOpacity
              style={[styles.adminButton, melatih && styles.adminButtonBusy]}
              onPress={perbaruiRekomendasi}
              disabled={melatih}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Update rekomendasi produk"
              accessibilityState={{ busy: melatih, disabled: melatih }}
            >
              {melatih ? (
                <ActivityIndicator size="small" color={theme.onPrimary} />
              ) : (
                <Ionicons name="sparkles-outline" size={17} color={theme.onPrimary} />
              )}
              <Text style={styles.adminButtonText}>
                {melatih ? 'Memperbarui rekomendasi…' : 'Update Rekomendasi'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={logOut}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Log out"
          >
            <MaterialCommunityIcons name="logout" size={17} color={theme.primary} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>

        <View
          style={[
            styles.bottomNav,
            { height: 70 + insets.bottom, paddingBottom: insets.bottom + 8 },
          ]}
        >
          <TouchableOpacity
            style={styles.navItem}
            onPress={goToMenu}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Menu"
          >
            <Ionicons name="bag-outline" size={24} color={theme.navInactive} />
            <Text style={styles.navLabel}>Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={goToHome}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Back to Home"
          >
            <Ionicons name="home-outline" size={24} color={theme.navInactive} />
            <Text style={styles.navLabel}>Home</Text>
          </TouchableOpacity>

          <View style={styles.navItem}>
            <View style={styles.activeProfileIcon}>
              <Ionicons name="person-outline" size={19} color={theme.onPrimary} />
            </View>
            <Text style={styles.activeNavLabel}>Profile</Text>
          </View>
        </View>
      </FadeInView>
    </SafeAreaView>
  );
}

const createStyles = (t) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: t.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 58,
    paddingBottom: 30,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: t.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  avatarEdit: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: t.primary,
    borderWidth: 2,
    borderColor: t.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: 8,
    color: t.text,
    fontSize: 17,
    fontWeight: '700',
  },
  avatarHint: {
    marginTop: 4,
    color: t.textMuted,
    fontSize: 11,
  },
  optionsCard: {
    backgroundColor: t.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 1,
  },
  optionRow: {
    minHeight: 41,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: t.border,
  },
  lastOptionRow: {
    borderBottomWidth: 0,
  },
  optionLabel: {
    flex: 1,
    marginLeft: 11,
    color: t.text,
    fontSize: 13,
  },
  adminButton: {
    minHeight: 40,
    marginTop: 15,
    borderRadius: 9,
    backgroundColor: t.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  adminButtonBusy: {
    opacity: 0.75,
  },
  adminButtonText: {
    color: t.onPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  logoutButton: {
    minHeight: 38,
    marginTop: 15,
    borderRadius: 9,
    backgroundColor: t.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  logoutText: {
    color: t.primary,
    fontSize: 12,
    fontWeight: '600',
  },
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
  navItem: {
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    marginTop: 2,
    color: t.navInactive,
    fontSize: 11,
  },
  activeProfileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: t.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNavLabel: {
    marginTop: 2,
    color: t.primary,
    fontSize: 9,
  },
});
