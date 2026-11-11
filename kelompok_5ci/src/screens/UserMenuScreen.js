import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { ambilSemuaProduk, KATEGORI } from '../lib/produk';

const CATEGORIES = ['All', ...KATEGORI];

// Kartu produk bersih khusus user (tanpa fitur edit/hapus admin)
function UserGridCard({ item, width, onAdd, onPress }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <TouchableOpacity
      style={[styles.card, { width }]}
      activeOpacity={0.9}
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.price}. Lihat detail`}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
      <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
      <View style={styles.cardBottom}>
        <Text style={styles.cardPrice}>{item.price}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => onAdd(item)}
          activeOpacity={0.85}
          accessibilityLabel={`Tambah ${item.name} ke keranjang`}
        >
          <Ionicons name="add" size={22} color={theme.onPrimary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function UserMenuScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data produk real-time dari Supabase
  useFocusEffect(
    useCallback(() => {
      let aktif = true;
      (async () => {
        try {
          const data = await ambilSemuaProduk();
          if (aktif) setItems(data);
        } catch (e) {
          if (aktif) Alert.alert('Gagal memuat produk', e.message);
        } finally {
          if (aktif) setLoading(false);
        }
      })();
      return () => { aktif = false; };
    }, []),
  );
  
  const { addToCart, cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const filteredProducts = selectedCategory === 'All'
    ? items
    : items.filter(item => item.category === selectedCategory);

  const H_PADDING = 24;
  const GAP = 12;
  const cardWidth = (width - H_PADDING * 2 - GAP) / 2;

  const handleAdd = (item) => {
    addToCart(item);
    Alert.alert('Berhasil', `${item.name} ditambahkan ke keranjang!`);
  };

  // Navigasi ke detail khusus user (bisa diarahkan ke ProductDetail versi tanpa tombol admin, atau buat view terpisah)
  const openDetail = (item) => navigation.navigate('ProductDetail', { item });

  const renderHeader = () => (
    <View>
      {/* Header User: Tanpa tombol + (tambah produk) */}
      <View style={styles.header}>
        <Text style={styles.title}>Menu Pilihan</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <Ionicons name="search-outline" size={24} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Cart')}
            accessibilityLabel={`Buka keranjang, ${cartCount} item`}
          >
            <Ionicons name="bag-handle-outline" size={24} color={theme.primary} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Kategori */}
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
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
          ) : (
            <Text style={styles.emptyText}>Belum ada produk yang tersedia.</Text>
          )
        }
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{
          paddingHorizontal: H_PADDING,
          marginBottom: GAP,
          justifyContent: 'space-between',
        }}
        contentContainerStyle={styles.scrollContent}
        renderItem={({ item }) => (
          <UserGridCard item={item} width={cardWidth} onAdd={handleAdd} onPress={openDetail} />
        )}
      />

      {/* Bottom Nav khusus User */}
      <View style={[styles.bottomNav, { height: 70 + insets.bottom, paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.navItem}>
          <View style={styles.activeNavIcon}>
            <Ionicons name="bag-outline" size={19} color={theme.onPrimary} />
          </View>
          <Text style={styles.activeNavLabel}>Menu</Text>
        </View>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Ionicons name="home-outline" size={24} color={theme.navInactive} />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <Ionicons name="person-outline" size={24} color={theme.navInactive} />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (t) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: t.background },
  scrollContent: { paddingBottom: 120 },
  emptyText: { textAlign: 'center', color: t.textMuted, marginTop: 40, paddingHorizontal: 24 },

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
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: t.primary,
    borderWidth: 2,
    borderColor: t.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: t.onPrimary, fontSize: 9, fontWeight: '700' },

  categoryContainer: { paddingHorizontal: 24, marginVertical: 12 },
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
  categoryButtonActive: { backgroundColor: t.primary, borderColor: t.primary },
  categoryText: { color: t.textMuted, fontWeight: '500' },
  categoryTextActive: { color: t.onPrimary, fontWeight: '600' },

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
  cardImage: { width: '100%', height: 110, borderRadius: 40, marginBottom: 10 },
  cardName: { fontSize: 15, fontWeight: 'bold', color: t.text, minHeight: 40 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
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
    borderTopColor: t.navBorder,
  },
  navItem: { minWidth: 60, alignItems: 'center', justifyContent: 'center' },
  navLabel: { marginTop: 2, color: t.navInactive, fontSize: 11 },
  activeNavIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: t.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNavLabel: { marginTop: 2, color: t.primary, fontSize: 9 },
});