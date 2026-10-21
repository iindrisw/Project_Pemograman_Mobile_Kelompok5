import React from 'react';
import AuthScreen from './AuthScreen';

export default function Login({ navigation }) {
  return <AuthScreen navigation={navigation} mode="login" />;
}