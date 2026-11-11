import React, { useState, useMemo } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import BottomNav from '../components/BottomNav'; // Import BottomNav terpisah

const ongoingOrders = [
  {
    id: '#1052',
    date: '21 Okt 2026',
    name: 'The breakfast box',
    details: '2 croissants · 1 sourdough',
    price: 'Rp 385.000',
    status: 'Sedang Disiapkan',
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=240&h=180&fit=crop',
  },
  {
    id: '#1049',
    date: '20 Okt 2026',
    name: 'A little afternoon joy',
    details: '4 cinnamon rolls',
    price: 'Rp 285.000',
    status: 'Dalam Perjalanan',
    image: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=240&h=180&fit=crop',
  },
];

const previousOrders = [
  {
    id: '#1048',
    date: '12 Okt 2026',
    name: 'The breakfast box',
    details: '2 croissants · 1 sourdough',
    price: 'Rp 385.000',
    status: 'Terkirim',
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=240&h=180&fit=crop',
  },
  {
    id: '#1026',
    date: '05 Okt 2026',
    name: 'A little afternoon joy',
    details: '4 cinnamon rolls',
    price: 'Rp 285.000',
    status: 'Terkirim',
    image: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=240&h=180&fit=crop',
  },
  {
    id: '#0991',
    date: '28 Sep 2026',
    name: 'Your daily sourdough',
    details: '1 country loaf · 1 baguette',
    price: 'Rp 230.000',
    status: 'Terkirim',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=240&h=180&fit=crop',
  },
];

export default function MyOrders({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  // Menggunakan key bahasa Indonesia untuk state tab ('Berjalan' atau 'Riwayat')
  const [activeTab, setActiveTab] = useState('Berjalan');
  const orders = activeTab === 'Berjalan' ? ongoingOrders : previousOrders;

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Profile');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Profil"
        >
          <Ionicons name="arrow-back" size={18} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Pesanan Saya</Text>
      </View>

      <View style={styles.tabs}>
        {[
          { key: 'Berjalan', label: 'Berjalan' },
          { key: 'Riwayat', label: 'Riwayat' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.orderList}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>
            {activeTab === 'Berjalan' ? 'DALAM PROSES' : 'SELESAI & TERKIRIM'}
          </Text>
          <Text style={styles.orderCount}>
            {orders.length} {orders.length === 1 ? 'pesanan' : 'pesanan'}
          </Text>
        </View>

        {orders.map((order) => {
          const isDelivered = order.status === 'Terkirim';
          return (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.cardMeta}>
                <Text style={styles.orderDate}>{order.date} · {order.id}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    !isDelivered && styles.activeStatusBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      !isDelivered && styles.activeStatusText,
                    ]}
                  >
                    {order.status}
                  </Text>
                </View>
              </View>

              <View style={styles.productRow}>
                <Image source={{ uri: order.image }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{order.name}</Text>
                  <Text style={styles.productDetails}>{order.details}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.price}>{order.price}</Text>
                {!isDelivered && (
                  <View style={styles.progressLabel}>
                    <Ionicons name="time-outline" size={14} color={theme.primary} />
                    <Text style={styles.progressText}>Pesanan sedang diproses</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Komponen BottomNav terpisah (aktif di tab Profil karena halaman Pesanan bagian dari akun) */}
      <BottomNav active="Profile" />
    </SafeAreaView>
  );
}

const createStyles = (t) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: t.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
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
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 4,
    borderRadius: 11,
    backgroundColor: t.card,
  },
  tab: {
    flex: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: t.primary,
  },
  tabText: {
    color: t.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabText: {
    color: t.onPrimary,
  },
  orderList: {
    paddingHorizontal: 20,
    // Memberikan ruang bawah agar konten tidak tertutup oleh BottomNav yang melayang
    paddingBottom: 110, 
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: t.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  orderCount: {
    color: t.textMuted,
    fontSize: 10,
  },
  orderCard: {
    marginBottom: 10,
    padding: 10,
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
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderDate: {
    color: t.textMuted,
    fontSize: 9,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: t.successBg,
  },
  statusText: {
    color: t.success,
    fontSize: 8,
    fontWeight: '600',
  },
  activeStatusBadge: {
    backgroundColor: t.badgeBg,
  },
  activeStatusText: {
    color: t.primary,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },
  productImage: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: t.border,
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
  },
  productName: {
    color: t.text,
    fontSize: 12,
    fontWeight: '700',
  },
  productDetails: {
    marginTop: 3,
    color: t.textMuted,
    fontSize: 9,
  },
  cardFooter: {
    minHeight: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    color: t.text,
    fontSize: 12,
    fontWeight: '700',
  },
  progressLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressText: {
    color: t.primary,
    fontSize: 9,
    fontWeight: '600',
  },
});