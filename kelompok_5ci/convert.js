import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  useWindowDimensions, 
  SafeAreaView, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
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
    <SafeAreaView style={styles.container}>
      
      {/* 1. NAVBAR (Diturunkan lebih jauh dari atas agar lebih aman) */}
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
        {/* BAGIAN 1: HOME SECTION (Pas 1 Layar Penuh) */}
        {/* ======================================= */}
        <View style={[styles.heroSection, { height: height - 70 }]}>
          
          <Image 
            source={require('../../assets/splash_screen/bg_circles.png')} 
            style={styles.bgCircles} 
            resizeMode="cover"
          />

          {/* KANAN ATAS (Kue & Deskripsi) */}
          <View style={styles.topRightSection}>
            <Image 
              source={require('../../assets/splash_screen/kue1_spl_s.png')} 
              style={styles.cakeImage} 
              resizeMode="contain"
            />
            <Text style={styles.tinyDescription}>
              The bakery is an establishment that produces food baked in an oven such as bread, cookies, cakes, pastries, and pies.
            </Text>
          </View>

          {/* SISI KIRI: MyBakery & Donat di sebelah huruf M */}
          <View style={styles.leftSideGroup}>
            <View style={styles.verticalTextWrapper}>
              <Text style={styles.verticalText} numberOfLines={1}>
                MyBakery
              </Text>
            </View>
            <Image 
              source={require('../../assets/splash_screen/logo_spl_s.png')} 
              style={styles.donutImage} 
              resizeMode="contain"
            />
          </View>

          {/* TENGAH: Roti Utama & Tombol Order Now yang besar */}
          <View style={styles.centerHeroSection}>
            <Image 
              source={require('../../assets/splash_screen/onboarding-bread.png')} 
              style={styles.mainBreadImage} 
              resizeMode="contain"
            />
            <TouchableOpacity 
              style={styles.orderButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Ionicons name="fast-food-outline" size={18} color="#fff" style={styles.buttonIconLeft} />
              <Text style={styles.orderButtonText}>ORDER NOW</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

        </View>

        {/* ======================================= */}
        {/* BAGIAN 2: ABOUT US SECTION             */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  
  /* --- NAVBAR --- */
  headerMobile: {
    paddingVertical: 22, // Diturunkan agar lebih jauh dari atas
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
    gap: 20,
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

  heroSection: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgCircles: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  topRightSection: {
    position: 'absolute',
    top: '3%', 
    right: 15,
    width: 110,
    alignItems: 'center',
    zIndex: 10,
  },
  cakeImage: { width: 65, height: 65, marginBottom: 4 },
  tinyDescription: { fontSize: 7.5, color: '#555555', textAlign: 'center', lineHeight: 10 },

  /* --- KIRI: MyBakery & Donat di sebelah Huruf M --- */
  leftSideGroup: {
    position: 'absolute',
    left: -85,
    top: '25%', // Dinaikkan ke atas agar komposisi pas
    alignItems: 'center',
    zIndex: 10,
  },
  verticalTextWrapper: {
    transform: [{ rotate: '-90deg' }],
    width: 250,
    alignItems: 'center',
    marginBottom: 10, 
  },
  verticalText: { 
    fontSize: 48, 
    fontWeight: '900', 
    color: '#010101', 
    letterSpacing: 2 
  },
  donutImage: {
    width: 40,
    height: 40,
    position: 'absolute',
    top: -15, // Disesuaikan agar pas di sebelah huruf M awal MyBakery
    left: 105,
  },

  /* --- TENGAH: Roti Besar & Tombol --- */
  centerHeroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    marginLeft: 15, // Disesuaikan agar pas di tengah tanpa menabrak teks kiri
  },
  mainBreadImage: {
    width: 300,
    height: 220,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 10,
  },
  orderButton: {
    flexDirection: 'row', 
    backgroundColor: '#ca6c26', 
    paddingVertical: 12, 
    paddingHorizontal: 26, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 15, 
    elevation: 5,
  },
  orderButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14, marginHorizontal: 6 },
  buttonIconLeft: { marginRight: 4 },

  /* --- ABOUT US SECTION --- */
  aboutSection: {
    width: '100%',
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    paddingVertical: 50,
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