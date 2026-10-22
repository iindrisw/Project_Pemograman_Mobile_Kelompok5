import React, { useState, useMemo, useRef } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

const breadImage = require('../../assets/splash_screen/logo_spl_s.png');

/* ------------------------------- Validasi form ------------------------------- */
// Validasi sederhana di sisi FE saja (belum terhubung backend).
const validate = (values, isLogin) => {
  const errors = {};
  const username = values.username.trim();

  if (!username) errors.username = 'Enter your username.';
  else if (username.length < 3) errors.username = 'Username must be at least 3 characters.';
  else if (!isLogin && !/^[A-Za-z0-9_.]+$/.test(username)) {
    errors.username = 'Use letters, numbers, dots or underscores only.';
  }

  if (!values.password) errors.password = 'Enter your password.';
  else if (isLogin && values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  } else if (!isLogin && values.password.length < 8) {
    errors.password = 'Use at least 8 characters.';
  } else if (!isLogin && !/\d/.test(values.password)) {
    errors.password = 'Include at least one number.';
  }

  if (!isLogin) {
    if (!values.confirm) errors.confirm = 'Confirm your password.';
    else if (values.confirm !== values.password) errors.confirm = 'Passwords don’t match.';
  }

  return errors;
};

/* Input dengan label, pesan error, dan tombol tampil/sembunyi password */
const AuthInput = React.forwardRef(function AuthInput(
  { label, error, secure, styles, colors, style, ...inputProps },
  ref,
) {
  const [hidden, setHidden] = useState(!!secure);

  return (
    <View style={style}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, !!error && styles.inputError]}>
        <TextInput
          ref={ref}
          style={styles.inputField}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secure ? hidden : false}
          selectionColor={colors.orange}
          accessibilityLabel={label}
          {...inputProps}
        />
        {secure && (
          <TouchableOpacity
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <MaterialCommunityIcons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.muted}
            />
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

export default function AuthScreen({ navigation, mode }) {
  const { theme } = useTheme();
  const colors = useMemo(() => makeColors(theme), [theme]);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isLogin = mode === 'login';
  const [values, setValues] = useState({ username: '', password: '', confirm: '' });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  const errors = useMemo(() => validate(values, isLogin), [values, isLogin]);
  // Error tampil setelah field disentuh (blur) atau setelah tombol ditekan
  const showError = (field) => (submitted || touched[field]) && errors[field];

  const setField = (field) => (text) => setValues((v) => ({ ...v, [field]: text }));
  const markTouched = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  const handleSubmit = () => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    // TODO: panggil API login/register saat backend sudah ada.
    // reset supaya tombol back tidak kembali ke halaman login/register
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Home' }] }));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.brand}>
                <MaterialCommunityIcons
                  name="food-croissant"
                  size={23}
                  color={colors.orange}
                />
                <Text style={styles.brandName}>Dapur Chikara</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                style={styles.backButton}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={22}
                  color={colors.ink}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.hero}>
              <View style={styles.imageFrame}>
                <Image source={breadImage} style={styles.heroImage} resizeMode="contain" />
              </View>
              <View style={styles.heroBadge}>
                <MaterialCommunityIcons
                  name="food-croissant"
                  size={19}
                  color={colors.orange}
                />
              </View>
            </View>

            <Text style={styles.title}>{isLogin ? 'Welcome back' : 'Welcome'}</Text>
            <Text style={styles.subtitle}>
              Your daily dose of freshly baked happiness.
            </Text>

            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, isLogin && styles.activeTab]}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected: isLogin }}
              >
                <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !isLogin && styles.activeTab]}
                onPress={() => navigation.navigate('Signup')}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected: !isLogin }}
              >
                <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
                  Register
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <AuthInput
                label="Username"
                styles={styles}
                colors={colors}
                placeholder="Enter your username"
                value={values.username}
                onChangeText={setField('username')}
                onBlur={markTouched('username')}
                error={showError('username')}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
              />

              <AuthInput
                ref={passwordRef}
                label="Password"
                secure
                style={styles.fieldGap}
                styles={styles}
                colors={colors}
                placeholder={isLogin ? 'Enter your password' : 'At least 8 characters, with a number'}
                value={values.password}
                onChangeText={setField('password')}
                onBlur={markTouched('password')}
                error={showError('password')}
                autoCapitalize="none"
                textContentType={isLogin ? 'password' : 'newPassword'}
                returnKeyType={isLogin ? 'done' : 'next'}
                onSubmitEditing={isLogin ? handleSubmit : () => confirmRef.current?.focus()}
                blurOnSubmit={isLogin}
              />

              {!isLogin && (
                <AuthInput
                  ref={confirmRef}
                  label="Confirm password"
                  secure
                  style={styles.fieldGap}
                  styles={styles}
                  colors={colors}
                  placeholder="Re-enter your password"
                  value={values.confirm}
                  onChangeText={setField('confirm')}
                  onBlur={markTouched('confirm')}
                  error={showError('confirm')}
                  autoCapitalize="none"
                  textContentType="newPassword"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              )}

              {isLogin && (
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              )}

              <TouchableOpacity
                style={[styles.submitButton, !isLogin && styles.registerButton]}
                onPress={handleSubmit}
                activeOpacity={0.85}
                accessibilityRole="button"
              >
                <Text style={styles.submitButtonText}>
                  {isLogin ? 'Login' : 'Register'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footer}>A warm welcome. A fresh start.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Pemetaan nama warna lokal screen ini ke token theme global
const makeColors = (t) => ({
  background: t.background,
  ink: t.text,
  muted: t.textMuted,
  orange: t.primary,
  paleOrange: t.card,
  border: t.border,
  placeholder: t.placeholder,
  white: t.surface,
  onPrimary: t.onPrimary,
  danger: t.danger || '#D64545',
});

const createStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  content: {
    width: '100%',
    maxWidth: 440,
    paddingTop: 10,
    paddingBottom: 24,
  },
  header: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  hero: {
    alignSelf: 'center',
    width: 154,
    height: 154,
    marginTop: 24,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFrame: {
    width: 146,
    height: 146,
    borderRadius: 73,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
  },
  heroBadge: {
    position: 'absolute',
    right: 3,
    bottom: 7,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.paleOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.ink,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 11,
    textAlign: 'center',
  },
  tabs: {
    height: 42,
    flexDirection: 'row',
    marginTop: 17,
    marginBottom: 16,
    padding: 3,
    borderRadius: 11,
    backgroundColor: colors.paleOrange,
  },
  tab: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: colors.white,
  },
  tabText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.ink,
    fontWeight: '700',
  },
  form: {
    width: '100%',
  },
  label: {
    marginBottom: 6,
    color: colors.ink,
    fontSize: 11,
    fontWeight: '600',
  },
  fieldGap: {
    marginTop: 14,
  },
  inputWrap: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    backgroundColor: colors.white,
  },
  inputField: {
    flex: 1,
    height: '100%',
    color: colors.ink,
    fontSize: 12,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    marginTop: 5,
    color: colors.danger,
    fontSize: 10,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 11,
    color: colors.orange,
    fontSize: 11,
  },
  submitButton: {
    height: 46,
    marginTop: 14,
    borderRadius: 10,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButton: {
    marginTop: 22,
  },
  submitButtonText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    marginTop: 14,
    color: colors.muted,
    fontSize: 10,
    textAlign: 'center',
  },
});
