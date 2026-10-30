import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, shadows } from '@/theme/tokens';

type Props = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius: number;
  tone?: 'sky' | 'template';
  intensity?: number;
};

// .glass-dark / .glass-tpl: размытие подложки + полупрозрачная заливка + внутренний ободок.
export function Glass({ children, style, radius, tone = 'sky', intensity = 12 }: Props) {
  const fill = tone === 'sky' ? colors.glassDarkFill : colors.glassTplFill;
  const rim = tone === 'sky' ? shadows.glassDark : shadows.glassTpl;
  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden' }, style]}>
      <BlurView intensity={intensity} tint="default" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: fill }]} />
      {children}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, boxShadow: rim }]} />
    </View>
  );
}
