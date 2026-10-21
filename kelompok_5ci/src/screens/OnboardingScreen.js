import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const s = width / 709; // skala dari ukuran foto referensi
  const scrollViewRef = useRef(null);
  const [activeSection, setActiveSection] = useState('Home');

  /* ---------- UKURAN VENN DIAGRAM (semua turunan dari lebar layar) ---------- */
  const RING_RATIO = 0.8;                 // ring di dalam PNG ±80% dari ukuran gambar. Ubah kalau lingkaran kurang/lebih menimpa.
  const D = width * 0.4;                  // diameter ring yang terlihat
  const box = D / RING_RATIO;             // ukuran gambar sebenarnya
  const spreadX = width * 0.17;           // jarak pusat lingkaran bawah ke tengah (makin kecil = makin menimpa)
  const spreadY = width * 0.3;            // jarak vertikal lingkaran atas ke lingkaran bawah
  const oy = width * 0.06;                // ruang kosong di atas diagram
  const cTop = { x: width / 2, y: oy + D / 2 };
  const cLeft = { x: width / 2 - spreadX, y: oy + D / 2 + spreadY };
  const cRight = { x: width / 2 + spreadX, y: oy + D / 2 + spreadY };
  const vennHeight = oy + D + spreadY + 90; // 90 = ruang untuk label di bawah lingkaran
  const imgPos = (c) => ({
    position: 'absolute',
    left: c.x - box / 2,
    top: c.y - box / 2,
    width: box,
    height: box,
  });
  const labelW = width * 0.32;
  const freshLabelLeft = cTop.x + D / 2 + width * 0.02;

  // Roti panjang: menempel di tepi kanan-bawah lingkaran NATURAL
  const breadW = width * 0.2;
  const breadH = breadW / 1.86;
  const breadCx = cRight.x + (D / 2) * 0.75;
  const breadCy = cRight.y + (D / 2) * 0.75;

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    if (scrollY > height * 0.5) {
      setActiveSection('About Us');
    } else {
      setActiveSection('Home');
    }
  };

  const scrollToSection = (section) => {
    setActiveSection(section);
    if (section === 'Home') {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (section === 'About Us') {
      scrollViewRef.current?.scrollTo({ y: height, animated: true });
    }
  };

  return (
    <View style={styles.container}>
      
      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }} // Tambah padding bawah biar konten tidak tertutup navbar
      >
        {/* ... (Isi ScrollView: Home Section & About Us Section tetap di sini) ... */}
      </ScrollView>

      {/* NAVBAR PINDAH KE BAWAH (BOTTOM NAVIGATION) */}
      <View style={styles.bottomNavbar}>
        <View style={styles.navMenuCentered}>
          {['Home', 'About Us'].map((item) => (
            <TouchableOpacity key={item} onPress={() => scrollToSection(item)}>
              <Text style={[
                styles.navItem,
                activeSection === item && styles.navItemActive
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >

        {/* ======================================= */}
        {/* BAGIAN 1: HOME SECTION                  */}
        {/* ======================================= */}
        <View style={[styles.heroSection, { minHeight: height - 60 }]}>

          <Image
            source={require('../../assets/splash_screen/bg_circles.png')}
            style={styles.bgCircles}
            resizeMode="cover"
          />

          {/* BRAND: DAPUR (kecil, oranye) + Chikara (besar, hitam) + logo donat */}
          <View style={[styles.brandBlock, { left: 45 * s, top: 55 * s }]}>
            <View style={styles.brandTopRow}>
              <View style={[styles.brandLine, { width: 50 * s }]} />
              <Text style={[styles.brandSmall, { fontSize: 34 * s, letterSpacing: 10 * s }]}>
                DAPUR
              </Text>
            </View>
            <View style={styles.brandNameRow}>
              <Text
                style={[styles.brandBig, { fontSize: 120 * s, lineHeight: 134 * s }]}
                numberOfLines={1}
              >
                Chikara
              </Text>
              <Image
                source={require('../../assets/splash_screen/logo_spl_s.png')}
                style={{ width: 70 * s, height: 70 * s, marginLeft: 14 * s, marginTop: 16 * s }}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* TEKS TAMBAHAN DI KANAN ATAS */}
          <View style={styles.topRightTextContainer}>
            <Text style={styles.topRightTitle}>FRESHLY BAKED</Text>
            <Text style={styles.topRightSubtitle}>Everyday with love</Text>
          </View>

          {/* MERAH + BIRU: roti besar & tombol Order Now */}
          <View style={[styles.centerHeroSection, { marginTop: 190 * s }]}>

            {/* Pembungkus tinggi tetap = tinggi roti yang kelihatan */}
            <View style={{ width: '100%', height: 840 * s, alignItems: 'center', justifyContent: 'center' }}>
              <Image
                source={require('../../assets/splash_screen/onboarding-bread.png')}
                style={[styles.mainBreadImage, { width: 640 * s }]}
                resizeMode="contain"
              />
            </View>

            <TouchableOpacity
              style={[styles.orderButton, { width: 445 * s }]}
              onPress={() => navigation.navigate('Signup')}
            >
              <Ionicons name="fast-food-outline" size={18} color="#fff" style={styles.buttonIconLeft} />
              <Text style={styles.orderButtonText}>ORDER NOW</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* ORANYE: kue kecil + teks deskripsi */}
          <View
            style={[
              styles.bottomInfoRow,
              { marginTop: 55 * s, paddingLeft: 86 * s, paddingRight: 79 * s },
            ]}
          >
            <Image
              source={require('../../assets/splash_screen/kue1_spl_s.png')}
              style={{ width: 115 * s, height: 115 * s, marginRight: 44 * s }}
              resizeMode="contain"
            />
            <Text style={styles.bottomDescription}>
              The bakery is an establishment that produces food baked in an oven such as bread, cookies, cakes, pastries, and pies.
            </Text>
          </View>

        </View>

        {/* ======================================= */}
        {/* BAGIAN 2: ABOUT US SECTION              */}
        {/* ======================================= */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>About Us</Text>
          <Text style={styles.aboutSubtitle}>
            From the harmonious union between a mixes of cereals flours and legume flours, a new line of tasty specialities rich in fiber and vegetable protein is born
          </Text>

          <TouchableOpacity style={styles.blackOrderButton}>
            <Ionicons name="fast-food-outline" size={16} color="#ca6c26" style={styles.buttonIconLeft} />
            <Text style={styles.blackOrderButtonText}>ORDER NOW</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 10 }} />
          </TouchableOpacity>

          {/* VENN DIAGRAM 3 LINGKARAN (saling menimpa, semua label masuk layar) */}
          <View style={{ width, height: vennHeight }}>

            {/* NATURAL (kanan bawah) digambar dulu, TASTY & FRESH menimpa di atasnya */}
            <Image
              source={require('../../assets/splash_screen/about_natural.png')}
              style={imgPos(cRight)}
              resizeMode="contain"
            />
            <Image
              source={require('../../assets/splash_screen/about_tasty.png')}
              style={imgPos(cLeft)}
              resizeMode="contain"
            />
            <Image
              source={require('../../assets/splash_screen/about_fresh.png')}
              style={imgPos(cTop)}
              resizeMode="contain"
            />

            {/* Hiasan: macaron di kanan atas FRESH */}
            <Image
              source={require('../../assets/splash_screen/macaron.png')}
              style={{
                position: 'absolute',
                width: width * 0.09,
                height: width * 0.09,
                left: cTop.x + D * 0.69 - (width * 0.09) / 2,
                top: cTop.y - D * 0.39 - (width * 0.09) / 2,
                zIndex: 10,
              }}
              resizeMode="contain"
            />

            {/* Hiasan: roti panjang menempel di tepi kanan-bawah lingkaran NATURAL */}
            <Image
              source={require('../../assets/splash_screen/roti_panjang.png')}
              style={{
                position: 'absolute',
                width: breadW,
                height: breadH,
                left: breadCx - breadW / 2,
                top: breadCy - breadH / 2,
                transform: [{ rotate: '-35deg' }],
                zIndex: 10,
              }}
              resizeMode="contain"
            />

            {/* LABEL FRESH: di kanan lingkaran atas */}
            <View
              style={[
                styles.labelBox,
                {
                  left: freshLabelLeft,
                  top: cTop.y - 30,
                  width: width - freshLabelLeft - width * 0.04,
                  alignItems: 'flex-start',
                },
              ]}
            >
              <Text style={styles.labelTitle}>FRESH</Text>
              <Text style={[styles.labelDesc, { textAlign: 'left' }]}>
                Freshly made healthy for you and your loved ones directly from the oven..
              </Text>
            </View>

            {/* LABEL TASTY: di bawah lingkaran kiri */}
            <View style={[styles.labelBox, { left: cLeft.x - labelW / 2, top: cLeft.y + D / 2 + 8, width: labelW }]}>
              <Text style={styles.labelTitle}>TASTY</Text>
              <Text style={styles.labelDesc}>
                Freshly made healthy for you and your loved ones directly from the oven..
              </Text>
            </View>

            {/* LABEL NATURAL: di bawah lingkaran kanan */}
            <View style={[styles.labelBox, { left: cRight.x - labelW / 2, top: cRight.y + D / 2 + 8, width: labelW }]}>
              <Text style={styles.labelTitle}>NATURAL</Text>
              <Text style={styles.labelDesc}>
                Freshly made healthy for you and your loved ones directly from the oven..
              </Text>
            </View>

          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },

/* --- BOTTOM NAVBAR --- */
  bottomNavbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 14,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF', // Warna background putih bersih agar kontras
    zIndex: 99,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    alignItems: 'center',
    elevation: 10, // Efek bayangan di Android
    shadowColor: '#000', // Efek bayangan di iOS
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navMenuCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40, // Jarak antar menu diperlebar dikit biar pas di bawah
  },
  navItem: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  navItemActive: {
    color: '#ca6c26',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  /* --- HOME SECTION --- */
  heroSection: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 30,
  },
  bgCircles: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },

  /* BRAND */
  brandBlock: {
    position: 'absolute',
    zIndex: 10,
  },
  brandTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLine: {
    height: 3,
    backgroundColor: '#ca6c26',
    borderRadius: 2,
    marginRight: 10,
  },
  brandSmall: {
    fontWeight: '700',
    color: '#ca6c26',
  },
  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandBig: {
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: -1,
    flexShrink: 1,
  },

  centerHeroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  topRightTextContainer: {
    position: 'absolute',
    top: '20%',
    right: 25,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  topRightTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ca6c26', // Warna oranye khas bakery
    letterSpacing: 1,
  },
  topRightSubtitle: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '500',
    marginTop: 2,
  },
  mainBreadImage: {
    aspectRatio: 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  orderButton: {
    flexDirection: 'row',
    backgroundColor: '#ca6c26',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 5,
  },
  orderButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13, marginHorizontal: 6 },
  buttonIconLeft: { marginRight: 4 },

  bottomInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    zIndex: 10,
  },
  bottomDescription: {
    flex: 1,
    fontSize: 10,
    color: '#555555',
    lineHeight: 14,
  },

  /* --- ABOUT US SECTION --- */
  aboutSection: {
    width: '100%',
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 0, // diagram selebar layar, padding dipindah ke teks
  },
  aboutTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: '#ca6c26',
    marginBottom: 8,
  },
  aboutSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  blackOrderButton: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 25,
  },
  blackOrderButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  labelBox: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 5,
  },
  labelTitle: { fontSize: 13, fontWeight: 'bold', color: '#000', marginBottom: 2 },
  labelDesc: { fontSize: 9, color: '#666', lineHeight: 12, textAlign: 'center' },
});
