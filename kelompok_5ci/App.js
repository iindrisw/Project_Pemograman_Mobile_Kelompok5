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
import UserMenuScreen from './src/screens/UserMenuScreen'; 
import CartScreen from './src/screens/CartScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import EditProductScreen from './src/screens/EditProductScreen';
import HapusProductScreen from './src/screens/HapusProductScreen';
import CheckoutSuccessScreen from './src/screens/CheckoutSuccessScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MyOrders from './src/screens/MyOrders';
import Payments from './src/screens/Payments';
import AddPayment from './src/screens/AddPayment';
import Settings from './src/screens/Settings';
import Support from './src/screens/Support';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { isDark } = useTheme();

  return (
    <>
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
          <Stack.Screen name="Login" component={Login} options={{ animation: 'fade', animationTypeForReplace: 'pop' }} />
          <Stack.Screen name="Signup" component={Signup} options={{ animation: 'fade' }} />

          <Stack.Screen name="Home" component={HomeScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="NewArrivals" component={NewArrivalsScreen} />
          <Stack.Screen name="Menu" component={MenuScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="UserMenu" component={UserMenuScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="AddProduct" component={AddProductScreen} />
          <Stack.Screen name="EditProduct" component={EditProductScreen} />
          <Stack.Screen name="HapusProduct" component={HapusProductScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="CheckoutSuccess" component={CheckoutSuccessScreen} options={{ animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ animation: 'fade_from_bottom' }} />

          <Stack.Screen name="MyOrders" component={MyOrders} />
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