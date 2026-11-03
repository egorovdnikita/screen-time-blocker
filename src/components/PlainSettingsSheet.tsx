import { SheetGrabber } from '@/components/SheetModal';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SheetModal, type SheetContent } from './SheetModal';
import { T } from '@/theme/typography';
import { ruleDetailTheme as c, modalTheme } from '@/theme/tokens';
export function PlainSettingsSheet({ title, onClose, top = 59, statusBar, inset = 0, bottom = 0, surface = c.surface, backdropColor = modalTheme.dim, backdropTop = 0, overlay, onShown, animateClose = true, swipeEnabled = true, children }: { title: string; onClose: () => void; top?: number; statusBar?: 'light' | 'dark'; inset?: number; bottom?: number; surface?: string; backdropColor?: string; backdropTop?: number; overlay?: ReactNode; onShown?: () => void; animateClose?: boolean; swipeEnabled?: boolean; children: SheetContent }) {
  const insets = useSafeAreaInsets();
  return <SheetModal nativeOffset={top <= 80 && inset === 0 && bottom === 0 ? Math.max(top, insets.top) : undefined} nativeSurface={surface} swipeEnabled={swipeEnabled} overlay={overlay} animateClose={animateClose} onShown={onShown} onClose={onClose} backdrop={close => <Pressable accessibilityLabel={`Закрыть: ${title}`} onPress={() => close()} style={[StyleSheet.absoluteFill, { backgroundColor: backdropColor, top: backdropTop }]} />}>{close => <>{statusBar && <StatusBar style={statusBar} animated />}<View accessibilityViewIsModal style={{ flex: 1, marginTop: Math.max(top, insets.top), marginHorizontal: inset, marginBottom: bottom, borderRadius: 44, backgroundColor: surface, overflow: 'hidden' }}><SheetGrabber style={{ position: 'absolute', top: 12, width: 63, height: 5, borderRadius: 3, alignSelf: 'center', backgroundColor: c.handle }} /><T size={20} center ls={0} style={{ position: 'absolute', top: 44, left: 20, right: 20, lineHeight: 25 }}>{title}</T>{typeof children === 'function' ? children(close) : children}</View></>}</SheetModal>;
}
