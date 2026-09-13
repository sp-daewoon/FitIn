import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WorkoutShell } from './src/screens/WorkoutShell';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { SignInScreen } from './src/screens/SignInScreen';
import { View, ActivityIndicator } from 'react-native';
function Entry() {
  const auth = useAuth();
  if (!auth.ready) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
  return auth.entry === 'login' ? <SignInScreen /> : <WorkoutShell key={auth.account?.id ?? 'guest'} />;
}
export default function App(){return <SafeAreaProvider><AuthProvider><Entry /></AuthProvider></SafeAreaProvider>;}
