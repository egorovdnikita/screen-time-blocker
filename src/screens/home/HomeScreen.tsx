import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { BottomChrome, useBottomSpace } from '@/components/BottomChrome';
import { DemoMenu } from '@/components/DemoMenu';
import { Glass } from '@/components/Glass';
import { Icon } from '@/components/Icon';
import { FadeIn, animateLayout } from '@/components/motion';
import { RoundButton } from '@/components/RoundButton';
import { useSkyStatusBar } from '@/components/useStatusBar';
import { art } from '@/data/art';
import type { Day } from '@/data/home';
import { useAppState } from '@/state/app';
import { T, TRACK_SMALL } from '@/theme/typography';
import { colors, radii, shadows } from '@/theme/tokens';

import { MostUsed } from './MostUsed';
import { InsightSheet, LoadingScene, MostUsedMenu, NewStart, PeriodMenu, type Anchor } from './Overlays';
import { UsageChart } from './UsageChart';

const SKY_RATIO = 2556 / 1179;
// От низа шапки до карточки статистики, как в макете (112.9 → 407.7).
const HERO_H = 294.8;
const CARD_H = 261.333;

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const onScroll = useSkyStatusBar();
  const bottomSpace = useBottomSpace(true);
  const top = Math.max(insets.top, 20);
  const app = useAppState();
  const { day, loading } = app;

  const [periodOpen, setPeriodOpen] = useState(false);
  const [periodAnchor, setPeriodAnchor] = useState<Anchor | null>(null);
  const periodRef = useRef<ComponentRef<typeof View>>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<Anchor | null>(null);
  const [insight, setInsight] = useState<'glued' | 'offline' | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);

  // Страница героя: 0 — экранное время, 1 — качество. Свайп плавно меняет содержимое карточки.
  const pageX = useRef(new Animated.Value(0)).current;
  const page = pageX.interpolate({ inputRange: [0, width], outputRange: [0, 1], extrapolate: 'clamp' });
  // Новый день или загрузка — пейджер пересоздаётся на первой странице, карточка должна совпасть.
  useEffect(() => {
    pageX.setValue(0);
  }, [day.id, loading, pageX]);

  const openPeriod = () =>
    periodRef.current?.measureInWindow((x, y, w, h) => {
      setPeriodAnchor({ x, y, width: w, height: h });
      setPeriodOpen(true);
    });

  // Иконка «Обновить» крутится, пока идёт загрузка.
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!loading) return;
    spin.setValue(0);
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 900, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [loading, spin]);

  return (
    <View style={styles.root}>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={32}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!app.newStartVisible}
        contentContainerStyle={{ paddingBottom: bottomSpace }}
      >
        <Image source={art.homeSky} style={[styles.sky, { width, height: width * SKY_RATIO }]} contentFit="cover" />

        <View style={[styles.header, { marginTop: top + 15 }]}>
          <Icon name="block-wordmark" width={98.572} height={27.666} color={colors.wordmark} style={{ marginLeft: -5.8 }} />
          <View style={styles.periodWrap} pointerEvents="box-none">
            <Pressable ref={periodRef} onPress={openPeriod} style={styles.period} accessibilityRole="button" accessibilityLabel="Период">
              <T size={14.25} color={colors.white} onSky>
                {day.label}
              </T>
              <Icon name="chevron-down" width={13} height={8} color={colors.white} style={{ marginLeft: 3.5, marginTop: 1 }} />
            </Pressable>
          </View>
          <View style={styles.headerButtons}>
            <Animated.View style={{ transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
              <RoundButton variant="glass" icon="arrow-clockwise" iconWidth={19} iconHeight={23} accessibilityLabel="Обновить" onPress={app.refresh} />
            </Animated.View>
            <RoundButton
              variant="glass"
              icon="ellipsis"
              iconWidth={20}
              iconHeight={7}
              accessibilityLabel="Ещё"
              onLongPress={() => setDemoOpen(true)}
            />
          </View>
        </View>

        {/* Герой */}
        <View style={{ height: HERO_H, paddingTop: 63 }}>
          {!loading && (
            <FadeIn key={day.id}>
              <Animated.ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: pageX } } }], { useNativeDriver: true })}
              >
                <ScreenTimePage day={day} width={width} />
                <QualityPage day={day} width={width} />
              </Animated.ScrollView>
              <Dots page={page} />
            </FadeIn>
          )}
        </View>

        {/* Карточка статистики */}
        <View style={styles.card}>
          {loading ? (
            <FadeIn style={styles.loading} from={4}>
              <LoadingScene />
            </FadeIn>
          ) : (
            <FadeIn key={day.id} style={StyleSheet.absoluteFill} from={4}>
              <Animated.View style={[StyleSheet.absoluteFill, { opacity: page.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>
                <Stats first={{ label: 'Экономия', value: day.stats.saved, decrease: true }} pickups={day.stats.pickups} notifications={day.stats.notifications} />
                <UsageChart data={day.chart} onInsight={setInsight} />
              </Animated.View>
              <Animated.View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { opacity: page }]}>
                <Stats first={{ label: 'Время экрана', value: day.quality.stats.screenTime }} pickups={day.quality.stats.pickups} notifications={day.quality.stats.notifications} />
                <UsageChart data={day.quality.chart} onInsight={setInsight} />
              </Animated.View>
              <Icon name="chevron-compact-down" width={21} height={9} color={colors.chevronCompact} style={styles.cardChevron} />
            </FadeIn>
          )}
        </View>

        {!loading && (
          <FadeIn key={`mu-${day.id}`} delay={60}>
            <MostUsed
              day={day}
              onOpenMenu={(a) => {
                setMenuAnchor(a);
                setMenuOpen(true);
              }}
            />
          </FadeIn>
        )}
      </ScrollView>

      {app.newStartVisible ? (
        <FadeIn style={StyleSheet.absoluteFill} from={0}>
          <NewStart onClose={app.dismissNewStart} />
        </FadeIn>
      ) : (
        <BottomChrome start="home" />
      )}

      <PeriodMenu
        visible={periodOpen}
        anchor={periodAnchor}
        value={app.period}
        onClose={() => setPeriodOpen(false)}
        onSelect={(p) => {
          setPeriodOpen(false);
          if (p !== app.period) app.setPeriod(p);
        }}
      />
      <MostUsedMenu
        visible={menuOpen}
        anchor={menuAnchor}
        onClose={() => setMenuOpen(false)}
        onSelect={(m) => {
          setMenuOpen(false);
          animateLayout();
          app.setMostUsedMode(m);
        }}
      />
      <InsightSheet kind={insight} onClose={() => setInsight(null)} />
      <DemoMenu visible={demoOpen} onClose={() => setDemoOpen(false)} />
    </View>
  );
}

