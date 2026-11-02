import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SheetModal } from './SheetModal';
import { T } from '@/theme/typography';
import { ruleDetailTheme as c } from '@/theme/tokens';
export function PlainSettingsSheet({ title, onClose, top = 59, statusBar = 'dark', inset = 0, bottom = 0, surface = c.surface, backdropColor = c.backdrop, backdropTop = 0, overlay, onShown, children }: { title: string; onClose: () => void; top?: number; statusBar?: 'light' | 'dark'; inset?: number; bottom?: number; surface?: string; backdropColor?: string; backdropTop?: number; overlay?: ReactNode; onShown?: () => void; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return <SheetModal onShown={onShown} onClose={onClose} backdrop={<Pressable accessibilityLabel={`Закрыть: ${title}`} onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: backdropColor, top: backdropTop }]} />}><StatusBar style={statusBar} animated /><View accessibilityViewIsModal style={{ flex: 1, marginTop: Math.max(top, insets.top), marginHorizontal: inset, marginBottom: bottom, borderRadius: 44, backgroundColor: surface, overflow: 'hidden' }}><View pointerEvents="none" style={{ position: 'absolute', top: 12, width: 63, height: 5, borderRadius: 3, alignSelf: 'center', backgroundColor: c.handle }} /><T size={20} center ls={0} style={{ position: 'absolute', top: 44, left: 20, right: 20, lineHeight: 25 }}>{title}</T>{children}</View>{overlay}</SheetModal>;
}
