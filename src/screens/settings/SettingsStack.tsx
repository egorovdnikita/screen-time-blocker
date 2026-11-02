import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SheetModal } from '@/components/SheetModal';
import { settingsTheme as c, modalTheme } from '@/theme/tokens';

export function SettingsStack({ onClose, children, root = false, radius, surface, offsetTop }: { onClose: () => void; children: ReactNode; root?: boolean; radius?: number; surface?: string; offsetTop?: number }) {
  const insets = useSafeAreaInsets();
  const top = Math.max(offsetTop ?? (root ? 59.333 : 69), root ? insets.top : insets.top + 10);
  // Видим настоящий родительский экран: поддельная серая страница и его копия не нужны.
  return <SheetModal animateClose onClose={onClose} backdrop={close => <Pressable accessibilityLabel="Закрыть настройки" onPress={close} style={[StyleSheet.absoluteFill, { backgroundColor: modalTheme.dim }]} />}>
    <View accessibilityViewIsModal style={{ flex: 1, marginTop: top, borderRadius: radius ?? (root ? 34 : c.stackRadius), backgroundColor: surface ?? (root ? c.surface : c.front), overflow: 'hidden' }}>{children}<View pointerEvents="none" style={{ position: 'absolute', top: root ? 12 : 11, width: 63, height: 5, borderRadius: 3, alignSelf: 'center', backgroundColor: c.handle }} /></View>
  </SheetModal>;
}
