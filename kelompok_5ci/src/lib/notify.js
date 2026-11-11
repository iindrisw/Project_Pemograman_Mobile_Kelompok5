// Simpan di src/lib/notify.js
// Alert.alert tidak andal di web, jadi pakai window.alert / window.confirm di sana.
import { Alert, Platform } from 'react-native';

export const notify = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
};

// Mengembalikan Promise<boolean>: true kalau user menekan tombol konfirmasi.
export const confirmDialog = (title, message, confirmText = 'Hapus') =>
  new Promise((resolve) => {
    if (Platform.OS === 'web') {
      resolve(window.confirm(`${title}\n\n${message}`));
      return;
    }
    Alert.alert(title, message, [
      { text: 'Batal', style: 'cancel', onPress: () => resolve(false) },
      { text: confirmText, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });