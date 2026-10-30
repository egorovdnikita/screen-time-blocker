import { setStatusBarStyle } from 'expo-status-bar';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

// Светлый статус-бар над небом, тёмный после того, как небо уехало (.scroll-dark, 260–300px).
export function useSkyStatusBar(threshold = 280) {
  const dark = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(dark.current ? 'dark' : 'light', true);
    }, []),
  );

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = e.nativeEvent.contentOffset.y > threshold;
      if (next !== dark.current) {
        dark.current = next;
        setStatusBarStyle(next ? 'dark' : 'light', true);
      }
    },
    [threshold],
  );

  return onScroll;
}

export function useDarkStatusBar() {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('dark', true);
    }, []),
  );
}