function ScreenTimePage({ day, width }: { day: Day; width: number }) {
  return (
    <View style={{ width, alignItems: 'center' }}>
      <T size={17.25} color={colors.white} onSky>
        Время экрана
      </T>
      <T size={74.25} ls={-2} color={colors.white} onSky numberOfLines={1} adjustsFontSizeToFit style={styles.num}>
        {day.screenTime}
      </T>
      <Glass radius={radii.pill} style={styles.goal}>
        <LinearGradient
          colors={[colors.goalGreen, colors.goalGreen, 'rgba(0, 195, 80, 0)']}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.goalFill}
        />
        <Icon name={day.goal.kind === 'check' ? 'goal-check' : 'goal-target'} width={13.5} color={colors.white} style={{ marginRight: 3.5 }} />
        <T size={17.25} color={colors.white} onSky>
          {day.goal.text}
        </T>
      </Glass>
    </View>
  );
}

const FACES = ['face-good', 'face-neutral', 'face-bad'] as const;
const FACE_FILL = [colors.qGoodOn, colors.barQ, colors.qNeutral];

function QualityPage({ day, width }: { day: Day; width: number }) {
  const q = day.quality;
  return (
    <View style={{ width, alignItems: 'center' }}>
      <T size={17.25} color={colors.white} onSky>
        Качество
      </T>
      <T size={58.5} ls={-1.5} color={colors.white} onSky numberOfLines={1} adjustsFontSizeToFit style={styles.qWord}>
        {q.word}
      </T>
      <View style={styles.qTiles}>
        {FACES.map((f, i) => (
          <View key={f} style={{ alignItems: 'center', width: 53.8 }}>
            <View style={[styles.qTile, q.pct[i] === 100 && { backgroundColor: colors.qTileOn, boxShadow: undefined }]}>
              {q.pct[i] > 0 && q.pct[i] < 100 && (
                <View style={[styles.qFill, { height: `${q.pct[i]}%`, backgroundColor: FACE_FILL[i] }]} />
              )}
              <Icon name={f} width={20} color={colors.white} style={{ position: 'absolute', left: 4.333, top: 4 }} />
            </View>
            <T size={15.25} color={colors.white} numberOfLines={1} style={{ marginTop: 7.7 }}>
              {q.pct[i]}%
            </T>
          </View>
        ))}
      </View>
    </View>
  );
}

