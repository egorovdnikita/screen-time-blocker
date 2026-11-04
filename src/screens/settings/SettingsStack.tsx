import { SheetGrabber, SheetModal, type SheetContent } from '@/components/SheetModal';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { settingsTheme as c, modalTheme } from '@/theme/tokens';
import { TextInk } from '@/theme/typography';

export function SettingsStack({ onClose, children, root = false, radius, surface, offsetTop, onShown }: { onClose: () => void; children: SheetContent; root?: boolean; radius?: number; surface?: string; offsetTop?: number; onShown?: () => void }) {
  const insets = useSafeAreaInsets();
  const top = Math.max(offsetTop ?? (root ? 59.333 : 69), root ? insets.top : insets.top + 10);
  // Видим настоящий родительский экран: поддельная серая страница и его копия не нужны.
  return <TextInk.Provider value={c.title}><SheetModal onShown={onShown} nativeOffset={top} nativeSurface={surface ?? (root ? c.surface : c.front)} animateClose onClose={onClose} backdrop={close => <Pressable accessibilityLabel="Закрыть настройки" onPress={() => close()} style={[StyleSheet.absoluteFill, { backgroundColor: modalTheme.dim }]} />}>
    {close => <View accessibilityViewIsModal style={{ flex: 1, marginTop: top, borderRadius: radius ?? (root ? 34 : c.stackRadius), backgroundColor: surface ?? (root ? c.surface : c.front), overflow: 'hidden' }}>{typeof children === 'function' ? children(close) : children}<SheetGrabber style={{ position: 'absolute', top: root ? 12 : 11, width: 63, height: 5, borderRadius: 3, alignSelf: 'center', backgroundColor: c.handle }} /></View>}
  </SheetModal></TextInk.Provider>;
}
