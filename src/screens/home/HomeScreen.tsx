import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { BottomChrome, useBottomSpace } from '@/components/BottomChrome';
import { Glass } from '@/components/Glass';
import { Icon } from '@/components/Icon';
import { RoundButton } from '@/components/RoundButton';
import { useSkyStatusBar } from '@/components/useStatusBar';
import { art } from '@/data/art';
import { mostUsed, today, type MostUsedApp } from '@/data/mock';
import { T, TRACK_SMALL } from '@/theme/typography';
import { colors, radii, shadows } from '@/theme/tokens';

import { UsageChart } from './UsageChart';

const SKY_RATIO = 2556 / 1179;

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const onScroll = useSkyStatusBar();
  const bottomSpace = useBottomSpace(true);
  const top = Math.max(insets.top, 20);

  return (
    <View style={styles.root}>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={32}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomSpace }}
      >
        <Image source={art.homeSky} style={[styles.sky, { width, height: width * SKY_RATIO }]} contentFit="cover" />

        {/* Шапка */}
        <View style={[styles.header, { marginTop: top + 15 }]}>
          <Icon name="block-wordmark" width={98.572} height={27.666} color={colors.wordmark} style={{ marginLeft: -5.8 }} />
          <Pressable style={styles.today} accessibilityRole="button">
            <T size={14.25} color={colors.white} onSky>
              Сегодня
            </T>
            <Icon name="chevron-down" width={13} height={8} color={colors.white} style={{ marginLeft: 3.5, marginTop: 1 }} />
          </Pressable>
          <View style={styles.headerButtons}>
            <RoundButton variant="glass" icon="arrow-clockwise" iconWidth={19} iconHeight={23} accessibilityLabel="Обновить" />
            <RoundButton variant="glass" icon="ellipsis" iconWidth={20} iconHeight={7} accessibilityLabel="Ещё" />
          </View>
        </View>

        {/* Экранное время */}
        <View style={styles.hero}>
          <T size={17.25} color={colors.white} onSky>
            Экранное время
          </T>
          <T size={74.25} ls={-2} color={colors.white} onSky style={styles.num}>
            {today.screenTime}
          </T>
          <Glass radius={radii.pill} style={styles.goal}>
            <LinearGradient
              colors={[colors.goalGreen, colors.goalGreen, 'rgba(0, 195, 80, 0)']}
              locations={[0, 0.55, 1]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.goalFill}
            />
            <Icon name="goal-target" width={13.5} color={colors.white} style={{ marginRight: 3.5 }} />
            <T size={17.25} color={colors.white} onSky>
              {today.goal}
            </T>
          </Glass>
          <View style={styles.dots}>
            <View style={[styles.dot, { backgroundColor: colors.white }]} />
            <View style={[styles.dot, { backgroundColor: '#8abaff' }]} />
          </View>
        </View>

        {/* Карточка статистики */}
        <View style={styles.card}>
          <View style={styles.stats}>
            <Stat label="Экономия" value={today.saved} decrease />
            <View style={styles.sep} />
            <Stat label="Поднятия" value={String(today.pickups)} />
            <View style={styles.sep} />
            <Stat label="Уведомления" value={String(today.notifications)} />
          </View>
          <UsageChart hourly={today.hourly} currentHour={today.currentHour} upcomingHours={today.upcomingHours} />
          <Icon name="chevron-compact-down" width={21} height={9} color={colors.chevronCompact} style={styles.cardChevron} />
        </View>

        {/* Чаще всего */}
        <View style={styles.muHeader}>
          <T size={20} color={colors.sectionLight}>
            Чаще всего
          </T>
          <Pressable style={styles.muPill} accessibilityRole="button">
            <Icon name="updown" width={12} height={14.5} color={colors.black} style={{ marginRight: 3.4 }} />
            <T size={14.25}>Приложения</T>
          </Pressable>
        </View>
        {mostUsed.map((app) => (
          <MostUsedRow key={app.id} app={app} max={mostUsed[0].minutes} />
        ))}
      </ScrollView>

      <BottomChrome start="home" />
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

