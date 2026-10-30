import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  Pressable,
  UIManager,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

// Общие примитивы анимаций. Только встроенный Animated — работает в Expo Go без dev-сборки.

type EndCallback = (result: { finished: boolean }) => void;

const native = Platform.OS !== 'web';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const spring = (v: Animated.Value, toValue: number, cb?: EndCallback) =>
  Animated.spring(v, { toValue, useNativeDriver: native, damping: 18, stiffness: 260, mass: 0.8 }).start(cb);

export const timing = (v: Animated.Value, toValue: number, duration = 220, cb?: EndCallback) =>
  Animated.timing(v, { toValue, duration, easing: Easing.out(Easing.cubic), useNativeDriver: native }).start(cb);

/**
 * Держит компонент смонтированным, пока идёт анимация скрытия.
 * progress: 0 — скрыт, 1 — показан.
 */
export function usePresence(visible: boolean, mode: 'spring' | 'timing' = 'spring') {
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      if (mode === 'spring') spring(progress, 1);
      else timing(progress, 1);
    } else {
      timing(progress, 0, 160, ({ finished }: { finished: boolean }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, mode, progress]);

  return { mounted, progress };
}

/** Плавная перестройка раскладки (переключение списков, исключение приложения). */
export function animateLayout() {
  LayoutAnimation.configureNext({
    duration: 260,
    create: { type: 'easeInEaseOut', property: 'opacity' },
    update: { type: 'spring', springDamping: 0.85 },
    delete: { type: 'easeInEaseOut', property: 'opacity' },
  });
}

/** Появление при монтировании: fade + подъём. */
export function FadeIn({
  children,
  delay = 0,
  from = 8,
  style,
}: {
  children: ReactNode;
  delay?: number;
  from?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const t = setTimeout(() => timing(v, 1, 280), delay);
    return () => clearTimeout(t);
  }, [delay, v]);
  return (
    <Animated.View
      style={[
        style,
        { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** «Поп» при появлении — пузырьки на графике, иконки. */
export function PopIn({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const t = setTimeout(() => spring(v, 1), delay);
    return () => clearTimeout(t);
  }, [delay, v]);
  return (
    <Animated.View
      style={[style, { opacity: v, transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }]}
    >
      {children}
    </Animated.View>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Pressable со сжатием при нажатии. Стиль (в т.ч. position) применяется к самой кнопке. */
export function PressScale({
  children,
  scaleTo = 0.96,
  style,
  ...rest
}: Omit<PressableProps, 'style'> & { children: ReactNode; scaleTo?: number; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(1)).current;
  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        spring(v, scaleTo);
        rest.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        spring(v, 1);
        rest.onPressOut?.(e);
      }}
      style={[style, { transform: [{ scale: v }] }]}
    >
      {children}
    </AnimatedPressable>
  );
}
