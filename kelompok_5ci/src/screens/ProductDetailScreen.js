import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useCart } from '../context/CartContext';
import { ambilProduk } from '../lib/produk';

const parsePrice = (price) => {
  const n = parseFloat(String(price).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

export default function ProductDetailScreen({ navigation, route }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { addToCart, cartItems } = useCart();

  const [item, setItem] = useState(route?.params?.item);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let aktif = true;
      if (item?.id) {
        ambilProduk(item.id)
          .then((terbaru) => { if (aktif && terbaru) setItem(terbaru); })
          .catch(() => {});
      }
      return () => { aktif = false; };
    }, [item?.id]),
  );

  useEffect(() => {
    if (!added) return undefined;
    const timer = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(timer);
  }, [added]);

  if (!item) return null;

  const stok = item.stok ?? 0;
  const habis = stok <= 0;
  const unitPrice = parsePrice(item.price);
  const total = unitPrice * qty;
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Menu');
  };

  const handleAdd = () => {
    for (let i = 0; i < qty; i += 1) addToCart(item);
    setAdded(true);
  };

  // Navigasi ke HapusProductScreen
  const hapusProduk = () => {
    navigation.navigate('HapusProduct', { item });
  };

  const facts = [
    item.category && { icon: 'pricetag-outline', label: item.category },
    { icon: 'cube-outline', label: habis ? 'Stok habis' : `Stok: ${stok}` },
  ].filter(Boolean);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={goBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={18} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Open cart, ${cartCount} items`}
        >
          <Ionicons name="bag-handle-outline" size={20} color={theme.primary} />
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />

        <View style={styles.titleRow}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>{item.price}</Text>
        </View>

        <View style={styles.factsRow}>
          {facts.map((f) => (
            <View key={f.label} style={styles.factChip}>
              <Ionicons name={f.icon} size={14} color={theme.primary} />
              <Text style={styles.factText}>{f.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>About this bake</Text>
        <Text style={styles.description}>
          {item.description || 'Freshly baked in our kitchen, made with simple, honest ingredients.'}
        </Text>

        <Text style={styles.sectionTitle}>Kelola produk</Text>
        <View style={styles.manageRow}>
          <TouchableOpacity
            style={styles.manageBtn}
            onPress={() => navigation.navigate('EditProduct', { item })}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Ionicons name="create-outline" size={18} color={theme.text} />
            <Text style={styles.manageText}>Ubah Produk</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.manageBtn, styles.deleteBtn]}
            onPress={hapusProduk}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={18} color={theme.danger || '#D64545'} />
            <Text style={[styles.manageText, { color: theme.danger || '#D64545' }]}>
              Hapus Produk
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={[styles.qtyContainer, habis && styles.dim]}>
          <TouchableOpacity
            style={styles.qtyBtn}
            disabled={habis}
            onPress={() => setQty((q) => Math.max(1, q - 1))}
            accessibilityLabel="Decrease quantity"
          >
            <Ionicons name="remove" size={18} color={theme.primary} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{qty}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            disabled={habis}
            onPress={() => setQty((q) => Math.min(Math.max(stok, 1), q + 1))}
            accessibilityLabel="Increase quantity"
          >
            <Ionicons name="add" size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.addButton, (added || habis) && styles.dim]}
          onPress={handleAdd}
          disabled={habis}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Ionicons name={added ? 'checkmark' : 'bag-add-outline'} size={20} color={theme.onPrimary} />
          <Text style={styles.addButtonText}>
            {habis ? 'Stok habis' : added ? 'Added to cart' : `Add to cart · $${total.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (t) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: t.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 12,
    },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute',
      top: -6,
      right: -6,
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

    scrollContent: { paddingHorizontal: 20 },
    image: { width: '100%', height: 280, borderRadius: 28, backgroundColor: t.border },

    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginTop: 20,
    },
    name: { flex: 1, color: t.text, fontSize: 26, fontWeight: '700', lineHeight: 32 },
    price: { color: t.primary, fontSize: 22, fontWeight: '700', marginTop: 2 },

    factsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
    factChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.surface,
    },
    factText: { color: t.text, fontSize: 12, fontWeight: '500' },

    sectionTitle: { color: t.text, fontSize: 17, fontWeight: '700', marginTop: 26, marginBottom: 8 },
    description: { color: t.textMuted, fontSize: 15, lineHeight: 23 },

    manageRow: { flexDirection: 'row', gap: 12 },
    manageBtn: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.surface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    deleteBtn: { borderColor: t.danger || '#D64545' },
    manageText: { color: t.text, fontSize: 14, fontWeight: '600' },

    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 20,
      paddingTop: 14,
      backgroundColor: t.surface,
      borderTopWidth: 1,
      borderTopColor: t.border,
    },
    qtyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 52,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
      paddingHorizontal: 4,
    },
    qtyBtn: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' },
    qtyText: { minWidth: 24, textAlign: 'center', color: t.text, fontSize: 16, fontWeight: '700' },
    addButton: {
      flex: 1,
      height: 52,
      borderRadius: 16,
      backgroundColor: t.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    dim: { opacity: 0.5 },
    addButtonText: { color: t.onPrimary, fontSize: 15, fontWeight: '700' },
  });