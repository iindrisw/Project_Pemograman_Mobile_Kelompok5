import React, { useMemo } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import FadeInView from '../components/FadeInView';
import BottomNav from '../components/BottomNav';

// Nama route tiap menu (harus sama dengan name di Stack.Screen pada App.js)
const routeByLabel = {
  'My Orders': 'MyOrders',
  'Shipping Addresses': 'Address',
  'Payment Methods': 'Payments',
  'Settings': 'Settings',
  'Help & Support': 'Support',
};

const profileOptions = [
  { label: 'My Orders', icon: 'bag-handle-outline' },
  { label: 'Shipping Addresses', icon: 'location-outline' },
  { label: 'Payment Methods', icon: 'card-outline' },
  { label: 'Settings', icon: 'settings-outline' },
  { label: 'Help & Support', icon: 'help-circle-outline' },
];

export default function ProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const logOut = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      }),
    );
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
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop&crop=faces',
            }}
            style={styles.avatar}
            accessibilityLabel="Profile photo"
          />
          <Text style={styles.name}>edward</Text>
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

      <BottomNav active="Profile" />
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
  },
  name: {
    marginTop: 8,
    color: t.text,
    fontSize: 17,
    fontWeight: '700',
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
});
