import { BlurView } from 'expo-blur';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { rulesVariants } from '@/data/rules';
import { useAppState } from '@/state/app';
import { T, TRACK_SMALL } from '@/theme/typography';
import { colors, shadows } from '@/theme/tokens';

import { Icon, type IconName } from './Icon';

type TabSpec = {
  label: string;
  icon: IconName;
  iconActive: IconName;
  w: number;
  h: number;
};

const TABS: Record<string, TabSpec> = {
  index: { label: 'Главная', icon: 'tab-home-outline', iconActive: 'tab-home', w: 22, h: 23 },
  rules: { label: 'Правила', icon: 'tab-lock-badge-outline', iconActive: 'tab-lock-badge', w: 21, h: 24 },
  overview: { label: 'Обзор', icon: 'hands-clap', iconActive: 'hands-clap', w: 25, h: 24 },
  profile: { label: 'Профиль', icon: 'tab-person', iconActive: 'tab-person-fill', w: 22, h: 23 },
};

export const TAB_BAR_HEIGHT = 62;
export const TAB_BAR_SIDE = 21;
const PAD = 4;
const PILL_W = 95.667;
const PILL_H = 53.833;

// Замок на вкладке «Правила» показывает число активных правил (иконки из макетов).
const LOCK_ACTIVE: Record<number, IconName> = { 0: 'tab-lock', 1: 'tab-lock-one', 2: 'tab-lock-two', 3: 'tab-lock-badge' };
const LOCK_IDLE: Record<number, IconName> = { 0: 'tab-lock', 1: 'tab-lock', 2: 'tab-lock-badge-2', 3: 'tab-lock-badge-3' };

export function TabBar({ state, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const app = useAppState();
  const active = Math.min(3, rulesVariants[app.rulesVariant].active);
  const [width, setWidth] = useState(0);
  const count = state.routes.length;
  const step = width > 0 ? (width - PAD * 2 - PILL_W) / (count - 1) : 0;

  const x = useRef(new Animated.Value(state.index)).current;
  useEffect(() => {
    Animated.spring(x, { toValue: state.index, useNativeDriver: true, bounciness: 6, speed: 16 }).start();
  }, [state.index, x]);

  const onHome = state.routes[state.index]?.name === 'index';
  const bottom = insets.bottom > 0 ? TAB_BAR_SIDE : 12;

  return (
    <View
      style={[styles.root, { bottom }]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <View style={styles.clip}>
        <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: onHome ? colors.tabbarHome : colors.tabbar }]} />
        {width > 0 && (
          <Animated.View
            style={[
              styles.pill,
              {
                transform: [
                  {
                    translateX: x.interpolate({
                      inputRange: [0, count - 1],
                      outputRange: [0, step * (count - 1)],
                    }),
                  },
                ],
              },
            ]}
          />
        )}
        {width > 0 &&
          state.routes.map((route, i) => {
            const spec = TABS[route.name];
            if (!spec) return null;
            const focused = state.index === i;
            const onPress = () => {
              const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigateToTab(route.key);
            };
            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={spec.label}
                style={[styles.item, { left: PAD + i * step }]}
              >
                <View style={styles.iconBox}>
                  <Icon
                    name={route.name === 'rules' ? (focused ? LOCK_ACTIVE : LOCK_IDLE)[active] : focused ? spec.iconActive : spec.icon}
                    width={spec.w}
                    height={spec.h}
                    color={colors.tabInk}
                  />
                </View>
                <T size={10.25} weight={focused ? 600 : 500} ls={TRACK_SMALL} color={colors.tabInk}>
                  {spec.label}
                </T>
              </Pressable>
            );
          })}
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.rim]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: TAB_BAR_SIDE,
    right: TAB_BAR_SIDE,
    height: TAB_BAR_HEIGHT,
    borderRadius: 999,
    boxShadow: shadows.tabbar,
  },
  clip: { flex: 1, borderRadius: 999, overflow: 'hidden' },
  rim: { borderRadius: 999, boxShadow: shadows.tabbarRim },
  pill: {
    position: 'absolute',
    left: PAD,
    top: PAD,
    width: PILL_W,
    height: PILL_H,
    borderRadius: 999,
    backgroundColor: colors.tabSelected,
  },
  item: {
    position: 'absolute',
    top: PAD,
    width: PILL_W,
    height: PILL_H,
    alignItems: 'center',
    paddingTop: 8,
  },
  iconBox: { height: 24, justifyContent: 'flex-end', marginBottom: 3 },
});
