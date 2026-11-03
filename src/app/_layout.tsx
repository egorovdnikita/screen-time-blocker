import '@/theme/webTextStyles';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppStateProvider } from '@/state/app';
import { NotificationSync } from '@/state/notifications';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <StatusBar style="light" />
        <NotificationSync />
        <Stack screenOptions={{ headerShown: false }}><Stack.Screen name="share-devices" options={{ animation: 'fade', gestureEnabled: false }} /><Stack.Screen name="session" options={{ presentation: 'transparentModal', animation: 'none', gestureEnabled: false, contentStyle: { backgroundColor: 'transparent' } }} /><Stack.Screen name="lock" options={{ presentation: 'transparentModal', animation: 'none', gestureEnabled: false, contentStyle: { backgroundColor: 'transparent' } }} /><Stack.Screen name="limit" options={{ presentation: 'transparentModal', animation: 'none', gestureEnabled: false, contentStyle: { backgroundColor: 'transparent' } }} /><Stack.Screen name="routine" options={{ presentation: 'transparentModal', animation: 'none', gestureEnabled: false, contentStyle: { backgroundColor: 'transparent' } }} /></Stack>
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
