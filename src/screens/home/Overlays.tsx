import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated, Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { PressScale, usePresence } from '@/components/motion';
import { art } from '@/data/art';
import { insights, periodOptions } from '@/data/home';
import type { PeriodId } from '@/state/app';
import { T } from '@/theme/typography';
import { colors, gradients, shadows } from '@/theme/tokens';

export type Anchor = { x: number; y: number; width: number; height: number };

const SYSTEM = { fontFamily: undefined as string | undefined };

// ——— Выбор периода (30-changing-period__01) ———

export function PeriodMenu({
  visible,
  anchor,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  anchor: Anchor | null;
  value: PeriodId;
  onSelect: (p: PeriodId) => void;
  onClose: () => void;
}) {
  const { width } = useWindowDimensions();
  const { mounted, progress } = usePresence(visible);
  if (!mounted || !anchor) return null;
  const W = 288;
  const left = Math.round((width - W) / 2);
  const top = anchor.y + anchor.height + 22.7;
  const tipX = anchor.x + anchor.width / 2 - left - 14;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.periodDim, opacity: progress }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Закрыть" />
      </Animated.View>
      <Animated.View
        style={[
          styles.period,
          {
            left,
            top,
            width: W,
            opacity: progress,
            transformOrigin: `${tipX + 14}px 0px`,
            transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
          },
        ]}
      >
        <View style={[styles.tip, { left: tipX }]}>
          <Icon name="period-tip" width={28} height={16} color={colors.white} />
        </View>
        <View style={styles.segment}>
          <View style={[styles.segmentItem, styles.segmentOn]}>
            <T size={14} ls={0} style={SYSTEM}>День</T>
          </View>
          <View style={styles.segmentItem}>
            <T size={14} ls={0} style={SYSTEM}>Неделя</T>
          </View>
        </View>
        {periodOptions.map((o, i) => {
          const selected = o.id === value;
          return (
            <Pressable
              key={o.id}
              onPress={() => onSelect(o.id)}
              style={({ pressed }) => [
                styles.option,
                i === 0 && { marginTop: 15 },
                selected && styles.optionSelected,
                pressed && !selected && { backgroundColor: colors.periodSegment },
              ]}
            >
              <T size={15} weight={400} ls={0} color={selected ? colors.bar : colors.text} style={SYSTEM}>
                {o.label}
              </T>
              {selected && <Icon name="period-check" width={15} color={colors.bar} style={{ marginLeft: 9 }} />}
            </Pressable>
          );
        })}
      </Animated.View>
    </Modal>
  );
}

// ——— Меню «Чаще всего» (26-switching-to-activities__01) ———

export function MostUsedMenu({
  visible,
  anchor,
  onSelect,
  onClose,
}: {
  visible: boolean;
  anchor: Anchor | null;
  onSelect: (m: 'apps' | 'activities') => void;
  onClose: () => void;
}) {
  const { width } = useWindowDimensions();
  const { mounted, progress } = usePresence(visible);
  if (!mounted || !anchor) return null;
  const W = 250;
  const right = width - (anchor.x + anchor.width);

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Закрыть" />
      <Animated.View
        style={[
          styles.menu,
          {
            right,
            top: anchor.y + 0.8,
            width: W,
            opacity: progress,
            transformOrigin: 'top right',
            transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
          },
        ]}
      >
        {(['apps', 'activities'] as const).map((m) => (
          <Pressable key={m} onPress={() => onSelect(m)} style={styles.menuRow}>
            {({ pressed }) => (
              <>
                {pressed && (
                  <LinearGradient
                    colors={gradients.menuRefraction.colors}
                    locations={gradients.menuRefraction.locations}
                    style={styles.menuHighlight}
                  />
                )}
                <Icon
                  name={m === 'apps' ? 'menu-apps' : 'menu-activities'}
                  width={m === 'apps' ? 20 : 22}
                  color={colors.menuInk}
                  style={{ position: 'absolute', left: m === 'apps' ? 30 : 29 }}
                />
                <T size={17} weight={400} ls={0} color={colors.menuInk} style={SYSTEM}>
                  {m === 'apps' ? 'Приложения' : 'Активности'}
                </T>
              </>
            )}
          </Pressable>
        ))}
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: 34, boxShadow: shadows.contextMenuRim }]} />
      </Animated.View>
    </Modal>
  );
}

// ——— Подсказки по графику (25-information) ———

