import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { sessionTheme } from '@/theme/tokens';

// Единая заливка audit-dark-button: градиент, внутренний ободок и тень.
export function DarkButtonSurface({ radius = 32 }: { radius?: number }) {
  return <><LinearGradient pointerEvents="none" colors={sessionTheme.buttonGradient} locations={[0, .65, 1]} start={{ x: .017, y: .37 }} end={{ x: .983, y: .63 }} style={[StyleSheet.absoluteFill, { borderRadius: radius }]} /><View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, boxShadow: sessionTheme.buttonShadow }]} /></>;
}
