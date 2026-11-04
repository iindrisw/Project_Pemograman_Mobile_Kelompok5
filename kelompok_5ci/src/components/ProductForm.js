import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Field } from './FormField';
import { KATEGORI } from '../lib/produk';
import {
  validasiNama,
  validasiHarga,
  validasiStok,
  validasiFoto,
} from '../lib/validasiProduk';

/**
 * Form produk bersama untuk AddProductScreen dan EditProductScreen.
 *
 * Validasi REALTIME:
 *  1. Error dihitung ulang dari nilai terbaru di setiap render (tiap ketikan).
 *  2. Error baru TAMPIL setelah field disentuh (onBlur) atau setelah submit.
 *  3. Tombol Simpan nonaktif selama ada error.
 *
 * Props:
 *  - initial: { nama, harga, deskripsi, kategori, stok, fotoUrl }
 *  - fotoWajib: true di form Tambah, false di form Ubah
 *  - submitLabel, onSubmit({ nama, harga, deskripsi, kategori, stok, fotoUri })
 */
export default function ProductForm({ initial = {}, fotoWajib, submitLabel, onSubmit }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const [nama, setNama] = useState(initial.nama ?? '');
  const [harga, setHarga] = useState(initial.harga ?? '');
  const [deskripsi, setDeskripsi] = useState(initial.deskripsi ?? '');
  const [kategori, setKategori] = useState(initial.kategori ?? KATEGORI[0]);
  const [stok, setStok] = useState(initial.stok ?? '0');
  const [fotoUri, setFotoUri] = useState(null); // foto BARU yang dipilih
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const fotoTampil = fotoUri || initial.fotoUrl || null;

  // Error dihitung dari nilai sekarang -> otomatis realtime.
  const errors = {
    nama: validasiNama(nama),
    harga: validasiHarga(harga),
    stok: validasiStok(stok),
    foto: validasiFoto(fotoTampil, fotoWajib),
  };
  const formValid = !Object.values(errors).some(Boolean);

  const sentuh = (field) => () => setTouched((t) => ({ ...t, [field]: true }));
  const tampil = (field) => (touched[field] ? errors[field] : '');

  const pilihFoto = async () => {
    setTouched((t) => ({ ...t, foto: true }));
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) setFotoUri(result.assets[0].uri);
  };

  const simpan = async () => {
    setTouched({ nama: true, harga: true, stok: true, foto: true });
    if (!formValid) return;
    setLoading(true);
    try {
      await onSubmit({
        nama: nama.trim(),
        harga: Number(harga),
        deskripsi: deskripsi.trim(),
        kategori,
        stok: Number(stok),
        fotoUri,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Foto produk</Text>
        <TouchableOpacity
          style={[styles.fotoBox, !!tampil('foto') && styles.fotoBoxError]}
          onPress={pilihFoto}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Pilih foto produk"
        >
          {fotoTampil ? (
            <Image source={{ uri: fotoTampil }} style={styles.foto} resizeMode="cover" />
          ) : (
            <View style={styles.fotoKosong}>
              <Ionicons name="image-outline" size={32} color={theme.textMuted} />
              <Text style={styles.fotoPlaceholder}>Ketuk untuk pilih foto</Text>
            </View>
          )}
        </TouchableOpacity>
        {!!tampil('foto') && <Text style={styles.errorText}>{tampil('foto')}</Text>}
        {!!initial.fotoUrl && !fotoUri && (
          <Text style={styles.hint}>Ketuk foto untuk menggantinya. Dibiarkan = foto lama dipakai.</Text>
        )}

        <Field
          label="Nama produk"
          style={styles.gap}
          placeholder="mis. Butter Croissant"
          value={nama}
          onChangeText={setNama}
          onBlur={sentuh('nama')}
          error={tampil('nama')}
        />

        <Field
          label="Harga (USD)"
          placeholder="mis. 3.50"
          keyboardType="decimal-pad"
          value={harga}
          onChangeText={setHarga}
          onBlur={sentuh('harga')}
          error={tampil('harga')}
        />

        <Field
          label="Deskripsi (opsional)"
          placeholder="Ceritakan tentang produk ini"
          value={deskripsi}
          onChangeText={setDeskripsi}
          multiline
        />

        <Text style={styles.label}>Kategori</Text>
        <View style={styles.chips}>
          {KATEGORI.map((k) => {
            const aktif = kategori === k;
            return (
              <TouchableOpacity
                key={k}
                onPress={() => setKategori(k)}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ selected: aktif }}
                style={[styles.chip, aktif && styles.chipAktif]}
              >
                <Text style={[styles.chipText, aktif && styles.chipTextAktif]}>{k}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Field
          label="Stok"
          placeholder="0"
          keyboardType="number-pad"
          value={stok}
          onChangeText={setStok}
          onBlur={sentuh('stok')}
          error={tampil('stok')}
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[styles.tombol, (!formValid || loading) && styles.tombolNonaktif]}
          onPress={simpan}
          disabled={!formValid || loading}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityState={{ disabled: !formValid || loading }}
        >
          {loading ? (
            <ActivityIndicator color={theme.onPrimary} />
          ) : (
            <Text style={styles.tombolText}>{submitLabel}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (t) =>
  StyleSheet.create({
    scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
    label: { color: t.text, fontSize: 13, fontWeight: '700', marginBottom: 8 },
    gap: { marginTop: 16 },
    fotoBox: {
      height: 190,
      borderRadius: 20,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: t.border,
      backgroundColor: t.surface,
      overflow: 'hidden',
    },
    fotoBoxError: { borderColor: t.danger || '#D64545' },
    foto: { width: '100%', height: '100%' },
    fotoKosong: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
    fotoPlaceholder: { color: t.textMuted, fontSize: 14 },
    errorText: { color: t.danger || '#D64545', fontSize: 12, marginTop: 5 },
    hint: { color: t.textMuted, fontSize: 12, marginTop: 6 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.surface,
    },
    chipAktif: { backgroundColor: t.badgeBg, borderColor: t.primary },
    chipText: { color: t.textMuted, fontSize: 13, fontWeight: '500' },
    chipTextAktif: { color: t.primary, fontWeight: '700' },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      backgroundColor: t.surface,
      borderTopWidth: 1,
      borderTopColor: t.border,
    },
    tombol: {
      height: 54,
      borderRadius: 16,
      backgroundColor: t.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tombolNonaktif: { opacity: 0.45 },
    tombolText: { color: t.onPrimary, fontSize: 15, fontWeight: '700' },
  });