function Dots({ page }: { page: Animated.AnimatedInterpolation<number> }) {
  return (
    <View style={styles.dots}>
      {[0, 1].map((i) => (
        <View key={i} style={[styles.dot, { backgroundColor: colors.dotOff }]}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: 3.1, backgroundColor: colors.white, opacity: page.interpolate({ inputRange: [0, 1], outputRange: i === 0 ? [1, 0] : [0, 1] }) },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

function Stats({
  first,
  pickups,
  notifications,
}: {
  first: { label: string; value: string; decrease?: boolean };
  pickups: string;
  notifications: string;
}) {
  return (
    <View style={styles.stats} pointerEvents="none">
      <Stat label={first.label} value={first.value} decrease={first.decrease} />
      <View style={styles.sep} />
      <Stat label="Поднятия" value={pickups} />
      <View style={styles.sep} />
      <Stat label="Уведомления" value={notifications} />
    </View>
  );
}

function Stat({ label, value, decrease }: { label: string; value: string; decrease?: boolean }) {
  return (
    <View style={styles.stat}>
      <T size={12} ls={TRACK_SMALL} color={colors.textSecondary}>
        {label}
      </T>
      <View style={styles.statValue}>
        {decrease && (
          <Svg width={9.5} height={8} viewBox="0 0 9.5 8" style={{ marginRight: 4.5 }}>
            <Path fill={colors.decrease} d="M1.6 0H7.9C9.1 0 9.8 1.3 9.2 2.3L6.1 7.2C5.5 8.2 4 8.2 3.4 7.2L.3 2.3C-.3 1.3.4 0 1.6 0Z" />
          </Svg>
        )}
        <T size={20} ls={decrease ? 0.3 : 0}>
          {value}
        </T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  sky: { position: 'absolute', left: 0, top: 0 },
  header: { height: 44, flexDirection: 'row', alignItems: 'center', paddingLeft: 20, paddingRight: 20 },
  periodWrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  period: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 10 },
  headerButtons: { marginLeft: 'auto', flexDirection: 'row', gap: 6.7 },
  num: { marginTop: -2, lineHeight: 89, height: 89, maxWidth: 360 },
  goal: { height: 35, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  goalFill: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 30 },
  qWord: { marginTop: 1, lineHeight: 70, height: 70, maxWidth: 380 },
  qTiles: { flexDirection: 'row', marginTop: 0 },
  qTile: { width: 28, height: 28, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.qTile, boxShadow: `inset 0px 0px 0px 1px ${colors.qTileRim}` },
  qFill: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  dots: { flexDirection: 'row', gap: 3.67, alignSelf: 'center', marginTop: 20.6 },
  dot: { width: 6.167, height: 6.167, borderRadius: 3.1, overflow: 'hidden' },
  card: { marginHorizontal: 20, height: CARD_H, borderRadius: radii.card, backgroundColor: colors.card, boxShadow: shadows.card },
  loading: { flex: 1, justifyContent: 'center', paddingBottom: 6 },
  stats: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 28 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { flexDirection: 'row', alignItems: 'center', marginTop: 1.5 },
  sep: { width: 1.5, height: 16.5, borderRadius: 1, backgroundColor: colors.separator, marginTop: 23.6 },
  cardChevron: { position: 'absolute', top: 232, alignSelf: 'center' },
});

