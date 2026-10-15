import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Halaman Profil 👤</Text>
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ea580c',
  },
});