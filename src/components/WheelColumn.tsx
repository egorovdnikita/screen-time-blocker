import { useSheetGestureBlocker } from './SheetModal';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollView, type ViewProps } from 'react-native';

import { T } from '@/theme/typography';
import { colors, sessionPickerTheme as p } from '@/theme/tokens';

export type WheelItem = { value: number; label: string };
type Props = { muted?: string;
  label: string;
  items: readonly WheelItem[];
  value: number;
  onChange: (value: number) => void;
  width: number;
  height?: number;
  center?: number;
  rowHeight?: number;
  highlight?: boolean;
  surface?: string;
  fade?: string;
  selectedSize?: number;
  otherSize?: number;
  cyclic?: boolean;
};

// Один контрол для дней, часов, минут и AM/PM. Позиция определяется значением, а не картинкой.
export function WheelColumn({ label, items, value, onChange, width, height = p.clockHeight, center = p.clockCenter, rowHeight = p.clockRow, highlight = false, surface = colors.white, fade = p.whiteFade, selectedSize = 22, otherSize = 18, cyclic = false, muted = p.wheelMuted }: Props) {
  const padding = cyclic ? Math.min(3, items.length) : 0;
  const rows = cyclic ? [...items.slice(-padding), ...items, ...items.slice(0, padding)] : items;
  const index = Math.max(0, items.findIndex(item => item.value === value)) + padding;
  const [offset] = useState(() => new Animated.Value(index * rowHeight));
  const blockSheetGesture = useSheetGestureBlocker();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragging = useRef(false);
  const lastOffset = useRef(index * rowHeight);
  const internalIndex = useRef<number | null>(null);
  const ready = useRef(false);

  const select = (nextIndex: number, animated = true) => {
    const safe = Math.max(0, Math.min(rows.length - 1, nextIndex));
    const canonical = cyclic ? (safe - padding + items.length) % items.length + padding : safe;
    internalIndex.current = canonical;
    if (canonical !== safe) {
      // После перехода через границу возвращаемся в середину без видимого скачка.
      scroll.current?.scrollTo({ y: canonical * rowHeight, animated: false });
      offset.setValue(canonical * rowHeight);
    } else if (Math.abs(lastOffset.current - safe * rowHeight) > .2) scroll.current?.scrollTo({ y: safe * rowHeight, animated });
    if (rows[safe].value !== value) onChange(rows[safe].value);
  };
  const settle = (y: number) => {
    if (idle.current) clearTimeout(idle.current);
    select(Math.round(y / rowHeight));
  };
  const scheduleSettle = (y: number) => {
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(() => { if (!dragging.current) settle(y); }, 150);
  };

  useEffect(() => {
    if (internalIndex.current === index) { internalIndex.current = null; return; }
    const frame = requestAnimationFrame(() => {
      scroll.current?.scrollTo({ y: index * rowHeight, animated: ready.current });
      ready.current = true;
    });
    return () => cancelAnimationFrame(frame);
  }, [index, rowHeight]);
  useEffect(() => () => { if (idle.current) clearTimeout(idle.current); }, []);

  const onKeyDown: NonNullable<ViewProps['onKeyDown']> = event => {
    const key = event.nativeEvent.key;
    const next = key === 'ArrowUp' ? index + 1 : key === 'ArrowDown' ? index - 1 : key === 'Home' ? padding : key === 'End' ? padding + items.length - 1 : null;
    if (next !== null) { event.preventDefault(); select(next); }
  };
  const keyboard = Platform.OS === 'web' ? { onKeyDown } : {};
  // eslint-disable-next-line react-hooks/refs -- Animated.event регистрирует listener, который читает refs только при событии прокрутки.
  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { y: offset } } }], {
    useNativeDriver: Platform.OS !== 'web',
    listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      lastOffset.current = event.nativeEvent.contentOffset.y;
      if (!dragging.current) scheduleSettle(event.nativeEvent.contentOffset.y);
    },
  });

  return <View onStartShouldSetResponderCapture={() => { blockSheetGesture(); return false; }} onTouchStart={blockSheetGesture} {...keyboard} focusable accessible accessibilityRole="adjustable" accessibilityLabel={label}
    aria-valuemin={items[0].value} aria-valuemax={items[items.length - 1].value} aria-valuenow={value} aria-valuetext={rows[index].label}
    accessibilityValue={{ min: items[0].value, max: items[items.length - 1].value, now: value, text: rows[index].label }}
    accessibilityActions={[{ name: 'increment', label: 'Увеличить' }, { name: 'decrement', label: 'Уменьшить' }]}
    onAccessibilityAction={event => select(index + (event.nativeEvent.actionName === 'increment' ? 1 : -1))}
    style={{ width, height }}>
    {highlight && <View pointerEvents="none" style={[styles.highlight, { top: center - 16 }]} />}
    <Animated.ScrollView ref={scroll} nestedScrollEnabled showsVerticalScrollIndicator={false} bounces={false}
      snapToInterval={rowHeight} decelerationRate="fast" scrollEventThrottle={16}
      contentOffset={{ x: 0, y: index * rowHeight }}
      contentContainerStyle={{ paddingTop: center - rowHeight / 2, paddingBottom: height - center - rowHeight / 2 }}
      onScroll={onScroll} onScrollBeginDrag={() => { dragging.current = true; if (idle.current) clearTimeout(idle.current); }}
      onScrollEndDrag={event => { dragging.current = false; scheduleSettle(event.nativeEvent.contentOffset.y); }}
      onMomentumScrollEnd={event => { dragging.current = false; settle(event.nativeEvent.contentOffset.y); }}>
      {rows.map((item, i) => <Animated.View key={`${i}-${item.value}`} style={{ height: rowHeight,
        opacity: offset.interpolate({ inputRange: [(i - 3) * rowHeight, i * rowHeight, (i + 3) * rowHeight], outputRange: [.12, 1, .12], extrapolate: 'clamp' }),
        transform: [{ perspective: 500 }, { rotateX: offset.interpolate({ inputRange: [(i - 3) * rowHeight, i * rowHeight, (i + 3) * rowHeight], outputRange: ['65deg', '0deg', '-65deg'], extrapolate: 'clamp' }) }] }}>
        <Pressable accessible={false} onPress={() => select(i)} style={styles.value}>
          <T size={i === index ? selectedSize : otherSize} weight={400} color={i === index ? p.wheelInk : muted} ls={0} center style={{ lineHeight: rowHeight }}>{item.label}</T>
        </Pressable>
      </Animated.View>)}
    </Animated.ScrollView>
    <LinearGradient pointerEvents="none" colors={[surface, fade]} locations={[0, 1]} style={[styles.fade, { top: 0, height: Math.max(0, center - rowHeight * 1.15) }]} />
    <LinearGradient pointerEvents="none" colors={[fade, surface]} locations={[0, 1]} style={[styles.fade, { bottom: 0, height: Math.max(0, height - center - rowHeight * 1.15) }]} />
  </View>;
}
const styles = StyleSheet.create({
  highlight: { position: 'absolute', left: -6, right: -6, height: 32, borderRadius: 18, backgroundColor: p.wheelPill },
  value: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fade: { position: 'absolute', left: 0, right: 0 },
});
