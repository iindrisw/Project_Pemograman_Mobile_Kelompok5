import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

/* ------------------------------ Theme objects ------------------------------ */
export const lightTheme = {
  mode: 'light',
  background: '#FAF7F2',   // latar halaman
  surface: '#FFFFFF',      // bottom nav, kartu kategori, input
  card: '#F1E7DB',         // kartu produk & banner
  text: '#2D1A0E',         // teks utama
  textMuted: '#78716C',    // teks sekunder (harga, deskripsi)
  primary: '#EA580C',      // oranye brand
  onPrimary: '#FFFFFF',    // teks/ikon di atas warna primary
  border: '#ECE4D9',
  navBorder: '#F3F4F6',
  navInactive: '#888888',
  iconCircle: '#FEF3C7',
  dot: '#D9D4CC',
  shadow: '#2D1A0E',
  badgeBg: '#F9EADC',      // badge/tag oranye muda, tombol logout
  success: '#55704B',      // teks status Delivered
  successBg: '#EAF0E5',    // latar badge Delivered
  placeholder: '#A89B92',  // placeholder input
};

export const darkTheme = {
  mode: 'dark',
  background: '#17110C',
  surface: '#231A13',
  card: '#2C2017',
  text: '#F5EBDD',
  textMuted: '#B8AB9C',
  primary: '#F97316',
  onPrimary: '#FFFFFF',
  border: '#3A2D22',
  navBorder: '#3A2D22',
  navInactive: '#9A8E80',
  iconCircle: '#43301A',
  dot: '#4A3E33',
  shadow: '#000000',
  badgeBg: '#43301A',
  success: '#8FC27E',
  successBg: '#25341F',
  placeholder: '#7D7066',
};

/* --------------------------------- Context --------------------------------- */
const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = useCallback(() => setIsDark((v) => !v), []);

  const value = useMemo(
    () => ({ theme: isDark ? darkTheme : lightTheme, isDark, toggleTheme }),
    [isDark, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
