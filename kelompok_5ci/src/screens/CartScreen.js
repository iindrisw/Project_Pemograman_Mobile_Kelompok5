import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useTheme } from '../theme/ThemeContext';

export default function CartScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  // Mengambil data dan fungsi langsung dari CartContext
  const { cartItems, increaseQty, decreaseQty, subtotal } = useCart();
  const [orderNotes, setOrderNotes] = useState('');
  const isEmpty = cartItems.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header Brand */}
      <View style={styles.brandHeader}>
        <MaterialCommunityIcons name="food-croissant" size={24} color={theme.primary} />
        <Text style={styles.brandTitle}>Dapur Chikara</Text>
      </View>

      {/* Navigation Header (Back & My Cart) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* List Cart Items */}
        {!isEmpty ? (
          cartItems.map((item) => (
            <View key={item.id} style={styles.cartCard}>
              <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />

              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemUnitPrice}>${item.price.toFixed(2)} each</Text>

                {/* Quantity Controller */}
                <View style={styles.qtyContainer}>
                  <TouchableOpacity onPress={() => decreaseQty(item.id)} style={styles.qtyBtn}>
                    <Text style={styles.qtySign}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => increaseQty(item.id)} style={styles.qtyBtn}>
                    <Text style={styles.qtySign}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.itemTotalPrice}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="bag-handle-outline" size={40} color={theme.textMuted} />
            <Text style={styles.emptyText}>Your cart is empty</Text>
          </View>
        )}

        {/* Tombol Pintasan Tambah Menu Lain */}
        <TouchableOpacity style={styles.addMoreButton} onPress={() => navigation.goBack()}>
          <Ionicons name="add-circle-outline" size={18} color={theme.primary} />
          <Text style={styles.addMoreText}>Add more items from menu</Text>
        </TouchableOpacity>

        {/* Order Notes Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Order Notes</Text>
          <View style={styles.noteInputBox}>
            <Feather name="edit-2" size={16} color={theme.primary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.textInput}
              placeholder="Add pickup instructions or special requests"
              placeholderTextColor={theme.textMuted}
              selectionColor={theme.primary}
              value={orderNotes}
              onChangeText={setOrderNotes}
            />
          </View>
        </View>

        {/* Order Summary Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryTextLabel}>Subtotal</Text>
            <Text style={styles.summaryTextValue}>${subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryTextLabel}>Pickup</Text>
            <Text style={styles.summaryFreeText}>Free</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalTextLabel}>Total</Text>
            <Text style={styles.totalTextValue}>${subtotal.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[styles.checkoutButton, isEmpty && styles.checkoutButtonDisabled]}
          disabled={isEmpty}
          onPress={() =>
            navigation.navigate('CheckoutSuccess', { totalAmount: `$${subtotal.toFixed(2)}` })
          }
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityState={{ disabled: isEmpty }}
        >
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Style dibuat dari fungsi supaya ikut berubah saat theme berganti (light/dark).
const createStyles = (t) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.background },
    brandHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, gap: 8 },
    brandTitle: { fontSize: 16, fontWeight: 'bold', color: t.text },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: t.text },
    scrollContent: { paddingHorizontal: 20 },

    cartCard: {
      flexDirection: 'row',
      backgroundColor: t.surface,
      borderRadius: 20,
      padding: 12,
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 1,
      borderColor: t.border,
    },
    emptyContainer: { paddingVertical: 30, alignItems: 'center', gap: 10 },
    emptyText: { color: t.textMuted, fontSize: 15 },
    itemImage: { width: 60, height: 60, borderRadius: 12, backgroundColor: t.border },
    itemDetails: { flex: 1, marginLeft: 12 },
    itemName: { fontSize: 14, fontWeight: 'bold', color: t.text, marginBottom: 2 },
    itemUnitPrice: { fontSize: 12, color: t.textMuted, marginBottom: 8 },
    qtyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: t.border,
      alignSelf: 'flex-start',
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    qtyBtn: { paddingHorizontal: 6 },
    qtySign: { fontSize: 14, fontWeight: 'bold', color: t.primary },
    qtyText: { fontSize: 13, fontWeight: 'bold', color: t.text, paddingHorizontal: 8 },
    itemTotalPrice: { fontSize: 15, fontWeight: 'bold', color: t.text },

    addMoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.surface,
      borderRadius: 16,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: t.border,
      borderStyle: 'dashed',
      gap: 8,
    },
    addMoreText: { fontSize: 14, fontWeight: '600', color: t.primary },

    sectionCard: {
      backgroundColor: t.surface,
      borderRadius: 20,
      padding: 16,
      marginTop: 4,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: t.border,
    },
    sectionLabel: { fontSize: 16, fontWeight: 'bold', color: t.text, marginBottom: 10 },
    noteInputBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.badgeBg,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    textInput: { flex: 1, fontSize: 13, color: t.text },

    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryTextLabel: { fontSize: 14, color: t.textMuted },
    summaryTextValue: { fontSize: 14, fontWeight: '600', color: t.text },
    summaryFreeText: { fontSize: 14, fontWeight: '600', color: t.primary },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: t.border, marginVertical: 8 },
    totalTextLabel: { fontSize: 16, fontWeight: 'bold', color: t.text },
    totalTextValue: { fontSize: 18, fontWeight: 'bold', color: t.text },

    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: t.surface,
      paddingHorizontal: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: t.border,
    },
    checkoutButton: { backgroundColor: t.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
    checkoutButtonDisabled: { opacity: 0.45 },
    checkoutButtonText: { color: t.onPrimary, fontSize: 16, fontWeight: 'bold' },
  });