export function InsightSheet({ kind, onClose }: { kind: 'glued' | 'offline' | null; onClose: () => void }) {
  const { mounted, progress } = usePresence(kind !== null);
  const insets = useSafeAreaInsets();
  if (!mounted) return null;
  const k = kind ?? 'glued';
  const copy = insights[k];

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.6)', opacity: progress }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Закрыть" />
      </Animated.View>
      <View pointerEvents="box-none" style={[styles.sheetWrap, { paddingTop: insets.top }]}>
        <Animated.View
          style={[
            styles.sheet,
            {
              opacity: progress,
              transform: [
                { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) },
                { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
              ],
            },
          ]}
        >
          {k === 'glued' ? (
            <Icon name="ogonek-focused" width={65} height={90} style={{ alignSelf: 'center', marginTop: 39 }} />
          ) : (
            <View style={{ alignSelf: 'center', width: 134, height: 82, marginTop: 39 }}>
              <Image source={art.propMountain} style={{ position: 'absolute', width: 134, height: 80 }} />
              <Icon name="ogonek-resting" width={58} height={60} style={{ position: 'absolute', left: 38, top: 0 }} />
            </View>
          )}
          <T size={29} ls={0} center style={{ lineHeight: 33.333, marginTop: k === 'glued' ? 18.3 : 26, paddingHorizontal: 25 }}>
            {copy.title}
          </T>
          {k === 'glued' && <Icon name="ogonek-app-icon" width={34} style={{ alignSelf: 'center', marginTop: 21 }} />}
          <T size={15.25} weight={400} center style={{ lineHeight: 20, marginTop: k === 'glued' ? 20.3 : 19.7, paddingHorizontal: 32 }}>
            <T size={15.25}>Подумайте: </T>
            {copy.hint}
          </T>
          <PressScale onPress={onClose} style={styles.sheetButton}>
            <T size={17.25}>Понятно</T>
          </PressScale>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ——— Новое начало (03-creating-an-account__09) ———

export function NewStart({ onClose }: { onClose: () => void }) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Image source={art.newStartBackground} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={styles.newStart}>
        <View style={{ width: 146, height: 153, marginLeft: 26 }}>
          <Icon name="ogonek-resting" width={126} height={144} />
          <Image source={art.propWatch} style={{ position: 'absolute', left: 84, top: 26, width: 58, height: 78 }} />
        </View>
        <T size={23.5} center style={{ marginTop: 19.7 }}>
          Новое начало
        </T>
        <T size={15.25} weight={400} center style={{ lineHeight: 18.333, marginTop: 8 }}>
          {'Block поможет начать заново.\nОставьте прошлое позади. Следите\nза экранным временем, замечайте\nсвои привычки и постепенно\nсокращайте время у экрана.'}
        </T>
        <PressScale onPress={onClose} style={styles.newStartButton}>
          <T size={15.25} color={colors.white}>
            Понятно
          </T>
        </PressScale>
      </View>
    </View>
  );
}

// ——— Загрузка (31-refreshing__01, 81-logging-in__08) ———

export function LoadingScene() {
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: 140, height: 95, marginLeft: 14 }}>
        <Icon name="ogonek-scene" width={78} height={87} style={{ position: 'absolute', left: 0, top: 1 }} />
        <Icon name="ogonek-scene-green" width={53} height={55} style={{ position: 'absolute', left: 79, top: 44 }} />
        <Image source={art.propNet} style={{ position: 'absolute', left: 44, top: 3, width: 45, height: 60 }} />
      </View>
      <T size={17.25} center style={{ marginTop: 21 }}>
        Загрузка…
      </T>
      <T size={15.25} weight={400} center style={{ lineHeight: 18.333, marginTop: 8 }}>
        {'Пока ничего? Сначала нужно немного\nпопользоваться приложениями.'}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  period: {
    position: 'absolute',
    height: 183,
    borderRadius: 34,
    backgroundColor: colors.white,
    padding: 16,
  },
  tip: { position: 'absolute', top: -14 },
  segment: {
    flexDirection: 'row',
    height: 34,
    borderRadius: 18,
    backgroundColor: colors.periodSegment,
    padding: 4,
  },
  segmentItem: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  segmentOn: { backgroundColor: colors.white, boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)' },
  option: { height: 38, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  optionSelected: { height: 33, backgroundColor: colors.periodSelected, marginBottom: 2.5 },
  menu: {
    position: 'absolute',
    borderRadius: 34,
    backgroundColor: colors.contextMenu,
    boxShadow: shadows.contextMenu,
    paddingVertical: 9,
    overflow: 'hidden',
  },
  menuRow: { height: 42, justifyContent: 'center', paddingLeft: 64 },
  menuHighlight: { position: 'absolute', left: 15, right: 15, top: 7, height: 28, borderRadius: 9 },
  sheetWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 60 },
  sheet: {
    borderRadius: 34,
    backgroundColor: colors.bgPage,
    boxShadow: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.5)',
    paddingBottom: 19.3,
  },
  sheetButton: {
    marginTop: 26,
    marginHorizontal: 20,
    height: 60,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    boxShadow: '0px 10px 30px rgba(30, 45, 60, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newStart: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
  newStartButton: {
    marginTop: 26,
    height: 41,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: colors.seeMore,
    boxShadow: '0px 10px 30px rgba(20, 30, 40, 0.08)',
    justifyContent: 'center',
  },
});
