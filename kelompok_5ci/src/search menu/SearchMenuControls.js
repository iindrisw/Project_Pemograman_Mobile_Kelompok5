import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EMPTY_SEARCH_CRITERIA, SEARCH_CATEGORIES } from './filter';

export default function SearchMenuControls({
  theme,
  query,
  onQueryChange,
  criteria,
  onCriteriaChange,
  onEnsureOrderedProducts,
  activeFilterCount,
}) {
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState(criteria);

  const openFilters = () => {
    setDraft({ ...criteria });
    setVisible(true);
  };

  const updateDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  const toggleOrderedOnly = async () => {
    if (!draft.orderedOnly) {
      try {
        await onEnsureOrderedProducts();
      } catch (error) {
        Alert.alert('Gagal memuat riwayat pesanan', error?.message || 'Coba lagi nanti.');
        return;
      }
    }
    updateDraft('orderedOnly', !draft.orderedOnly);
  };

  const applyFilters = () => {
    onCriteriaChange(draft);
    setVisible(false);
  };

  const resetFilters = () => setDraft({ ...EMPTY_SEARCH_CRITERIA });

  const renderRangeField = (label, key, placeholder) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={draft[key]}
        onChangeText={(value) => updateDraft(key, value)}
        keyboardType="number-pad"
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        accessibilityLabel={label}
      />
    </View>
  );

  return (
    <>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={20} color={theme.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={onQueryChange}
          placeholder="Cari menu, satu atau beberapa kata"
          placeholderTextColor={theme.textMuted}
          returnKeyType="search"
          accessibilityLabel="Cari menu"
        />
        {!!query && (
          <TouchableOpacity onPress={() => onQueryChange('')} accessibilityLabel="Hapus pencarian">
            <Ionicons name="close-circle" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={openFilters}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`Kriteria pencarian, ${activeFilterCount} filter aktif`}
        >
          <Ionicons name="options-outline" size={21} color={theme.primary} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kriteria pencarian</Text>
              <TouchableOpacity onPress={() => setVisible(false)} accessibilityLabel="Tutup filter">
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionLabel}>Rentang harga (Rp)</Text>
              <View style={styles.rangeRow}>
                {renderRangeField('Harga minimum', 'minPrice', 'Min')}
                {renderRangeField('Harga maksimum', 'maxPrice', 'Max')}
              </View>

              <Text style={styles.sectionLabel}>Rentang stok</Text>
              <View style={styles.rangeRow}>
                {renderRangeField('Stok minimum', 'minStock', 'Min')}
                {renderRangeField('Stok maksimum', 'maxStock', 'Max')}
              </View>

              <Text style={styles.sectionLabel}>Kategori</Text>
              <View style={styles.categoryRow}>
                {['All', ...SEARCH_CATEGORIES].map((category) => {
                  const selected = draft.category === category;
                  return (
                    <TouchableOpacity
                      key={category}
                      style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                      onPress={() => updateDraft('category', category)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                    >
                      <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>
                        {category === 'All' ? 'Semua' : category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.orderedRow}
                onPress={toggleOrderedOnly}
                activeOpacity={0.8}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: draft.orderedOnly }}
              >
                <Ionicons
                  name={draft.orderedOnly ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={draft.orderedOnly ? theme.primary : theme.textMuted}
                />
                <Text style={styles.orderedText}>Kue yang pernah diorder sebelumnya</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyText}>Terapkan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const createStyles = (t) => StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginVertical: 8,
    paddingHorizontal: 12,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.surface,
    gap: 8,
  },
  searchInput: { flex: 1, color: t.text, paddingVertical: 10, fontSize: 14 },
  filterButton: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.background,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: t.primary,
  },
  filterBadgeText: { color: t.onPrimary, fontSize: 9, fontWeight: '700' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.42)' },
  sheet: {
    maxHeight: '85%',
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 24,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: t.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  modalTitle: { color: t.text, fontSize: 19, fontWeight: '700' },
  sectionLabel: { color: t.text, fontSize: 14, fontWeight: '600', marginBottom: 10, marginTop: 8 },
  rangeRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  field: { flex: 1 },
  fieldLabel: { color: t.textMuted, fontSize: 11, marginBottom: 5 },
  input: {
    minHeight: 42,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 10,
    color: t.text,
    backgroundColor: t.surface,
  },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.surface,
  },
  categoryChipSelected: { borderColor: t.primary, backgroundColor: t.primary },
  categoryText: { color: t.textMuted, fontSize: 12 },
  categoryTextSelected: { color: t.onPrimary, fontWeight: '600' },
  orderedRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  orderedText: { flex: 1, color: t.text, fontSize: 13 },
  footer: { flexDirection: 'row', gap: 10, marginTop: 16 },
  resetButton: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 12,
  },
  resetText: { color: t.text, fontWeight: '600' },
  applyButton: {
    flex: 2,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: t.primary,
  },
  applyText: { color: t.onPrimary, fontWeight: '700' },
});
