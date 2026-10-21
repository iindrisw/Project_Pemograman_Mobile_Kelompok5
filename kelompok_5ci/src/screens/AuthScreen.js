import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

const breadImage = require('../../assets/splash_screen/logo_spl_s.png');

export default function AuthScreen({ navigation, mode }) {
  const isLogin = mode === 'login';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    navigation.navigate('Home');
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
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor={colors.placeholder}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
                returnKeyType="next"
              />

              <Text style={[styles.label, styles.passwordLabel]}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.placeholder}
                value={password}
                secureTextEntry
                onChangeText={setPassword}
                autoCapitalize="none"
                textContentType={isLogin ? 'password' : 'newPassword'}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />

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

const colors = {
  background: '#faf8f6',
  ink: '#302823',
  muted: '#95877e',
  orange: '#e66b20',
  paleOrange: '#f3e9df',
  border: '#eee7e1',
  placeholder: '#a89b92',
  white: '#ffffff',
};

const styles = StyleSheet.create({
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
  passwordLabel: {
    marginTop: 14,
  },
  input: {
    height: 45,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    backgroundColor: colors.white,
    color: colors.ink,
    fontSize: 12,
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
    marginTop: 29,
  },
  submitButtonText: {
    color: colors.white,
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
