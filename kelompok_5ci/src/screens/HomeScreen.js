import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useCart } from '../context/CartContext';

/* ----------------------------- Static dummy data ----------------------------- */
const categories = [
  { id: '1', name: 'Roti', icon: 'barley' },
  { id: '2', name: 'Pastri', icon: 'food-croissant' },
  { id: '3', name: 'Kue', icon: 'cake-variant' },
];

const IMG_SOURDOUGH = 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=500';
const IMG_CROISSANT = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500';
const IMG_BREAD = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500';
const IMG_TART = 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=500';

const bestSellers = [
  { id: '101', name: 'Classic Sourdough', price: 'Rp 100.000', image: IMG_SOURDOUGH },
  { id: '102', name: 'Classic Butter Croissant', price: 'Rp 55.000', image: IMG_CROISSANT },
  { id: '103', name: 'Chocolate Sourdough', price: 'Rp 80.000', image: IMG_BREAD },
];

const newArrivals = [
  { id: '201', name: 'Walnut Rye', price: 'Rp 110.000', image: IMG_SOURDOUGH },
  { id: '202', name: 'Almond Croissant', price: 'Rp 65.000', image: IMG_CROISSANT },
  { id: '203', name: 'Cinnamon Swirl', price: 'Rp 85.000', image: IMG_BREAD },
  { id: '204', name: 'Fig & Honey Tart', price: 'Rp 105.000', image: IMG_TART },
];

/* Slide carousel di Home (isi informasi, silakan ganti teksnya) */
const heroSlides = [
  {
    id: 'h1',
    icon: 'flame-outline',
    tag: 'DIPANGGANG SEGAR SETIAP HARI',
    title: 'Roti hangat, pastri segar, dibuat dengan penuh cinta.',
    image: IMG_BREAD,
  },
  {
    id: 'h2',
    icon: 'time-outline',
    tag: 'BUKA SETIAP HARI',
    title: 'Buka setiap hari, 07:00 – 21:00. Pesan lebih awal untuk diambil.',
    image: IMG_CROISSANT,
  },
  {
    id: 'h3',
    icon: 'bicycle-outline',
    tag: 'GRATIS ONGKIR',
    title: 'Gratis ongkos kirim untuk pesanan di atas Rp 300.000.',
    image: IMG_TART,
  },
];

