import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from './src/context/CartContext';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

import OnboardingScreen from './src/screens/OnboardingScreen';
import Login from './src/screens/Login';
import Signup from './src/screens/Signup';
import HomeScreen from './src/screens/HomeScreen';
import NewArrivalsScreen from './src/screens/NewArrivalsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MyOrders from './src/screens/MyOrders';
import Address from './src/screens/Address';
// --- screen baru ---
import Payments from './src/screens/Payments';
import Settings from './src/screens/Settings';
import Support from './src/screens/Support';
import AddAddress from './src/screens/AddAddress';
import AddPayment from './src/screens/AddPayment';
import MenuScreen from './src/screens/MenuScreen';
import CartScreen from './src/screens/CartScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { isDark } = useTheme();

  return (
    <>
      {/* Ikon status bar ikut theme */}
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Onboarding"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right', // masuk: geser dari kanan, KELUAR (back): geser balik ke kanan
            animationDuration: 300,        // hanya berlaku di iOS
            gestureEnabled: true,          // swipe-back ikut menganimasikan keluar
          }}
        >
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: 'fade' }} />

          {/* Login <-> Signup cuma ganti tab, jadi cukup fade */}
          <Stack.Screen name="Login" component={Login} options={{ animation: 'fade', animationTypeForReplace: 'pop' }} />
          <Stack.Screen name="Signup" component={Signup} options={{ animation: 'fade' }} />

          <Stack.Screen name="Home" component={HomeScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="NewArrivals" component={NewArrivalsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ animation: 'fade_from_bottom' }} />
          <Stack.Screen name="MyOrders" component={MyOrders} />
          <Stack.Screen name="Address" component={Address} />
          <Stack.Screen name="AddAddress" component={AddAddress} />

          {/* Dibuka dari menu di ProfileScreen */}
          <Stack.Screen name="Payments" component={Payments} />
          <Stack.Screen name="AddPayment" component={AddPayment} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="Support" component={Support} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Onboarding"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Signup" component={Signup} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Menu" component={MenuScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </SafeAreaProvider>
  );
}
