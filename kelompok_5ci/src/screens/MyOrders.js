import React, { useState } from 'react';
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

const ongoingOrders = [
  {
    id: '#1052',
    date: '21 Oct 2026',
    name: 'The breakfast box',
    details: '2 croissants · 1 sourdough',
    price: '$24.50',
    status: 'Preparing',
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=240&h=180&fit=crop',
  },
  {
    id: '#1049',
    date: '20 Oct 2026',
    name: 'A little afternoon joy',
    details: '4 cinnamon rolls',
    price: '$18.00',
    status: 'On the way',
    image: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=240&h=180&fit=crop',
  },
];

const previousOrders = [
  {
    id: '#1048',
    date: '12 Oct 2026',
    name: 'The breakfast box',
    details: '2 croissants · 1 sourdough',
    price: '$24.50',
    status: 'Delivered',
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=240&h=180&fit=crop',
  },
  {
    id: '#1026',
    date: '05 Oct 2026',
    name: 'A little afternoon joy',
    details: '4 cinnamon rolls',
    price: '$18.00',
    status: 'Delivered',
    image: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=240&h=180&fit=crop',
  },
  {
    id: '#0991',
    date: '28 Sep 2026',
    name: 'Your daily sourdough',
    details: '1 country loaf · 1 baguette',
    price: '$14.50',
    status: 'Delivered',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=240&h=180&fit=crop',
  },
];

export default function MyOrders({ navigation }) {
  const [activeTab, setActiveTab] = useState('Ongoing');
  const orders = activeTab === 'Ongoing' ? ongoingOrders : previousOrders;

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
          accessibilityLabel="Back to Profile"
        >
          <Ionicons name="arrow-back" size={18} color="#493a31" />
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
      </View>

      <View style={styles.tabs}>
        {['Ongoing', 'History'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab}
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
            {activeTab === 'Ongoing' ? 'IN PROGRESS' : 'BAKED & DELIVERED'}
          </Text>
          <Text style={styles.orderCount}>
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </Text>
        </View>

        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.cardMeta}>
              <Text style={styles.orderDate}>{order.date} · {order.id}</Text>
              <View
                style={[
                  styles.statusBadge,
                  order.status !== 'Delivered' && styles.activeStatusBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    order.status !== 'Delivered' && styles.activeStatusText,
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
              {order.status !== 'Delivered' && (
                <View style={styles.progressLabel}>
                  <Ionicons name="time-outline" size={14} color="#c96a27" />
                  <Text style={styles.progressText}>Order in progress</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#faf7f2',
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
    borderColor: '#eee4da',
    borderRadius: 12,
    backgroundColor: '#fffdfa',
  },
  title: {
    color: '#382c25',
    fontSize: 21,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 4,
    borderRadius: 11,
    backgroundColor: '#f2e9df',
  },
  tab: {
    flex: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#ce6b21',
  },
  tabText: {
    color: '#8b786a',
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#ffffff',
  },
  orderList: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#8b786a',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  orderCount: {
    color: '#8b786a',
    fontSize: 10,
  },
  orderCard: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee5dc',
    borderRadius: 14,
    backgroundColor: '#fffdfa',
    shadowColor: '#382c25',
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
    color: '#927f72',
    fontSize: 9,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#eaf0e5',
  },
  statusText: {
    color: '#55704b',
    fontSize: 8,
    fontWeight: '600',
  },
  activeStatusBadge: {
    backgroundColor: '#f9eadc',
  },
  activeStatusText: {
    color: '#bf641f',
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
    backgroundColor: '#eee5dc',
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
  },
  productName: {
    color: '#382c25',
    fontSize: 12,
    fontWeight: '700',
  },
  productDetails: {
    marginTop: 3,
    color: '#927f72',
    fontSize: 9,
  },
  cardFooter: {
    minHeight: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    color: '#382c25',
    fontSize: 12,
    fontWeight: '700',
  },
  progressLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressText: {
    color: '#c96a27',
    fontSize: 9,
    fontWeight: '600',
  },
});