/* ---------------------------- Reusable ProductCard ---------------------------- */
function ProductCard({ image, name, price, style, onAddToCart }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.productCard, style]}>
      <Image source={{ uri: image }} style={styles.productImage} resizeMode="cover" />
      <Text style={styles.productName} numberOfLines={2}>{name}</Text>
      <Text style={styles.productPrice}>{price}</Text>
      <TouchableOpacity style={styles.addToCartBtn} onPress={onAddToCart} activeOpacity={0.85}>
        <Text style={styles.addToCartText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ------------------------------- Hero carousel ------------------------------- */
// State "slide aktif" disimpan di dalam komponen ini supaya HomeScreen
// tidak ikut re-render setiap kali user menggeser slide.
function HeroCarousel({ width }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const listRef = useRef(null);
  const [active, setActive] = useState(0);

  const handleScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== active && index >= 0 && index < heroSlides.length) {
      setActive(index);
    }
  };

  return (
    <View>
      <View style={styles.carouselWrap}>
        <FlatList
          ref={listRef}
          data={heroSlides}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <View style={[styles.bannerContainer, { width }]}>
              <View style={styles.bannerAccent} />
              <View style={styles.bannerTextContainer}>
                <View style={styles.bannerTagRow}>
                  <Ionicons name={item.icon} size={13} color={theme.primary} />
                  <Text style={styles.bannerSubtitle}>{item.tag}</Text>
                </View>
                <Text style={styles.bannerTitle}>{item.title}</Text>
              </View>
              <Image source={{ uri: item.image }} style={styles.bannerImage} resizeMode="cover" />
            </View>
          )}
        />
      </View>

      <View style={styles.dots}>
        {heroSlides.map((slide, i) => (
          <TouchableOpacity
            key={slide.id}
            hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
            onPress={() => listRef.current?.scrollToIndex({ index: i, animated: true })}
          >
            <View style={[styles.dot, i === active && styles.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

/* --------------------------------- Home screen -------------------------------- */
export default function HomeScreen({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Keranjang global (CartContext)
  const { addToCart, cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  // Toast kecil sebagai konfirmasi "ditambahkan ke keranjang"
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleAdd = (item) => {
    addToCart(item);
    setToast(`${item.name} added to cart`);
  };

  const H_PADDING = 20;
  const GAP = 14;
  const gridCardWidth = (width - H_PADDING * 2 - GAP) / 2;

  // Everything above "New Arrivals" items lives in the list header,
  // so the whole page scrolls as ONE FlatList (no nested vertical lists).
  const renderHeader = () => (
    <View>
      {/* 1. Header */}
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <MaterialCommunityIcons name="food-croissant" size={30} color={theme.primary} />
          <Text style={styles.brandTitle}>Dapur Chikara</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleTheme}>
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={22}
              color={theme.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Cart')}
            accessibilityRole="button"
            accessibilityLabel={`Open cart, ${cartCount} items`}
          >
            <Ionicons name="bag-handle-outline" size={24} color={theme.primary} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Hero carousel (3 slide informasi) */}
      <HeroCarousel width={width - H_PADDING * 2} />

      {/* 3. Categories */}
      <View style={styles.categoryContainer}>
        {categories.map((cat) => (
          <TouchableOpacity key={cat.id} style={styles.categoryCard} activeOpacity={0.8}>
            <View style={styles.categoryIconCircle}>
              <MaterialCommunityIcons name={cat.icon} size={26} color={theme.primary} />
            </View>
            <Text style={styles.categoryText}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 4. Best Sellers (horizontal FlatList) */}
      <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Best Sellers</Text>
      <FlatList
        data={bestSellers}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
        renderItem={({ item }) => (
          <ProductCard
            image={item.image}
            name={item.name}
            price={item.price}
            onAddToCart={() => handleAdd(item)}
            style={{ width: 180 }}
          />
        )}
      />

      {/* 5. New Arrivals title */}
      <View style={[styles.sectionHeader, styles.sectionSpacing]}>
        <Text style={styles.sectionTitle}>New Arrivals</Text>
        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={() => navigation.navigate('NewArrivals', { items: newArrivals })}
        >
          <Text style={styles.viewAllText}>View all</Text>
          <Ionicons name="arrow-forward" size={14} color={theme.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* New Arrivals: 2-column vertical FlatList that also acts as the page scroller */}
      <FlatList
        data={newArrivals}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ paddingHorizontal: H_PADDING, marginBottom: GAP, justifyContent: 'space-between' }}
        contentContainerStyle={styles.scrollContent}
        renderItem={({ item }) => (
          <ProductCard
            image={item.image}
            name={item.name}
            price={item.price}
            onAddToCart={() => handleAdd(item)}
            style={{ width: gridCardWidth }}
          />
        )}
      />

      {toast && (
        <View style={[styles.toast, { bottom: 90 + insets.bottom }]} pointerEvents="none">
          <Ionicons name="checkmark-circle" size={18} color={theme.onPrimary} />
          <Text style={styles.toastText} numberOfLines={1}>{toast}</Text>
        </View>
      )}

      {/* Fixed bottom navigation (outside the scroller) */}
      <View style={[styles.bottomNav, { height: 70 + insets.bottom, paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Menu')}
        >
          <Ionicons name="bag-outline" size={24} color={theme.navInactive} />
          <Text style={styles.navLabel}>Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.floatingHomeBtn} activeOpacity={0.9}>
          <Ionicons name="home" size={26} color={theme.onPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={24} color={theme.navInactive} />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ----------------------------------- Styles ----------------------------------- */
// Style dibuat dari fungsi supaya ikut berubah saat theme berganti.
const createStyles = (t) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: t.background },
    scrollContent: { paddingBottom: 120 },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 10,
    },
    brandContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    brandTitle: { fontSize: 22, fontWeight: 'bold', color: t.text },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    iconButton: { padding: 6 },
    cartBadge: {
      position: 'absolute',
      top: 0,
      right: 0,
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
    cartBadgeText: { color: t.onPrimary, fontSize: 9, fontWeight: '700' },
    toast: {
      position: 'absolute',
      alignSelf: 'center',
      maxWidth: '80%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: t.primary,
      elevation: 6,
    },
    toastText: { color: t.onPrimary, fontSize: 13, fontWeight: '600', flexShrink: 1 },

    bannerContainer: {
      backgroundColor: t.card,
      borderRadius: 24,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
      height: 170,
    },
    carouselWrap: { marginHorizontal: 20, marginTop: 8 },
    bannerTagRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
    bannerAccent: {
      position: 'absolute',
      right: -30,
      top: -30,
      width: 170,
      height: 170,
      borderRadius: 85,
      backgroundColor: t.primary,
    },
    bannerTextContainer: { flex: 1, paddingRight: 10 },
    bannerSubtitle: {
      fontSize: 10,
      fontWeight: '700',
      color: t.primary,
      letterSpacing: 0.5,
    },
    bannerTitle: { fontSize: 20, fontWeight: 'bold', color: t.text, lineHeight: 26 },
    bannerImage: {
      width: 110,
      height: 140,
      borderRadius: 20,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
    },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: t.dot },
    dotActive: { width: 22, backgroundColor: t.primary },

    categoryContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      gap: 12,
      marginTop: 18,
    },
    categoryCard: {
      flex: 1,
      backgroundColor: t.surface,
      borderRadius: 20,
      paddingVertical: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: t.border,
      elevation: 2,
      shadowColor: t.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    categoryIconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: t.iconCircle,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    categoryText: { fontSize: 13, fontWeight: '600', color: t.text },

    sectionSpacing: { marginTop: 24, marginBottom: 14, paddingHorizontal: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', color: t.text },
    viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    viewAllText: { color: t.primary, fontWeight: '600', fontSize: 13 },

    horizontalList: { paddingHorizontal: 20, paddingBottom: 6 },

    productCard: {
      backgroundColor: t.card,
      borderRadius: 20,
      padding: 12,
      elevation: 3,
      shadowColor: t.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
    },
    productImage: { width: '100%', height: 110, borderRadius: 40, marginBottom: 10 },
    productName: { fontSize: 15, fontWeight: 'bold', color: t.text, minHeight: 40 },
    productPrice: { fontSize: 14, color: t.textMuted, marginBottom: 10 },
    addToCartBtn: { backgroundColor: t.primary, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
    addToCartText: { color: t.onPrimary, fontWeight: 'bold', fontSize: 12 },

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
    navItem: { alignItems: 'center', minWidth: 60 },
    navLabel: { fontSize: 11, color: t.navInactive, marginTop: 2 },
    floatingHomeBtn: {
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
