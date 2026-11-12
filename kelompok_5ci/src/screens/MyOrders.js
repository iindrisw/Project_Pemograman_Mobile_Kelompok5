import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import BottomNav from '../components/BottomNav';
import { ambilRiwayatPesanan } from '../lib/penjualan';
import { formatRupiah } from '../lib/saldo';

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const formatTanggal = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dua = (n) => String(n).padStart(2, '0');
  return `${dua(d.getDate())} ${BULAN[d.getMonth()]} ${d.getFullYear()} · ${dua(d.getHours())}:${dua(d.getMinutes())}`;
};

// Foto bisa hilang kalau produknya sudah dihapus: tampilkan ikon pengganti.
function FotoPesanan({ uri, styles, theme }) {
  const [gagal, setGagal] = useState(false);
  if (!uri || gagal) {
    return (
      <View style={[styles.productImage, styles.fotoKosong]}>
        <Ionicons name="image-outline" size={22} color={theme.textMuted} />
      </View>
    );
  }
  return <Image source={{ uri }} style={styles.productImage} onError={() => setGagal(true)} />;
}

export default function MyOrders({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const muat = useCallback(async () => {
    try {
      setError('');
      setOrders(await ambilRiwayatPesanan());
    } catch (e) {
      setError(e?.message || 'Gagal memuat pesanan.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Muat ulang tiap layar ini fokus, jadi pesanan yang baru dibuat langsung muncul.
  useFocusEffect(useCallback(() => { muat(); }, [muat]));

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Profile');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Profil"
        >
          <Ionicons name="arrow-back" size={18} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Pesanan Saya</Text>
      </View>

      <ScrollView contentContainerStyle={styles.orderList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.emptyBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={muat} activeOpacity={0.8}>
              <Text style={styles.retryText}>Coba lagi</Text>
            </TouchableOpacity>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="receipt-outline" size={40} color={theme.textMuted} />
            <Text style={styles.emptyText}>Belum ada pesanan.</Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>RIWAYAT PEMBELIAN</Text>
              <Text style={styles.orderCount}>{orders.length} pesanan</Text>
            </View>

            {orders.map((order) => {
              const pertama = order.items[0];
              const sisa = order.items.length - 1;
              const jumlahItem = order.items.reduce((s, i) => s + i.jumlah, 0);
              return (
                <View key={order.kunci} style={styles.orderCard}>
                  <View style={styles.cardMeta}>
                    <Text style={styles.orderDate}>
                      {formatTanggal(order.tanggal)}{order.id ? ` · ${order.id}` : ''}
                    </Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>Berhasil</Text>
                    </View>
                  </View>

                  <View style={styles.productRow}>
                    <FotoPesanan uri={pertama.foto} styles={styles} theme={theme} />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={1}>
                        {pertama.nama}{sisa > 0 ? ` +${sisa} lainnya` : ''}
                      </Text>
                      <Text style={styles.productDetails} numberOfLines={2}>
                        {order.items.map((i) => `${i.jumlah} × ${i.nama}`).join(' · ')}
                      </Text>
                    </View>
                  </View>

                  {!!order.catatan && (
                    <Text style={styles.note} numberOfLines={2}>Catatan: {order.catatan}</Text>
                  )}

                  <View style={styles.cardFooter}>
                    <Text style={styles.price}>{formatRupiah(order.total)}</Text>
                    <Text style={styles.itemCount}>{jumlahItem} item</Text>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      <BottomNav active="Profile" />
    </SafeAreaView>
  );
}

const createStyles = (t) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: t.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 12,
    backgroundColor: t.surface,
  },
  title: { color: t.text, fontSize: 21, fontWeight: '700' },
  orderList: { paddingHorizontal: 20, paddingBottom: 110 },

  emptyBox: { alignItems: 'center', gap: 12, marginTop: 50, paddingHorizontal: 20 },
  emptyText: { color: t.textMuted, fontSize: 14 },
  errorText: { color: t.danger || '#D64545', fontSize: 13, textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.surface,
  },
  retryText: { color: t.primary, fontSize: 13, fontWeight: '600' },

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: { color: t.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1.1 },
  orderCount: { color: t.textMuted, fontSize: 10 },

  orderCard: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 14,
    backgroundColor: t.surface,
    shadowColor: t.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderDate: { flex: 1, color: t.textMuted, fontSize: 10 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: t.successBg,
  },
  statusText: { color: t.success, fontSize: 9, fontWeight: '600' },

  productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 11 },
  productImage: { width: 54, height: 54, borderRadius: 10, backgroundColor: t.border },
  fotoKosong: { alignItems: 'center', justifyContent: 'center' },
  productInfo: { flex: 1, marginLeft: 10 },
  productName: { color: t.text, fontSize: 13, fontWeight: '700' },
  productDetails: { marginTop: 3, color: t.textMuted, fontSize: 10 },
  note: { color: t.textMuted, fontSize: 10, fontStyle: 'italic', marginBottom: 8 },

  cardFooter: {
    minHeight: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: { color: t.text, fontSize: 13, fontWeight: '700' },
  itemCount: { color: t.textMuted, fontSize: 10 },
});
