import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function Signup({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daftar Akun Baru 🥐</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Kembali ke Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff7f2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d1a0e',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#ea580c',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});