function AppIcon({ icon }: { icon: MostUsedApp['icon'] }) {
  switch (icon) {
    case 'block':
      return <Icon name="ogonek-app-icon" width={28} />;
    case 'photos':
      return <Image source={art.appPhotos} style={{ width: 32, height: 34, margin: -2, marginTop: -3 }} />;
    case 'phia':
      return <Image source={art.appPhia} style={{ width: 32, height: 32, margin: -2 }} />;
    case 'other':
      return (
        <View style={styles.otherIcon}>
          <Icon name="archive" width={17.5} height={16} color={colors.otherIco} />
        </View>
      );
  }
}

function MostUsedRow({ app, max }: { app: MostUsedApp; max: number }) {
  const isOther = app.icon === 'other';
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <AppIcon icon={app.icon} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.rowTop}>
          <T size={15}>{app.name}</T>
          <T size={14.25} weight={400}>
            {app.minutes} мин
          </T>
        </View>
        {isOther ? (
          <View style={styles.otherApps}>
            <Image source={art.appsOther} style={{ width: 45, height: 24 }} />
            <T size={12} ls={TRACK_SMALL} color={colors.plusMore} style={{ marginLeft: 2 }}>
              +1
            </T>
          </View>
        ) : (
          <>
            <View style={styles.barTrack}>
              <View style={[styles.bar, { width: `${Math.max(3.2, (app.minutes / max) * 100)}%` }]} />
            </View>
            <Pressable style={styles.chip} accessibilityRole="button">
              <Icon name="plus-chip" width={13} height={12} color={colors.chipInk} style={{ marginRight: 3.2 }} />
              <T size={12.25} weight={600} ls={TRACK_SMALL} color={colors.chipInk}>
                Время с пользой?
              </T>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  sky: { position: 'absolute', left: 0, top: 0 },
  header: { height: 44, flexDirection: 'row', alignItems: 'center', paddingLeft: 20, paddingRight: 20 },
  today: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  headerButtons: { marginLeft: 'auto', flexDirection: 'row', gap: 6.7 },
  hero: { alignItems: 'center', marginTop: 63 },
  num: { marginTop: -2, lineHeight: 89, height: 89 },
  goal: {
    width: 188.5,
    height: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 9,
  },
  goalFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 30,
  },
  dots: { flexDirection: 'row', gap: 3.67, marginTop: 20.6 },
  dot: { width: 6.167, height: 6.167, borderRadius: 3.1 },
  card: {
    marginTop: 60.6,
    marginHorizontal: 20,
    height: 261.333,
    borderRadius: radii.card,
    backgroundColor: colors.card,
    boxShadow: shadows.card,
  },
  stats: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 28 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { flexDirection: 'row', alignItems: 'center', marginTop: 1.5 },
  sep: { width: 1.5, height: 16.5, borderRadius: 1, backgroundColor: colors.separator, marginTop: 23.6 },
  cardChevron: { position: 'absolute', top: 232, alignSelf: 'center' },
  muHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 39.8,
    marginBottom: 24,
  },
  muPill: {
    height: 33.167,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 13.2,
    paddingRight: 13.6,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    boxShadow: shadows.pillSoft,
  },
  row: { flexDirection: 'row', paddingLeft: 20, paddingRight: 20.5, height: 90.5 },
  rowIcon: { width: 28, height: 28, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  barTrack: { marginTop: 6, height: 6, marginRight: -0.5 },
  bar: { height: 6, borderRadius: 3, backgroundColor: colors.muBar },
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    height: 21.833,
    paddingLeft: 7.667,
    paddingRight: 9,
    marginTop: 8.2,
    borderRadius: radii.pill,
    backgroundColor: colors.chip,
  },
  otherIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.otherBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otherApps: { flexDirection: 'row', alignItems: 'center', marginTop: 5, marginLeft: 2 },
});
