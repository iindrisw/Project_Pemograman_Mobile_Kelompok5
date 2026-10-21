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

  const vennSize = width * 0.85;
  const circleSize = vennSize * 0.45;

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

      {/* NAVBAR */}
      <View style={styles.headerMobile}>
        <View style={styles.navMenuCentered}>
          {['Home', 'About Us', 'Section 3', 'Section 4'].map((item) => (
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

          {/* HIJAU: teks MyBakery vertikal */}
          <View
            style={[
              styles.verticalTextWrapper,
              { left: 97 * s - 110, top: 205 * s - 25 },
            ]}
          >
            <Text style={[styles.verticalText, { fontSize: 62 * s }]} numberOfLines={1}>
              MyBakery
            </Text>
          </View>

          {/* KUNING: logo_spl_s tepat di bawah teks */}
          <Image
            source={require('../../assets/splash_screen/logo_spl_s.png')}
            style={{
              position: 'absolute',
              left: 92 * s - 40 * s,
              top: 442 * s - 40 * s,
              width: 80 * s,
              height: 80 * s,
              zIndex: 10,
            }}

            
            resizeMode="contain"

          />
          {/* TEKS TAMBAHAN DI KANAN ATAS */}
          <View style={styles.topRightTextContainer}>
            <Text style={styles.topRightTitle}>FRESHLY BAKED</Text>
            <Text style={styles.topRightSubtitle}>Everyday with love</Text>
          </View>

          {/* MERAH + BIRU: roti besar & tombol Order Now */}
<View style={[styles.centerHeroSection, { marginTop: 190 * s }]}>

  {/* Pembungkus tinggi tetap = tinggi roti yang kelihatan */}
  <View style={{ width: '100%', height: 760 * s, alignItems: 'center', justifyContent: 'center' }}>
    <Image
      source={require('../../assets/splash_screen/onboarding-bread.png')}
      style={[styles.mainBreadImage, { width: 640 * s }]}
      resizeMode="contain"
    />
  </View>

  <TouchableOpacity
    style={[styles.orderButton, { width: 445 * s }]}
    onPress={() => navigation.navigate('Home')}
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

          {/* VENN DIAGRAM 3 LINGKARAN */}
          <View style={[styles.vennContainer, { width: vennSize, height: vennSize * 0.95 }]}>

            {/* 1. FRESH (Atas) */}
            <View style={[styles.circleWrapper, { top: 0, left: (vennSize - circleSize) / 2 }]}>
              <Image source={require('../../assets/splash_screen/about_fresh.png')} style={{ width: circleSize, height: circleSize }} resizeMode="contain" />
              <Image source={require('../../assets/splash_screen/macaron.png')} style={styles.floatingMacaron} resizeMode="contain" />
              <View style={styles.textLabelFresh}>
                <Text style={styles.labelTitle}>FRESH</Text>
                <Text style={styles.labelDesc}>Freshly made healthy for you and your loved ones directly from the oven..</Text>
              </View>
            </View>

            {/* 2. TASTY (Kiri Bawah) */}
            <View style={[styles.circleWrapper, { bottom: 0, left: 10 }]}>
              <Image source={require('../../assets/splash_screen/about_tasty.png')} style={{ width: circleSize, height: circleSize }} resizeMode="contain" />
              <View style={styles.textLabelTasty}>
                <Text style={styles.labelTitle}>TASTY</Text>
                <Text style={styles.labelDesc}>Freshly made healthy for you and your loved ones directly from the oven..</Text>
              </View>
            </View>

            {/* 3. NATURAL (Kanan Bawah) */}
            <View style={[styles.circleWrapper, { bottom: 0, right: 10 }]}>
              <Image source={require('../../assets/splash_screen/about_natural.png')} style={{ width: circleSize, height: circleSize }} resizeMode="contain" />
              <Image source={require('../../assets/splash_screen/roti_panjang.png')} style={styles.floatingBread} resizeMode="contain" />
              <View style={styles.textLabelNatural}>
                <Text style={styles.labelTitle}>NATURAL</Text>
                <Text style={styles.labelDesc}>Freshly made healthy for you and your loved ones directly from the oven..</Text>
              </View>
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

  /* --- NAVBAR --- */
  headerMobile: {
    paddingVertical: 14,
    paddingHorizontal: 15,
    backgroundColor: '#F4F5F7',
    zIndex: 99,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    alignItems: 'center',
  },
  navMenuCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
  },
  navItem: {
    fontSize: 13,
    color: '#333',
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

  verticalTextWrapper: {
    position: 'absolute',
    width: 220,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-90deg' }],
    zIndex: 10,
  },
  verticalText: {
    fontWeight: '900',
    color: '#010101',
    letterSpacing: 1,
  },

  centerHeroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  topRightTextContainer: {
    position: 'absolute',
    top: '12%',
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
  // Lebar diatur di JSX (640 * s). Ubah angka itu untuk memperbesar/memperkecil.
  // aspectRatio = lebar / tinggi gambar; ubah kalau gambar terlihat gepeng/terpotong.
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
    paddingVertical: 40,
    paddingHorizontal: 15,
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
  },
  blackOrderButton: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 35,
  },
  blackOrderButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  vennContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 40,
  },
  circleWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelTitle: { fontSize: 13, fontWeight: 'bold', color: '#000', marginBottom: 2 },
  labelDesc: { fontSize: 8, color: '#666', lineHeight: 11, textAlign: 'center' },

  textLabelFresh: { position: 'absolute', right: -95, top: '25%', width: 95 },
  floatingMacaron: { position: 'absolute', right: -25, top: -5, width: 30, height: 30, zIndex: 10 },

  textLabelTasty: { position: 'absolute', left: -95, top: '25%', width: 95 },

  textLabelNatural: { position: 'absolute', bottom: -30, right: -15, width: 110, textAlign: 'center' },
  floatingBread: { position: 'absolute', left: -35, bottom: -15, width: 65, height: 35, zIndex: 10 },
});
