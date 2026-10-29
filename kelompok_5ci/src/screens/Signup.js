import React from 'react';
import AuthScreen from './AuthScreen';

export default function Signup({ navigation }) {
  return <AuthScreen navigation={navigation} mode="signup" />;
}