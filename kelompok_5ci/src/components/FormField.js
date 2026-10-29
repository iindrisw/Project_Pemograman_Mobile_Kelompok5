import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import AnimatedSwitch from './AnimatedSwitch';

const useFormStyles = () => {
  const { theme } = useTheme();
  return { theme, styles: useMemo(() => createStyles(theme), [theme]) };
};

/* Input teks dengan label, border berubah saat fokus, dan elemen kanan opsional */
export function Field({ label, right, style, multiline, ...inputProps }) {
  const { theme, styles } = useFormStyles();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputBox, multiline && styles.inputBoxMulti, focused && { borderColor: theme.primary }]}>
        <TextInput
          style={[styles.input, multiline && styles.inputMulti]}
          placeholderTextColor={theme.textMuted}
          selectionColor={theme.primary}
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
          {...inputProps}
        />
        {right}
      </View>
    </View>
  );
}

/* Dropdown sederhana: tap -> daftar pilihan muncul sebagai sheet */
export function SelectField({ label, value, options, onChange, style }) {
  const { theme, styles } = useFormStyles();
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.inputBox}
        activeOpacity={0.8}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
      >
        <Text style={[styles.input, styles.selectText]} numberOfLines={1}>{value}</Text>
        <Ionicons name="chevron-down" size={18} color={theme.textMuted} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.option}
                  onPress={() => { onChange(opt); setOpen(false); }}
                >
                  <Text style={[styles.optionText, opt === value && { color: theme.primary, fontWeight: '700' }]}>{opt}</Text>
                  {opt === value && <Ionicons name="checkmark" size={18} color={theme.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/* Kartu "Set as default ..." dengan switch */
export function ToggleCard({ title, subtitle, value, onChange }) {
  const { styles } = useFormStyles();
  return (
    <View style={styles.toggleCard}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleSubtitle}>{subtitle}</Text>
      </View>
      <AnimatedSwitch value={value} onValueChange={onChange} label={title} />
    </View>
  );
}

const createStyles = (t) =>
  StyleSheet.create({
    field: { marginBottom: 16 },
    label: { color: t.text, fontSize: 13, fontWeight: '700', marginBottom: 8 },
    inputBox: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 52,
      paddingHorizontal: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.surface,
    },
    inputBoxMulti: { alignItems: 'flex-start', minHeight: 84, paddingVertical: 4 },
    input: { flex: 1, color: t.text, fontSize: 15, paddingVertical: 12 },
    inputMulti: { textAlignVertical: 'top', minHeight: 72 },
    selectText: { paddingVertical: 0 },

    toggleCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      marginBottom: 16,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.surface,
    },
    toggleTitle: { color: t.text, fontSize: 15, fontWeight: '700' },
    toggleSubtitle: { color: t.textMuted, fontSize: 12, marginTop: 4 },

    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(30,20,12,0.45)' },
    sheet: {
      maxHeight: '60%',
      margin: 16,
      padding: 20,
      borderRadius: 28,
      backgroundColor: t.surface,
    },
    sheetTitle: { color: t.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
    option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
    optionText: { color: t.text, fontSize: 15 },
  });
