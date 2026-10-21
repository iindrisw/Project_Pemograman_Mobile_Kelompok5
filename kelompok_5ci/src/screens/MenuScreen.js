import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  Platform 
} from 'react-native';

import { Ionicons, Feather } from '@expo/vector-icons';

// Data produk contoh dengan gambar dari Unsplash
const IMG_SOURDOUGH = 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=500';
const IMG_CROISSANT = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500';
const IMG_BREAD = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500';
const IMG_TART = 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=500';

const PRODUCTS = [
  { id: '101', name: 'Classic Sourdough', category: 'Bread', price: '$6.50', image: IMG_SOURDOUGH },
  { id: '102', name: 'Classic Butter Croissant', category: 'Pastries', price: '$3.50', image: IMG_CROISSANT },
  { id: '103', name: 'Chocolate Sourdough', category: 'Bread', price: '$5.25', image: IMG_BREAD },
  { id: '104', name: 'Lemon Tart', category: 'Cakes', price: '$4.75', image: IMG_TART },
];

const CATEGORIES = ['All', 'Bread', 'Pastries', 'Cakes', 'Drinks'];

export default function MenuScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter produk berdasarkan kategori yang dipilih
  const filteredProducts = selectedCategory === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(item => item.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
        <View style={styles.headerIcons}>
          {/* Tombol Shopping Bag menuju ke Cart */}
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="bag-outline" size={20} color="#EA580C" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <Feather name="search" size={20} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <Feather name="sliders" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Kategori Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
          {CATEGORIES.map((cat, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.categoryButton, 
                selectedCategory === cat && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.categoryText, 
                selectedCategory === cat && styles.categoryTextActive
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section Title & Count */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fresh from the oven</Text>
          <Text style={styles.itemCount}>{filteredProducts.length} items</Text>
        </View>

        {/* Product Grid */}
        <View style={styles.gridContainer}>
          {filteredProducts.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.imageWrapper}>
                <Image 
                  source={{ uri: item.image }} 
                  style={styles.productImage} 
                  resizeMode="cover" 
                />
              </View>
              
              <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
              
              <View style={styles.cardFooter}>
                <Text style={styles.productPrice}>{item.price}</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => {
                    alert(`Added ${item.name} to cart!`);
                    // Mengirim item dengan timestamp agar navigasi selalu mendeteksi perubahan data
                    navigation.navigate('Cart', { newItem: item, timestamp: Date.now() });
                  }}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItemActive}>
          <Ionicons name="bag" size={20} color="#fff" />
          <Text style={styles.navTextActive}>Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Feather name="home" size={20} color="#888" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Feather name="user" size={20} color="#888" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111' },
  headerIcons: { flexDirection: 'row', gap: 10 },
  iconButton: { padding: 8, borderRadius: 20, backgroundColor: '#F0F0F0' },
  categoryContainer: { paddingHorizontal: 20, marginBottom: 20 },
  categoryButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0', marginRight: 10, height: 36, justifyContent: 'center' },
  categoryButtonActive: { backgroundColor: '#D96B27' },
  categoryText: { color: '#555', fontWeight: '500' },
  categoryTextActive: { color: '#fff' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 15, alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  itemCount: { color: '#888', fontSize: 12 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, justifyContent: 'space-between', paddingBottom: 80 },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 20, padding: 12, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: Platform.OS === 'ios' ? 0.05 : 0.1, shadowRadius: 5, elevation: 2 },
  imageWrapper: { width: '100%', height: 120, borderRadius: 15, overflow: 'hidden', backgroundColor: '#EAEAEA', marginBottom: 10 },
  productImage: { width: '100%', height: '100%' },
  productName: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: '#111' },
  addButton: { backgroundColor: '#D96B27', padding: 6, borderRadius: 12 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 65, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEE', paddingBottom: 5 },
  navItemActive: { flexDirection: 'row', backgroundColor: '#D96B27', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, alignItems: 'center', gap: 6 },
  navTextActive: { color: '#fff', fontWeight: '600', fontSize: 12 },
  navItem: { alignItems: 'center' },
  navText: { color: '#888', fontSize: 11, marginTop: 2 },
});