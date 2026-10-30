import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { T, TRACK_SMALL } from '@/theme/typography';
import { colors, insetBorder, radii, shadows } from '@/theme/tokens';

import { DashedBox } from './Dashed';
import { Icon } from './Icon';

// Мелкие повторяющиеся элементы экрана «Правила».

export function SectionHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 26, paddingHorizontal: 20 }}>
      <Icon name="chevron-down-section" width={11} height={8} color={colors.section} style={{ marginLeft: -0.5, marginRight: 7.5 }} />
      <T size={20} color={colors.section} style={{ flex: 1 }}>
        {title}
      </T>
      {right}
    </View>
  );
}

export function Streak({ count }: { count: number }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 23.333,
        paddingLeft: 8,
        paddingRight: 9,
        borderRadius: radii.pill,
        backgroundColor: colors.white,
        boxShadow: insetBorder(colors.streakBorder, 1),
      }}
    >
      <Icon name="flame" width={13} height={14.5} color={colors.streak} style={{ marginRight: 3 }} />
      <T size={13.5} weight={600} ls={0} color={colors.streak}>
        {count}
      </T>
    </View>
  );
}

export function RuleCard({ children, style, onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: colors.card,
          borderRadius: radii.ruleCard,
          boxShadow: shadows.ruleCard,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

// Шапка карточки правила: эмодзи, название, серия, шеврон.
export function RuleHeader({ emoji, title, streak }: { emoji: ReactNode; title: string; streak: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 33 }}>
      <View style={{ width: 27.7 }}>{emoji}</View>
      <T size={17} style={{ flex: 1 }}>
        {title}
      </T>
      <Streak count={streak} />
      <Icon name="chevron-right" width={8} height={11} color={colors.chevron} style={{ marginLeft: 9 }} />
    </View>
  );
}

export function PlusCircle({ tone = 'light' }: { tone?: 'light' | 'hint' }) {
  return (
    <View
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: tone === 'light' ? colors.plusCircle : colors.plusCircle2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name="plus" width={12} height={12} color={tone === 'light' ? colors.plusInk : colors.white} />
    </View>
  );
}

// Пунктирная подсказка «Напр., …» под карточкой.
export function HintPill({ text }: { text: string }) {
  return (
    <Pressable style={{ alignSelf: 'center', marginTop: 14.5 }}>
      <DashedBox
        radius={20.75}
        color={colors.dashHint}
        style={{ width: 297.333, height: 41.5, flexDirection: 'row', alignItems: 'center', paddingLeft: 13.5, paddingRight: 13 }}
      >
        <T size={14} weight={500} color={colors.hint} style={{ flex: 1 }} numberOfLines={1}>
          {text}
        </T>
        <PlusCircle tone="hint" />
      </DashedBox>
    </Pressable>
  );
}

export function Lock() {
  return <Icon name="lock-keyhole" width={17} height={20.5} color={colors.lockGrey} />;
}

export function AppsCount({ count }: { count: number }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 27.667,
        paddingLeft: 6.5,
        paddingRight: 7.5,
        marginLeft: 4.7,
        borderRadius: radii.pill,
        backgroundColor: colors.appsPill,
      }}
    >
      <Icon name="apps-grid" width={13.5} height={13} color={colors.black} style={{ marginRight: 1.7 }} />
      <T size={12.5} ls={0}>
        {count}
      </T>
    </View>
  );
}

export function MetaSep() {
  return <View style={{ width: 2, height: 8, borderRadius: 1, backgroundColor: colors.metaSep, marginLeft: 7.333, marginRight: 7.833 }} />;
}

// Круговой индикатор «Весь день» (stroke-dasharray 6/94 от -100°).
export function DayRing({ progress = 0.06 }: { progress?: number }) {
  const r = 6.4;
  const c = 2 * Math.PI * r;
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Circle cx={8} cy={8} r={r} fill="none" stroke={colors.ringTrack} strokeWidth={1.9} />
      <Circle
        cx={8}
        cy={8}
        r={r}
        fill="none"
        stroke={colors.accentText}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeDasharray={`${c * progress} ${c}`}
        transform="rotate(-100 8 8)"
      />
    </Svg>
  );
}

export function AllDay() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <DayRing />
      <T size={12} weight={500} ls={TRACK_SMALL} color={colors.accentText} style={{ marginLeft: 6.5 }}>
        Весь день
      </T>
    </View>
  );
}
