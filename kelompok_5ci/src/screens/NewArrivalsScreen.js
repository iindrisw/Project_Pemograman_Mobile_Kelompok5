import React, { useMemo } from 'react';
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
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

/* Dipakai kalau layar ini dibuka tanpa data dari HomeScreen */
const IMG_SOURDOUGH = 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=500';
const IMG_CROISSANT = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500';
const IMG_BREAD = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500';
const IMG_TART = 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=500';

const fallbackItems = [
  { id: '1', name: 'Classic Sourdough', price: '$6.50', image: IMG_SOURDOUGH },
  { id: '2', name: 'Classic Butter Croissant', price: '$3.50', image: IMG_CROISSANT },
  { id: '3', name: 'Cinnamon Swirl', price: '$4.25', image: IMG_BREAD },
  { id: '4', name: 'Strawberry Tart', price: '$5.75', image: IMG_TART },
];

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

/* ------------------------------- Item bottom nav ------------------------------ */
function NavItem({ icon, label, active, onPress }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.navIconWrap, active && styles.navIconWrapActive]}>
        <Ionicons name={icon} size={active ? 22 : 26} color={active ? theme.onPrimary : theme.navInactive} />
      </View>
      <Text style={styles.navLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

/* --------------------------------- Layar ini --------------------------------- */
export default function NewArrivalsScreen({ navigation, route }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const items = route?.params?.items?.length ? route.params.items : fallbackItems;

  const H_PADDING = 24;
  const GAP = 12;
  const cardWidth = (width - H_PADDING * 2 - GAP) / 2;

  const handleAdd = (item) => {
    // TODO: sambungkan ke cart
    console.log('Add to cart:', item.name);
  };

  const renderHeader = () => (
    <View>
      {/* Judul + search + filter */}
      <View style={styles.header}>
        <Text style={styles.title}>New Arrivals</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.searchBtn} activeOpacity={0.7}>
            <Ionicons name="search-outline" size={26} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
            <Ionicons name="options-outline" size={22} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub judul */}
      <View style={styles.subHeader}>
        <Text style={styles.subTitle}>Fresh from the oven</Text>
        <Text style={styles.count}>{items.length} items</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{
          paddingHorizontal: H_PADDING,
          marginBottom: GAP,
          justifyContent: 'space-between',
        }}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => <GridCard item={item} width={cardWidth} onAdd={handleAdd} />}
      />

      {/* Bottom nav: Menu aktif di kiri */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <NavItem
          icon="bag-handle"
          label="Menu"
          active
          // TODO: sambungkan ke Catalog milik teman, mis. navigation.navigate('Catalog')
        />
        <NavItem icon="home-outline" label="Home" onPress={() => navigation.navigate('Home')} />
        <NavItem icon="person-outline" label="Profile" onPress={() => navigation.navigate('Profile')} />
      </View>
    </SafeAreaView>
  );
}

/* ----------------------------------- Styles ----------------------------------- */
const createStyles = (t) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: t.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: t.text },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  searchBtn: { padding: 4 },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.border,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: t.surface,
    borderRadius: 22,
    padding: 12,
  },
  cardImage: {
    width: '100%',
    height: 126,
    borderRadius: 60,
    marginBottom: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: t.text,
    lineHeight: 20,
    minHeight: 40, // ruang 2 baris supaya semua kartu sama tinggi
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  cardPrice: { fontSize: 15, color: t.textMuted },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: t.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bottomNav: {
    flexDirection: 'row',
    backgroundColor: t.surface,
    borderTopWidth: 1,
    borderTopColor: t.border,
    paddingTop: 10,
  },
  navItem: { flex: 1, alignItems: 'center' },
  navIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIconWrapActive: { backgroundColor: t.primary },
  navLabel: { fontSize: 12, color: t.textMuted, marginTop: 4 },
});
