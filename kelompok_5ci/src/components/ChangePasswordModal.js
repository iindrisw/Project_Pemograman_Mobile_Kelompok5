import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Field } from './FormField';

const EyeButton = ({ visible, onPress, color }) => (
  <TouchableOpacity onPress={onPress} hitSlop={10} accessibilityLabel={visible ? 'Hide password' : 'Show password'}>
    <Ionicons name={visible ? 'eye-outline' : 'eye-off-outline'} size={22} color={color} />
  </TouchableOpacity>
);

export default function ChangePasswordModal({ visible, onClose, onSubmit }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [error, setError] = useState('');

  // reset form tiap kali modal dibuka
  useEffect(() => {
    if (visible) {
      setCurrent(''); setNext(''); setConfirm(''); setError('');
      setShow({ current: false, next: false, confirm: false });
    }
  }, [visible]);

  const toggle = (k) => setShow((s) => ({ ...s, [k]: !s[k] }));

  const submit = () => {
    if (!current) return setError('Enter your current password.');
    if (next.length < 8 || !/\d/.test(next) || !/[^A-Za-z0-9]/.test(next)) {
      return setError('Use at least 8 characters, including a number and a symbol.');
    }
    if (next !== confirm) return setError('The new passwords don’t match.');
    setError('');
    onSubmit && onSubmit({ current, next }); // TODO: panggil API ganti password
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.sheet}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={styles.headRow}>
                <Text style={styles.title}>Change Password</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel="Close">
                  <Ionicons name="close" size={20} color={theme.text} />
                </TouchableOpacity>
              </View>
              <Text style={styles.subtitle}>Keep your account safe with a new password.</Text>

              <Field label="Current password" value={current} onChangeText={setCurrent}
                secureTextEntry={!show.current} autoCapitalize="none" placeholder="Enter current password"
                right={<EyeButton visible={show.current} onPress={() => toggle('current')} color={theme.textMuted} />} />

              <Field label="New password" value={next} onChangeText={setNext} style={{ marginBottom: 8 }}
                secureTextEntry={!show.next} autoCapitalize="none" placeholder="Enter new password"
                right={<EyeButton visible={show.next} onPress={() => toggle('next')} color={theme.textMuted} />} />
              <View style={styles.hintRow}>
                <Ionicons name="lock-closed-outline" size={16} color={theme.textMuted} />
                <Text style={styles.hint}>Use at least 8 characters, including a number and a symbol.</Text>
              </View>

              <Field label="Confirm new password" value={confirm} onChangeText={setConfirm}
                secureTextEntry={!show.confirm} autoCapitalize="none" placeholder="Re-enter new password"
                right={<EyeButton visible={show.confirm} onPress={() => toggle('confirm')} color={theme.textMuted} />} />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={submit}>
                <Text style={styles.primaryText}>Update Password</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (t) =>
  StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(30,20,12,0.45)' },
    sheet: { maxHeight: '92%', margin: 16, padding: 24, borderRadius: 32, backgroundColor: t.surface },
    headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { color: t.text, fontSize: 26, fontWeight: '700' },
    closeBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: t.card, alignItems: 'center', justifyContent: 'center' },
    subtitle: { color: t.textMuted, fontSize: 14, marginTop: 8, marginBottom: 22 },
    hintRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 18 },
    hint: { flex: 1, color: t.textMuted, fontSize: 13, lineHeight: 19 },
    error: { color: '#C0392B', fontSize: 13, marginBottom: 12 },
    primaryBtn: { height: 54, borderRadius: 16, backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center' },
    primaryText: { color: t.onPrimary, fontSize: 15, fontWeight: '700' },
    cancelBtn: { alignItems: 'center', paddingVertical: 16 },
    cancelText: { color: t.textMuted, fontSize: 15, fontWeight: '600' },
  });
