import { Image } from 'expo-image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';

import { Icon } from '@/components/Icon';
import { PopIn, spring } from '@/components/motion';
import { art } from '@/data/art';
import type { BarTone, ChartData } from '@/data/home';
import { T, TRACK_SMALL } from '@/theme/typography';
import { colors } from '@/theme/tokens';

type Props = {
  data: ChartData;
  /** Тап по часу: есть активность — glued, пусто — offline. */
  onInsight?: (kind: 'glued' | 'offline') => void;
};

// Координаты — от верхнего левого угла карточки, как в макете (карточка 353×261).
const GRID_LEFT = 15.667;
const AXIS_W = 50.667;
const TOP = 100;
const PLOT_H = 84;
const BAR_W = 8;
const BAR_INSET = 1.9;
const BUBBLE_LIFT = 66.7;
const TICKS = [0, 6, 12, 18];

const barColor: Record<BarTone, string> = {
  now: colors.bar,
  q: colors.barQ,
  productive: colors.qProductive,
  neutral: colors.qNeutral,
};

const hh = (h: number) => `${String(h).padStart(2, '0')}:00`;

export function UsageChart({ data, onInsight }: Props) {
  const [w, setW] = useState(0);
  const gridW = Math.max(0, w - GRID_LEFT - AXIS_W);
  const slot = gridW / 24;
  const barX = (h: number) => GRID_LEFT + h * slot + BAR_INSET;

  // Столбики одного часа складываются стопкой снизу вверх.
  const stacked = useMemo(() => {
    const acc: Record<number, number> = {};
    return data.bars.map((b) => {
      const below = acc[b.h] ?? 0;
      acc[b.h] = below + b.v;
      return { ...b, below };
    });
  }, [data.bars]);
  const totalAt = (h: number) => stacked.filter((b) => b.h === h).reduce((s, b) => s + b.v, 0);

  // Рост столбиков при смене данных.
  const grow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    grow.setValue(0);
    spring(grow, 1);
  }, [data, grow]);

  const onPlotPress = (e: GestureResponderEvent) => {
    if (!onInsight || slot === 0) return;
    const h = Math.floor((e.nativeEvent.locationX - 0) / slot);
    onInsight(totalAt(h) > 0 || data.bubbles?.some((b) => b.h === h) ? 'glued' : 'offline');
  };

  const trackColor = data.tracks.tone === 'future' ? colors.barFuture : colors.qChartTrack;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none" onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && (
        <>
          {[0, 42, 84].map((y) => (
            <View key={y} pointerEvents="none" style={[styles.grid, { top: TOP + y - 0.333, width: gridW }]} />
          ))}
          {TICKS.map((h) => (
            <View key={h} pointerEvents="none" style={[styles.tick, { left: GRID_LEFT + h * slot + 0.167 }]} />
          ))}

          {data.tracks.hours.map((h) => (
            <View
              key={`t${h}`}
              pointerEvents="none"
              style={[
                styles.bar,
                {
                  left: barX(h),
                  top: TOP + 0.333,
                  height: PLOT_H,
                  backgroundColor: data.highlights?.includes(h) ? colors.activityHighlight : trackColor,
                },
              ]}
            />
          ))}
          {data.highlights
            ?.filter((h) => !data.tracks.hours.includes(h))
            .map((h) => (
              <View
                key={`hl${h}`}
                pointerEvents="none"
                style={[styles.bar, { left: barX(h), top: TOP + 0.333, height: PLOT_H, backgroundColor: colors.activityHighlight }]}
              />
            ))}

          {stacked.map((b, i) => {
            const height = Math.max(1, b.v * PLOT_H);
            return (
              <Animated.View
                key={`b${i}`}
                pointerEvents="none"
                style={[
                  styles.bar,
                  {
                    left: barX(b.h),
                    top: TOP + PLOT_H - b.below * PLOT_H - height,
                    height,
                    borderRadius: b.tone === 'now' ? 3 : 2.5,
                    backgroundColor: barColor[b.tone],
                    transformOrigin: 'bottom',
                    transform: [{ scaleY: grow }],
                  },
                ]}
              />
            );
          })}

          {/* Зона тапа по часам */}
          <Pressable style={[styles.hit, { left: GRID_LEFT, width: gridW }]} onPress={onPlotPress} accessibilityLabel="График по часам" />

          <View pointerEvents="none" style={[styles.axisY, { left: GRID_LEFT + gridW + 3.67, top: TOP - 5.67 }]}>
            <T size={10} weight={500} color={colors.chartLabel}>{data.axis[0]}</T>
          </View>
          <View pointerEvents="none" style={[styles.axisY, { left: GRID_LEFT + gridW + 3.67, top: TOP + 36.33 }]}>
            <T size={10} weight={500} color={colors.chartLabel}>{data.axis[1]}</T>
          </View>
          <View pointerEvents="none" style={[styles.axisY, { left: GRID_LEFT + gridW + 3.67, top: TOP + 78.67 }]}>
            <T size={9.75} weight={500} color={colors.chartLabel}>{data.axis[2]}</T>
          </View>
          {TICKS.map((h) => (
            <View key={h} pointerEvents="none" style={[styles.axisX, { left: GRID_LEFT + h * slot + 4.33 }]}>
              <T size={9.75} weight={500} ls={TRACK_SMALL} color={colors.chartLabel}>{hh(h)}</T>
            </View>
          ))}

          {/* Пузыри над часами: приложение или отмеченная активность */}
          {data.bubbles?.map((bb, i) => {
            const top = Math.max(TOP, TOP + PLOT_H - totalAt(bb.h) * PLOT_H - BUBBLE_LIFT);
            return (
              <PopIn key={`${bb.kind}${bb.h}`} delay={180 + i * 80} style={[styles.bubble, { left: barX(bb.h) + BAR_W / 2 - 25.7, top }]}>
                <Pressable onPress={() => onInsight?.('glued')} accessibilityLabel="Подробнее о сессии">
                  <View style={styles.tail} />
                  <View style={styles.disc}>
                    {bb.kind === 'app' ? (
                      <Icon name="ogonek-app-icon" width={41.7} />
                    ) : (
                      <Image source={art.activityLeaf} style={{ width: 28, height: 29 }} />
                    )}
                  </View>
                </Pressable>
              </PopIn>
            );
          })}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { position: 'absolute', left: GRID_LEFT, height: 0.667, backgroundColor: colors.grid },
  tick: { position: 'absolute', top: TOP + PLOT_H, width: 0.667, height: 15.667, backgroundColor: colors.tick },
  bar: { position: 'absolute', width: BAR_W, borderRadius: 3 },
  hit: { position: 'absolute', top: TOP, height: PLOT_H + 16 },
  axisY: { position: 'absolute' },
  axisX: { position: 'absolute', top: TOP + PLOT_H + 4.67 },
  bubble: { position: 'absolute', width: 51.4, height: 59 },
  disc: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 51.4,
    height: 51.4,
    borderRadius: 16,
    backgroundColor: colors.white,
    boxShadow: '0px 2px 10px rgba(30, 60, 120, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tail: {
    position: 'absolute',
    left: 20.2,
    top: 46,
    width: 11,
    height: 11,
    borderRadius: 2,
    backgroundColor: colors.white,
    transform: [{ rotate: '45deg' }],
  },
});
