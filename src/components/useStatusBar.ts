import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, type RefObject } from 'react';
import { Platform, StatusBar, type NativeScrollEvent, type NativeSyntheticEvent, type StatusBarStyle } from 'react-native';

// Маршрут хранит отдельную запись стека: закрытие Modal восстанавливает его цвет,
// а прокрутка под модальным окном не перезаписывает стиль верхнего слоя.
function useFocusedStatusBar(style: RefObject<StatusBarStyle>) {
  const entry = useRef<ReturnType<typeof StatusBar.pushStackEntry> | null>(null);
  const restore = useCallback(() => {
    if (Platform.OS !== 'web' && entry.current) entry.current = StatusBar.replaceStackEntry(entry.current, { barStyle: style.current, animated: true });
  }, [style]);
  useFocusEffect(useCallback(() => {
    if (Platform.OS === 'web') return;
    entry.current = StatusBar.pushStackEntry({ barStyle: style.current, animated: true });
    return () => { if (entry.current) StatusBar.popStackEntry(entry.current); entry.current = null; };
  }, [style]));
  return restore;
}

// Светлый статус-бар над небом, тёмный после прокрутки на 260–300px.
export function useSkyStatusBar(threshold = 280) {
  const style = useRef<StatusBarStyle>('light-content');
  const restore = useFocusedStatusBar(style);
  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = event.nativeEvent.contentOffset.y > threshold ? 'dark-content' : 'light-content';
    if (next !== style.current) { style.current = next; restore(); }
  }, [threshold, restore]);
  return { onScroll, restore };
}
export function useDarkStatusBar() {
  const style = useRef<StatusBarStyle>('dark-content');
  useFocusedStatusBar(style);
}
