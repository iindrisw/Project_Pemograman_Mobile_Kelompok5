import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { CartProvider } from './src/context/CartContext';

import OnboardingScreen from './src/screens/OnboardingScreen';
import Login from './src/screens/Login';
import Signup from './src/screens/Signup';
import HomeScreen from './src/screens/HomeScreen';
import NewArrivalsScreen from './src/screens/NewArrivalsScreen';
import MenuScreen from './src/screens/MenuScreen';
import CartScreen from './src/screens/CartScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CheckoutSuccessScreen from './src/screens/CheckoutSuccessScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MyOrders from './src/screens/MyOrders';
import Address from './src/screens/Address';
import AddAddress from './src/screens/AddAddress';
import Payments from './src/screens/Payments';
import AddPayment from './src/screens/AddPayment';
import Settings from './src/screens/Settings';
import Support from './src/screens/Support';

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
            animation: 'slide_from_right',
            animationDuration: 300,
            gestureEnabled: true,
          }}
        >
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: 'fade' }} />

          {/* Login <-> Signup cuma ganti tab, jadi cukup fade */}
          <Stack.Screen name="Login" component={Login} options={{ animation: 'fade', animationTypeForReplace: 'pop' }} />
          <Stack.Screen name="Signup" component={Signup} options={{ animation: 'fade' }} />

          <Stack.Screen name="Home" component={HomeScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="NewArrivals" component={NewArrivalsScreen} />
          <Stack.Screen name="Menu" component={MenuScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="CheckoutSuccess" component={CheckoutSuccessScreen} options={{ animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ animation: 'fade_from_bottom' }} />

          {/* Dibuka dari menu di ProfileScreen */}
          <Stack.Screen name="MyOrders" component={MyOrders} />
          <Stack.Screen name="Address" component={Address} />
          <Stack.Screen name="AddAddress" component={AddAddress} />
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
        <CartProvider>
          <RootNavigator />
        </CartProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
