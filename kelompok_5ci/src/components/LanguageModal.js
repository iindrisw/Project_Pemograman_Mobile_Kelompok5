import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export const LANGUAGES = [
  { id: 'English', native: 'English' },
  { id: 'Indonesian', native: 'Bahasa Indonesia' },
  { id: 'Spanish', native: 'Español' },
  { id: 'French', native: 'Français' },
];

export default function LanguageModal({ visible, current, onClose, onSave }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [selected, setSelected] = useState(current);

  useEffect(() => {
    if (visible) setSelected(current);
  }, [visible, current]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <View style={styles.headRow}>
            <Text style={styles.title}>Language</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel="Close">
              <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Choose the language that feels like home.</Text>

          {LANGUAGES.map((l) => {
            const active = selected === l.id;
            return (
              <TouchableOpacity
                key={l.id}
                activeOpacity={0.85}
                onPress={() => setSelected(l.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[styles.option, active && styles.optionActive]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>{l.id}</Text>
                  <Text style={styles.optionSub}>{l.native}</Text>
                </View>
                <View style={[styles.radio, active && { borderColor: theme.primary }]}>
                  {active && <View style={[styles.radioDot, { backgroundColor: theme.primary }]} />}
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => { onSave(selected); onClose(); }}
          >
            <Text style={styles.primaryText}>Save Language</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (t) =>
  StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(30,20,12,0.45)' },
    sheet: { margin: 16, padding: 24, borderRadius: 32, backgroundColor: t.surface },
    headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { color: t.text, fontSize: 26, fontWeight: '700' },
    closeBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: t.card, alignItems: 'center', justifyContent: 'center' },
    subtitle: { color: t.textMuted, fontSize: 14, marginTop: 8, marginBottom: 22 },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      marginBottom: 12,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.surface,
    },
    optionActive: { borderColor: t.primary, backgroundColor: t.badgeBg },
    optionTitle: { color: t.text, fontSize: 16, fontWeight: '700' },
    optionSub: { color: t.textMuted, fontSize: 13, marginTop: 3 },
    radio: {
      width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: t.border,
      alignItems: 'center', justifyContent: 'center',
    },
    radioDot: { width: 12, height: 12, borderRadius: 6 },
    primaryBtn: { height: 54, marginTop: 8, borderRadius: 16, backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center' },
    primaryText: { color: t.onPrimary, fontSize: 15, fontWeight: '700' },
    cancelBtn: { alignItems: 'center', paddingVertical: 16 },
    cancelText: { color: t.textMuted, fontSize: 15, fontWeight: '600' },
  });
