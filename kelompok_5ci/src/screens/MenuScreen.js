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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';
import BottomNav from '../components/BottomNav'; // Import BottomNav terpisah

const CATEGORIES = ['Semua', 'Roti', 'Pastri', 'Kue', 'Minuman'];

/* ------------------------------- Kartu produk ------------------------------- */
function GridCard({ item, width, onAdd, onPress }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <TouchableOpacity
      style={[styles.card, { width }]}
      activeOpacity={0.9}
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.price}. View details`}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
      <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
      <View style={styles.cardBottom}>
        <Text style={styles.cardPrice}>{item.price}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => onAdd(item)}
          activeOpacity={0.85}
          accessibilityLabel={`Add ${item.name} to cart`}
        >
          <Ionicons name="add" size={22} color={theme.onPrimary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

/* --------------------------------- Layar Menu --------------------------------- */
export default function MenuScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { width } = useWindowDimensions();

  // Diubah ke 'Semua' agar sinkron dengan array CATEGORIES
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  
  // Logika Cart global
  const { addToCart } = useCart();

  // Logika Filter kategori
  const filteredProducts = selectedCategory === 'Semua'
    ? PRODUCTS
    : PRODUCTS.filter(item => item.category === selectedCategory);

  const H_PADDING = 24;
  const GAP = 12;
  const cardWidth = (width - H_PADDING * 2 - GAP) / 2;

  const handleAdd = (item) => {
    addToCart(item);
    alert(`Berhasil menambahkan ${item.name} ke keranjang!`);
  };

  const openDetail = (item) => navigation.navigate('ProductDetail', { item });

  const renderHeader = () => (
    <View>
      {/* Header dengan Title dan Aksi Kanan */}
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
        renderItem={({ item }) => (
          <GridCard item={item} width={cardWidth} onAdd={handleAdd} onPress={openDetail} />
        )}
      />

      {/* Menggunakan komponen BottomNav terpisah dengan indikator aktif di 'Menu' */}
      <BottomNav active="Menu" />
    </SafeAreaView>
  );
}

/* ----------------------------------- Styles ----------------------------------- */
const createStyles = (t) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: t.background },
  scrollContent: { paddingBottom: 120 }, // Memberi ruang agar konten terbawah tidak tertutup BottomNav

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
});