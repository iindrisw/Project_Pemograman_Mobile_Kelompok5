import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const MAX_CONTENT_WIDTH = 560; // phone-like column on laptop / web

/* ----------------------------- Static slide data ----------------------------- */
const slides = [
  {
    id: '1',
    title: 'Welcome to MyBakery',
    description:
      'Discover warm bread, fresh pastries, and delicious treats made with love, delivered straight to you.',
    image: require('../../assets/onboarding-bread.jpg'),
    bg: '#F0F0F0', // matches the image background so no edges are visible
    showBrand: true,
  },
  {
    id: '2',
    title: 'How it’s made?',
    description:
      'A line of tasty and healthy specialities rich in fiber and vegetable protein baked specially for you and your loved ones, directly from the oven.. Taste and See, the wonders of Mybakery.',
    image: require('../../assets/onboarding-ingredients.jpg'),
    bg: '#F3F3F3',
    showBrand: false,
  },
];

/* ------------------------------ Single slide view ----------------------------- */
function Slide({ item, slideWidth, slideHeight, compact }) {
  return (
    <View
      style={[
        styles.slide,
        { width: slideWidth, height: slideHeight, backgroundColor: item.bg },
      ]}
    >
      {/* Brand row (same height on every slide so both slides line up) */}
      <View style={styles.brandArea}>
        {item.showBrand && <Text style={styles.brandText}>MyBakery</Text>}
      </View>

      {/* Image fills the remaining height; "contain" keeps it undistorted */}
      <View style={styles.imageArea}>
        <Image source={item.image} style={styles.heroImage} resizeMode="contain" />
      </View>

      {/* Fixed-height text block → both slides get identical image size */}
      <View style={[styles.textArea, { height: compact ? 140 : 170 }]}>
        <Text style={[styles.title, compact && styles.titleCompact]}>{item.title}</Text>
        <Text style={[styles.description, compact && styles.descriptionCompact]}>
          {item.description}
        </Text>
      </View>
    </View>
  );
}

/* -------------------------------- Main screen -------------------------------- */
export default function OnboardingScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const compact = height < 760;

  const listRef = useRef(null);
  const [listHeight, setListHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastSlide = activeIndex === slides.length - 1;

  // Keep the current slide aligned after the window is resized
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: activeIndex * contentWidth, animated: false });
  }, [contentWidth]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMomentumEnd = (e) => {
    setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / contentWidth));
  };

  // Slide 1 → Next scrolls to slide 2. Slide 2 → Next goes to Login.
  const handleNext = () => {
    if (isLastSlide) {
      navigation.navigate('Login');
    } else {
      const next = activeIndex + 1;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
    }
  };

  const activeBg = slides[activeIndex].bg;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: activeBg }]}>
      <View style={[styles.content, { width: contentWidth }]}>
        {/* Carousel (takes all space above the footer) */}
        <View
          style={styles.carousel}
          onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}
        >
          {listHeight > 0 && (
            <FlatList
              ref={listRef}
              data={slides}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Slide
                  item={item}
                  slideWidth={contentWidth}
                  slideHeight={listHeight}
                  compact={compact}
                />
              )}
              horizontal
              pagingEnabled
              bounces={false}
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleMomentumEnd}
              getItemLayout={(_, index) => ({
                length: contentWidth,
                offset: contentWidth * index,
                index,
              })}
            />
          )}
        </View>

        {/* Footer: dots + button (normal flow, never overlaps the slides) */}
        <View style={[styles.footer, { backgroundColor: activeBg }]}>
          <View style={styles.dots}>
            {slides.map((s, i) => (
              <View key={s.id} style={[styles.dot, i === activeIndex && styles.dotActive]} />
            ))}
          </View>

          <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
            <Ionicons name="arrow-forward" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ----------------------------------- Styles ----------------------------------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1, alignItems: 'center' },
  content: { flex: 1 },
  carousel: { flex: 1 },

  slide: { alignItems: 'center' },
  brandArea: { height: 48, justifyContent: 'center' },
  brandText: { fontSize: 24, fontWeight: 'bold', color: '#2d1a0e' },

  imageArea: { flex: 1, width: '100%', minHeight: 100 },
  heroImage: { width: '100%', height: '100%' },

  textArea: { width: '100%', paddingHorizontal: 28, alignItems: 'center', paddingTop: 6 },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d1a0e',
    textAlign: 'center',
    marginBottom: 10,
  },
  titleCompact: { fontSize: 26, marginBottom: 6 },
  description: { fontSize: 15, lineHeight: 22, color: '#3d2415', textAlign: 'center' },
  descriptionCompact: { fontSize: 13, lineHeight: 19 },

  footer: { paddingHorizontal: 28, paddingTop: 8, paddingBottom: 20, alignItems: 'center' },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#d4cbc5' },
  dotActive: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#ea580c' },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'stretch',
    height: 56,
    backgroundColor: '#ea580c',
    borderRadius: 28,
    elevation: 6,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
});
