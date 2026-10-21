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

  const goToHome = () => navigation.navigate('Home');
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

            if (option.label === 'My Orders' || option.label === 'Shipping Addresses') {
              return (
                <TouchableOpacity
                  key={option.label}
                  style={rowStyle}
                  onPress={() =>
                    navigation.navigate(
                      option.label === 'My Orders' ? 'MyOrders' : 'Address',
                    )
                  }
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

      <View
        style={[
          styles.bottomNav,
          { height: 70 + insets.bottom, paddingBottom: insets.bottom + 8 },
        ]}
      >
        <TouchableOpacity
          style={styles.navItem}
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
