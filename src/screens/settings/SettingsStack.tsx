import { StatusBar } from 'expo-status-bar';
import { Image, type ImageSource } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SheetModal } from '@/components/SheetModal';
import { art } from '@/data/art';
import { settingsTheme as c } from '@/theme/tokens';

export function SettingsStack({ onClose, children, root = false, radius, surface, offsetTop, header, headerHeight }: { onClose: () => void; children: ReactNode; root?: boolean; radius?: number; surface?: string; offsetTop?: number; header?: ImageSource; headerHeight?: number }) {
  const insets = useSafeAreaInsets();
  const top = Math.max(offsetTop ?? (root ? 59.333 : 69), root ? insets.top : insets.top + 10);
  return <SheetModal onClose={onClose} backdrop={<Pressable accessibilityLabel="Закрыть настройки" onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: c.backdrop }]}><Image source={header ?? art.settingsHeader} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: headerHeight ?? (root ? 59.333 : 69) }} contentFit="cover" /></Pressable>}>
    <StatusBar style="light" animated />
    {!root && <View pointerEvents="none" style={{ position: 'absolute', top: top - 10, left: 8, right: 8, bottom: 0, borderRadius: c.stackRadius, backgroundColor: c.back }} />}
    <View accessibilityViewIsModal style={{ flex: 1, marginTop: top, borderRadius: radius ?? (root ? 34 : c.stackRadius), backgroundColor: surface ?? (root ? c.surface : c.front), overflow: 'hidden' }}>{children}<View pointerEvents="none" style={{ position: 'absolute', top: root ? 12 : 11, width: 63, height: 5, borderRadius: 3, alignSelf: 'center', backgroundColor: c.handle }} /></View>
  </SheetModal>;
}
