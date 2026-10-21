import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  TextInput 
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

export default function CartScreen({ navigation, route }) {
  const [cartItems, setCartItems] = useState([
    { 
      id: '101', 
      name: 'Classic Sourdough', 
      price: 6.50, 
      quantity: 1, 
      image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=500' 
    },
  ]);

  const [orderNotes, setOrderNotes] = useState('');

  // Tangkap item baru menggunakan useFocusEffect agar data menumpuk dengan benar
  useFocusEffect(
    useCallback(() => {
      if (route.params?.newItem) {
        const incomingItem = route.params.newItem;
        
        const formattedPrice = typeof incomingItem.price === 'string' 
          ? parseFloat(incomingItem.price.replace('$', '')) 
          : incomingItem.price;

        setCartItems(prevItems => {
          const existingIndex = prevItems.findIndex(item => item.id === incomingItem.id);
          
          if (existingIndex > -1) {
            // Jika item sudah ada, tambah kuantitasnya
            const updated = [...prevItems];
            updated[existingIndex].quantity += 1;
            return updated;
          } else {
            // Jika item berbeda, gabungkan ke keranjang tanpa menghapus item sebelumnya
            return [...prevItems, {
              id: incomingItem.id,
              name: incomingItem.name,
              price: formattedPrice,
              quantity: 1,
              image: incomingItem.image
            }];
          }
        });

        // Reset parameter agar tidak terpanggil berulang kali
        navigation.setParams({ newItem: undefined, timestamp: undefined });
      }
    }, [route.params?.timestamp])
  );

  // Fungsi menambah jumlah kuantitas
  const increaseQty = (id) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  // Fungsi mengurangi kuantitas, jika 0 maka otomatis terhapus
  const decreaseQty = (id) => {
    setCartItems(prevItems => 
      prevItems
        .map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item)
        .filter(item => item.quantity > 0)
    );
  };

  // Hitung Subtotal secara dinamis
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Brand */}
      <View style={styles.brandHeader}>
        <MaterialCommunityIcons name="food-croissant" size={24} color="#ea580c" />
        <Text style={styles.brandTitle}>Dapur Chikara</Text>
      </View>

      {/* Navigation Header (Back & My Cart) */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#2d1a0e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* List Cart Items */}
        {cartItems.length > 0 ? (
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
            <Text style={styles.emptyText}>Your cart is empty</Text>
          </View>
        )}

        {/* Tombol Pintasan Tambah Menu Lain */}
        <TouchableOpacity 
          style={styles.addMoreButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="add-circle-outline" size={18} color="#ea580c" />
          <Text style={styles.addMoreText}>Add more items from menu</Text>
        </TouchableOpacity>

        {/* Order Notes Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Order Notes</Text>
          <View style={styles.noteInputBox}>
            <Feather name="edit-2" size={16} color="#ea580c" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.textInput}
              placeholder="Add pickup instructions or special requests"
              placeholderTextColor="#a89f91"
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
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={() => alert('Order placed successfully!')}
          activeOpacity={0.85}
        >
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  brandHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, gap: 8 },
  brandTitle: { fontSize: 16, fontWeight: 'bold', color: '#2d1a0e' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3ede2', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#2d1a0e' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  cartCard: { flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 20, padding: 12, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#ece4d9' },
  emptyContainer: { paddingVertical: 20, alignItems: 'center' },
  emptyText: { color: '#78716c', fontSize: 14 },
  itemImage: { width: 60, height: 60, borderRadius: 12 },
  itemDetails: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 14, fontWeight: 'bold', color: '#2d1a0e', marginBottom: 2 },
  itemUnitPrice: { fontSize: 12, color: '#78716c', marginBottom: 8 },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f6f0', borderRadius: 8, borderWidth: 1, borderColor: '#ece4d9', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2 },
  qtyBtn: { paddingHorizontal: 6 },
  qtySign: { fontSize: 14, fontWeight: 'bold', color: '#ea580c' },
  qtyText: { fontSize: 13, fontWeight: 'bold', color: '#2d1a0e', paddingHorizontal: 8 },
  itemTotalPrice: { fontSize: 15, fontWeight: 'bold', color: '#2d1a0e' },
  addMoreButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#ece4d9', borderStyle: 'dashed', gap: 8 },
  addMoreText: { fontSize: 14, fontWeight: '600', color: '#ea580c' },
  sectionCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginTop: 4, marginBottom: 8, borderWidth: 1, borderColor: '#ece4d9' },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: '#2d1a0e', marginBottom: 10 },
  noteInputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  textInput: { flex: 1, fontSize: 13, color: '#2d1a0e' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryTextLabel: { fontSize: 14, color: '#78716c' },
  summaryTextValue: { fontSize: 14, fontWeight: '600', color: '#2d1a0e' },
  summaryFreeText: { fontSize: 14, fontWeight: '600', color: '#ea580c' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 8 },
  totalTextLabel: { fontSize: 16, fontWeight: 'bold', color: '#2d1a0e' },
  totalTextValue: { fontSize: 18, fontWeight: 'bold', color: '#2d1a0e' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', padding: 20, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  checkoutButton: { backgroundColor: '#ea580c', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  checkoutButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});