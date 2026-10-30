import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { T, TRACK_SMALL } from '@/theme/typography';
import { colors } from '@/theme/tokens';

type Props = {
  hourly: number[];
  currentHour: number;
  upcomingHours: number[];
};

// Координаты — от верхнего левого угла карточки, как в макете (карточка 353×261).
const GRID_LEFT = 15.667;
const AXIS_W = 50.667;
const TOP = 100;
const PLOT_H = 84;
const BAR_W = 8;
const BAR_INSET = 1.9;
const TICKS = [0, 6, 12, 18];

const hh = (h: number) => `${String(h).padStart(2, '0')}:00`;

export function UsageChart({ hourly, currentHour, upcomingHours }: Props) {
  const [w, setW] = useState(0);
  const gridW = Math.max(0, w - GRID_LEFT - AXIS_W);
  const slot = gridW / 24;
  const barX = (h: number) => GRID_LEFT + h * slot + BAR_INSET;
  const barH = (m: number) => Math.min(1, m / 60) * PLOT_H;
  const nowH = barH(hourly[currentHour] ?? 0);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && (
        <>
          {[0, 42, 84].map((y) => (
            <View key={y} style={[styles.grid, { top: TOP + y - 0.333, width: gridW }]} />
          ))}
          {TICKS.map((h) => (
            <View key={h} style={[styles.tick, { left: GRID_LEFT + h * slot + 0.167 }]} />
          ))}
          {upcomingHours.map((h) => (
            <View key={h} style={[styles.bar, { left: barX(h), top: TOP + 0.333, height: PLOT_H, backgroundColor: colors.barFuture }]} />
          ))}
          {hourly.map((m, h) =>
            m > 0 ? (
              <View key={h} style={[styles.bar, { left: barX(h), top: TOP + PLOT_H - barH(m), height: barH(m), backgroundColor: colors.bar }]} />
            ) : null,
          )}

          <View style={[styles.axisY, { left: GRID_LEFT + gridW + 3.67, top: TOP - 5.67 }]}>
            <T size={10} weight={500} color={colors.chartLabel}>1ч</T>
          </View>
          <View style={[styles.axisY, { left: GRID_LEFT + gridW + 3.67, top: TOP + 36.33 }]}>
            <T size={10} weight={500} color={colors.chartLabel}>30мин</T>
          </View>
          <View style={[styles.axisY, { left: GRID_LEFT + gridW + 3.67, top: TOP + 78.67 }]}>
            <T size={9.75} weight={500} color={colors.chartLabel}>0с</T>
          </View>
          {TICKS.map((h) => (
            <View key={h} style={[styles.axisX, { left: GRID_LEFT + h * slot + 4.33 }]}>
              <T size={9.75} weight={500} ls={TRACK_SMALL} color={colors.chartLabel}>{hh(h)}</T>
            </View>
          ))}

          {/* Пузырь с иконкой приложения над текущим часом */}
          <View style={[styles.bubble, { left: barX(currentHour) + BAR_W / 2 - 25.7, top: TOP + PLOT_H - nowH - 66.8 }]}>
            <View style={styles.tail} />
            <View style={styles.disc}>
              <Icon name="ogonek-app-icon" width={41.7} />
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { position: 'absolute', left: GRID_LEFT, height: 0.667, backgroundColor: colors.grid },
  tick: { position: 'absolute', top: TOP + PLOT_H, width: 0.667, height: 15.667, backgroundColor: colors.tick },
  bar: { position: 'absolute', width: BAR_W, borderRadius: 3 },
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
    top: 50,
    width: 11,
    height: 11,
    borderRadius: 2,
    backgroundColor: colors.white,
    transform: [{ rotate: '45deg' }],
  },
});
