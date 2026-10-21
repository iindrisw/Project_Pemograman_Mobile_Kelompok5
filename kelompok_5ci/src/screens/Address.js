import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

const addresses = [
  {
    id: 'home',
    title: 'Home',
    icon: 'home-outline',
    tag: 'Default',
    recipient: 'Sophie Miller',
    street: '124 Maple Street, Apt 3B',
    city: 'Brooklyn, NY 11201',
    note: 'Leave at the door. Ring once, please.',
  },
  {
    id: 'office',
    title: 'Office',
    icon: 'business-outline',
    recipient: 'Sophie Miller',
    street: '85 Water Street, Floor 4',
    city: 'Brooklyn, NY 11201',
    note: 'Reception desk · Mon–Fri, 9am–5pm',
  },
];

export default function Address({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Profile');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.page}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={goBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back to Profile"
          >
            <Ionicons name="arrow-back" size={18} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Addresses</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.eyebrow}>FRESH TO YOUR DOOR</Text>
          <Text style={styles.intro}>
            Your favorite bread, delivered to the places you call yours.
          </Text>

          {addresses.map((address) => (
            <View key={address.id} style={styles.addressCard}>
              <View style={styles.cardHeading}>
                <View style={styles.addressTypeIcon}>
                  <Ionicons name={address.icon} size={17} color={theme.primary} />
                </View>
                <Text style={styles.addressTitle}>{address.title}</Text>
                {address.tag ? (
                  <View style={styles.defaultTag}>
                    <Text style={styles.defaultTagText}>{address.tag}</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.recipient}>{address.recipient}</Text>
              <Text style={styles.addressText}>{address.street}</Text>
              <Text style={styles.addressText}>{address.city}</Text>

              <View style={styles.cardDivider} />
              <View style={styles.cardFooter}>
                <Text style={styles.deliveryNote}>{address.note}</Text>
                <View style={styles.actions}>
                  <Ionicons name="pencil-outline" size={16} color={theme.text} />
                  <Ionicons name="trash-outline" size={16} color={theme.textMuted} />
                </View>
              </View>
            </View>
          ))}

          <View style={styles.deliveryInfo}>
            <MaterialCommunityIcons
              name="truck-delivery-outline"
              size={16}
              color={theme.textMuted}
            />
            <Text style={styles.deliveryInfoText}>
              We deliver locally, Tuesday–Sunday. Your delivery fee is confirmed
              at checkout.
            </Text>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Add new address"
        >
          <Ionicons name="add" size={18} color={theme.onPrimary} />
          <Text style={styles.addButtonText}>Add New Address</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (t) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: t.background,
  },
  page: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
  },
  backButton: {
    width: 36,
    height: 36,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 12,
    backgroundColor: t.surface,
  },
  title: {
    color: t.text,
    fontSize: 21,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  eyebrow: {
    marginTop: 3,
    color: t.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  intro: {
    marginTop: 7,
    marginBottom: 16,
    color: t.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  addressCard: {
    marginBottom: 9,
    padding: 12,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 14,
    backgroundColor: t.surface,
    shadowColor: t.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },
  addressTypeIcon: {
    width: 27,
    height: 27,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: t.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressTitle: {
    flex: 1,
    color: t.text,
    fontSize: 13,
    fontWeight: '600',
  },
  defaultTag: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: t.badgeBg,
  },
  defaultTagText: {
    color: t.primary,
    fontSize: 8,
    fontWeight: '600',
  },
  recipient: {
    marginBottom: 3,
    color: t.text,
    fontSize: 10,
    fontWeight: '700',
  },
  addressText: {
    color: t.text,
    fontSize: 10,
    lineHeight: 15,
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 9,
    marginBottom: 8,
    backgroundColor: t.border,
  },
  cardFooter: {
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deliveryNote: {
    flex: 1,
    color: t.textMuted,
    fontSize: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginLeft: 8,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 7,
    paddingHorizontal: 2,
  },
  deliveryInfoText: {
    flex: 1,
    color: t.textMuted,
    fontSize: 9,
    lineHeight: 14,
  },
  addButton: {
    minHeight: 42,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 9,
    backgroundColor: t.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addButtonText: {
    color: t.onPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
});