import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data dari backend (nanti terhubung ke MongoDB via Express API)
  useEffect(() => {
    fetchHomeScreenData();
  }, []);

  const fetchHomeScreenData = async () => {
    try {
      // Endpoint API backend yang disediakan
      // Ganti localhost dengan IP Laptop jika dites di HP
      const response = await fetch('http://localhost:5000/api/home-data');
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
        setBestSellers(data.bestSellers);
      }
    } catch (error) {
      console.log('Menggunakan data dummy lokal jika backend belum dinyalakan');
      // Fallback data dummy jika server offline
      setCategories([
        { id: '1', name: 'Bread', icon: 'barley' },
        { id: '2', name: 'Pastries', icon: 'croissant' },
        { id: '3', name: 'Cakes', icon: 'cake-variant' },
      ]);
      setBestSellers([
        {
          id: '101',
          name: 'Classic Sourdough',
          price: '$6.50',
          image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=500',
        },
        {
          id: '102',
          name: 'Classic Butter Croissant',
          price: '$3.50',
          image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. Header App */}
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <MaterialCommunityIcons name="croissant" size={32} color="#ea580c" />
          <Text style={styles.brandTitle}>MyBakery</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="bag-handle-outline" size={24} color="#2d1a0e" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 2. Hero Banner Promo */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerSubtitle}>FRESHLY BAKED DAILY</Text>
            <Text style={styles.bannerTitle}>Warm bread, fresh pastries, made with love.</Text>
            <TouchableOpacity style={styles.orderButton}>
              <Text style={styles.orderButtonText}>Order Now</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500' }}
            style={styles.bannerImage}
          />
        </View>

        {/* 3. Kategori Produk */}
        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryCard}>
              <View style={styles.categoryIconCircle}>
                <MaterialCommunityIcons name={cat.icon || 'food-croissant'} size={26} color="#d97706" />
              </View>
              <Text style={styles.categoryText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 4. Best Sellers Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Best Sellers</Text>
          <TouchableOpacity style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>View all</Text>
            <Ionicons name="arrow-up-right-outline" size={16} color="#d97706" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#ea580c" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.productsGrid}>
            {bestSellers.map((item) => (
              <View key={item.id} style={styles.productCard}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>{item.price}</Text>
                <TouchableOpacity style={styles.addToCartBtn}>
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 5. Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="bag-outline" size={24} color="#888" />
          <Text style={styles.navLabel}>Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.floatingHomeBtn}>
          <Ionicons name="home" size={26} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={24} color="#888" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d1a0e',
  },
  iconButton: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  bannerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  bannerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#d97706',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d1a0e',
    lineHeight: 24,
    marginBottom: 16,
  },
  orderButton: {
    backgroundColor: '#d97706',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  orderButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  bannerImage: {
    width: 110,
    height: 140,
    borderRadius: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  categoryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2d1a0e',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d1a0e',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    color: '#d97706',
    fontWeight: '600',
    fontSize: 13,
  },
  productsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 12,
    width: '48%',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    marginBottom: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d1a0e',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    color: '#78350f',
    marginBottom: 10,
  },
  addToCartBtn: {
    backgroundColor: '#d97706',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingBottom: 10,
  },
  navItem: {
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  floatingHomeBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#d97706',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
    elevation: 4,
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});