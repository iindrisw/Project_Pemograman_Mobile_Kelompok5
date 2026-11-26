import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import { ambilSemuaProduk } from '../lib/produk';
import { useProfil } from '../lib/auth';
import { SearchMenuControls, SEARCH_CATEGORIES, useMenuSearch } from '../search menu';

const CATEGORIES = ['All', ...SEARCH_CATEGORIES];

// Samakan "Pastries" / "Pastry", "Cakes" / "Cake" supaya kategori dari Home cocok.
const norm = (s) => String(s || '').toLowerCase().trim().replace(/ies$/, 'y').replace(/s$/, '');

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
      <Text style={styles.cardPrice}>{item.price}</Text>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => onAdd(item)}
        activeOpacity={0.85}
        accessibilityLabel={`Add ${item.name} to cart`}
      >
        <Text style={styles.addBtnText}>Add to Cart</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

/* --------------------------------- Layar Menu --------------------------------- */
export default function MenuScreen({ navigation, route }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isAdmin } = useProfil();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    query,
    setQuery,
    criteria,
    setCriteria,
    filteredProducts,
    ensureOrderedProducts,
    activeFilterCount,
  } = useMenuSearch(items);

  // Dari Home: ketuk Bread / Pastries / Cakes -> Menu langsung terfilter kategori itu.
  useEffect(() => {
    const k = route?.params?.kategori;
    if (!k) return;
    const cocok = CATEGORIES.find((c) => norm(c) === norm(k));
    setCriteria((current) => ({ ...current, category: cocok || 'All' }));
  }, [route?.params?.kategori, route?.params?.nonce, setCriteria]);

  // Muat ulang produk setiap kali layar Menu kembali fokus.
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

  // Logika Cart global
  const { addToCart } = useCart();

  const H_PADDING = 24;
  const GAP = 12;
  const numColumns = width >= 900 ? 4 : 2;
  const cardWidth = (width - H_PADDING * 2 - GAP * (numColumns - 1)) / numColumns;

  const handleAdd = (item) => {
    addToCart(item);
    alert(`Added ${item.name} to cart!`);
  };

  const openDetail = (item) => navigation.navigate('ProductDetail', { item });

  const renderHeader = () => (
    <View>
      {/* Header dengan Title dan Aksi */}
      <View style={styles.header}>
        <Text style={styles.title}>Menu</Text>
        <View style={styles.headerActions}>
          {isAdmin && (
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('AddProduct')}
              accessibilityRole="button"
              accessibilityLabel="Tambah produk"
            >
              <Ionicons name="add" size={26} color={theme.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="bag-handle-outline" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <SearchMenuControls
        theme={theme}
        query={query}
        onQueryChange={setQuery}
        criteria={criteria}
        onCriteriaChange={setCriteria}
        onEnsureOrderedProducts={ensureOrderedProducts}
        activeFilterCount={activeFilterCount}
      />

      {/* Kategori horizontal */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {CATEGORIES.map((cat, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.categoryButton,
              criteria.category === cat && styles.categoryButtonActive,
            ]}
            onPress={() => setCriteria((current) => ({ ...current, category: cat }))}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.categoryText,
              criteria.category === cat && styles.categoryTextActive,
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
        key={`menu-grid-${numColumns}`}
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
          ) : (
            <Text style={styles.emptyText}>
              {items.length > 0
                ? 'Tidak ada produk yang sesuai dengan pencarian atau kriteria.'
                : isAdmin ? 'Belum ada produk. Ketuk + untuk menambah.' : 'Belum ada produk yang tersedia.'}
            </Text>
          )
        }
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{
          paddingHorizontal: H_PADDING,
          marginBottom: GAP,
          gap: GAP,
          justifyContent: 'flex-start',
        }}
        contentContainerStyle={styles.scrollContent}
        renderItem={({ item }) => (
          <GridCard item={item} width={cardWidth} onAdd={handleAdd} onPress={openDetail} />
        )}
      />

      {/* Bottom nav: Menu | Home | Profile */}
      <View style={[styles.bottomNav, { height: 70 + insets.bottom, paddingBottom: insets.bottom + 8 }]}>
        <View
          style={styles.navItem}
          accessibilityRole="button"
          accessibilityState={{ selected: true }}
          accessibilityLabel="Menu"
        >
          <View style={styles.activeNavIcon}>
            <Ionicons name="bag-outline" size={19} color={theme.onPrimary} />
          </View>
          <Text style={styles.activeNavLabel}>Menu</Text>
        </View>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Home"
        >
          <Ionicons name="home-outline" size={24} color={theme.navInactive} />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Profile"
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
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: t.shadow || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 1.15,
    borderRadius: 12,
    marginBottom: 10,
  },
  cardName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: t.text,
    lineHeight: 19,
    minHeight: 38,
  },
  cardPrice: {
    fontSize: 13,
    color: t.textMuted,
    marginTop: 4,
    marginBottom: 12,
  },
  addBtn: {
    width: '100%',
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: t.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: t.onPrimary,
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
  activeNavIcon: {
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