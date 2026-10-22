import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext'; 

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

/* ------------------------------- Kartu produk ------------------------------- */
function GridCard({ item, width, onAdd }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={[styles.card, { width }]}>
      <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
      <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
      <View style={styles.cardBottom}>
        <Text style={styles.cardPrice}>{item.price}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => onAdd(item)} activeOpacity={0.85}>
          <Ionicons name="add" size={22} color={theme.onPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* --------------------------------- Layar Menu --------------------------------- */
export default function MenuScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Logika Cart global
  const { addToCart } = useCart();

  // Logika Filter kategori
  const filteredProducts = selectedCategory === 'All'
    ? PRODUCTS
    : PRODUCTS.filter(item => item.category === selectedCategory);

  const H_PADDING = 24;
  const GAP = 12;
  const cardWidth = (width - H_PADDING * 2 - GAP) / 2;

  const handleAdd = (item) => {
    addToCart(item);
    alert(`Added ${item.name} to cart!`);
  };

  const renderHeader = () => (
    <View>
      {/* Header dengan Title dan Aksi Kanan (Search, Filter, dan Cart disatukan) */}
      <View style={styles.header}>
        <Text style={styles.title}>Menu</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <Ionicons name="search-outline" size={24} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <Ionicons name="options-outline" size={22} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="bag-handle-outline" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Kategori horizontal */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {CATEGORIES.map((cat, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.categoryButton,
              selectedCategory === cat && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(cat)}
            activeOpacity={0.8}
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

      <View style={styles.subHeader}>
        <Text style={styles.subTitle}>Fresh from the oven</Text>
        <Text style={styles.count}>{filteredProducts.length} items</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{
          paddingHorizontal: H_PADDING,
          marginBottom: GAP,
          justifyContent: 'space-between',
        }}
        contentContainerStyle={styles.scrollContent}
        renderItem={({ item }) => <GridCard item={item} width={cardWidth} onAdd={handleAdd} />}
      />

      {/* Bottom Nav: Tombol Menu dibuat bulat oranye mengapung di kiri */}
      <View style={[styles.bottomNav, { height: 70 + insets.bottom, paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity 
          style={styles.floatingActiveBtn} 
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Menu')}
        >
          <Ionicons name="bag-handle" size={26} color={theme.onPrimary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home-outline" size={24} color={theme.navInactive} />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={24} color={theme.navInactive} />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ----------------------------------- Styles ----------------------------------- */
const createStyles = (t) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: t.background },
  scrollContent: { paddingBottom: 120 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: t.text },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  categoryContainer: {
    paddingHorizontal: 24,
    marginVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.border,
    marginRight: 10,
    height: 36,
    justifyContent: 'center',
  },
  categoryButtonActive: {
    backgroundColor: t.primary,
    borderColor: t.primary,
  },
  categoryText: {
    color: t.textMuted,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: t.onPrimary,
    fontWeight: '600',
  },

  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 14,
    marginBottom: 16,
  },
  subTitle: { fontSize: 19, fontWeight: 'bold', color: t.text },
  count: { fontSize: 14, color: t.textMuted },

  card: {
    backgroundColor: t.card || t.surface,
    borderRadius: 20,
    padding: 12,
    elevation: 3,
    shadowColor: t.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  cardImage: {
    width: '100%',
    height: 110,
    borderRadius: 40,
    marginBottom: 10,
  },
  cardName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: t.text,
    minHeight: 40,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  cardPrice: { fontSize: 14, color: t.textMuted, fontWeight: 'bold' },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: t.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderTopColor: t.navBorder || t.border,
  },
  navItem: { alignItems: 'center', minWidth: 60 },
  navLabel: { fontSize: 11, color: t.navInactive, marginTop: 2 },
  floatingActiveBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: t.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    elevation: 8,
    shadowColor: t.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
});