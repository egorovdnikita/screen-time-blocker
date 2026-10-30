import { Image, type ImageSource } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomChrome, useBottomSpace } from '@/components/BottomChrome';
import { DashedLine } from '@/components/Dashed';
import { Icon } from '@/components/Icon';
import { RoundButton } from '@/components/RoundButton';
import { useSkyStatusBar } from '@/components/useStatusBar';
import { art } from '@/data/art';
import { profile } from '@/data/mock';
import { T, TRACK_SMALL } from '@/theme/typography';
import { colors, insetBorder, radii, shadows } from '@/theme/tokens';

const SKY_RATIO = 2556 / 1179;

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const onScroll = useSkyStatusBar();
  const bottomSpace = useBottomSpace(false);
  const top = Math.max(insets.top, 20);

  return (
    <View style={styles.root}>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={32}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomSpace }}
      >
        <Image source={art.profileSky} style={[styles.sky, { width, height: width * SKY_RATIO }]} contentFit="cover" />

        <View style={[styles.header, { marginTop: top + 15 }]}>
          <T variant="display" size={29} ls={0} color={colors.white} onSky style={{ marginTop: 3 }}>
            Профиль
          </T>
          <RoundButton variant="glass" icon="ellipsis" iconWidth={20} iconHeight={7} accessibilityLabel="Ещё" />
        </View>

        <View style={styles.identity}>
          <View style={styles.avatar}>
            <T size={32} weight={800} ls={0} color={colors.avatarInk}>
              {profile.initials}
            </T>
          </View>
          <Pressable style={styles.nameRow} accessibilityRole="button" accessibilityLabel="Изменить имя">
            <T size={24} color={colors.white} onSky>
              {profile.name}
            </T>
            <Icon name="pencil" width={16.5} color={colors.pencil} style={{ marginLeft: 6, marginTop: 2 }} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.tiles}>
            <View style={[styles.tile, { backgroundColor: colors.nowBg, boxShadow: insetBorder(colors.nowBorder) }]}>
              <View style={[styles.tpill, { backgroundColor: colors.nowPill }]}>
                <T size={17} color={colors.now}>
                  Сейчас
                </T>
              </View>
              <View style={[styles.tileValue, { marginTop: 25 }]}>
                <Icon name="arrow-down-circle-fill" width={27} color={colors.now} style={{ marginLeft: -1.4, marginRight: 2 }} />
                <T size={28.5} ls={0}>
                  {profile.nowMinutes}
                </T>
              </View>
              <T size={13.75} ls={TRACK_SMALL} style={styles.tileSub}>
                {profile.nowCaption}
              </T>
            </View>
            <View style={[styles.tile, { backgroundColor: colors.white, boxShadow: insetBorder(colors.beforeBorder) }]}>
              <View style={[styles.tpill, { backgroundColor: colors.white, boxShadow: insetBorder(colors.beforePillBorder) }]}>
                <T size={17} color={colors.before}>
                  Раньше
                </T>
              </View>
              <View style={[styles.tileValue, { marginTop: 17 }]}>
                <T size={34} ls={0} color={colors.beforeNum}>
                  {profile.before}
                </T>
              </View>
              <T size={13.75} ls={TRACK_SMALL} color={colors.beforeSub} style={styles.tileSub}>
                {profile.beforeCaption}
              </T>
            </View>
          </View>

          <View style={styles.lifeRow}>
            <Icon name="laurel" width={20} height={18} color={colors.now} style={{ marginRight: 3.5 }} />
            <T size={15.25} color={colors.now}>
              {profile.lifeBack}
            </T>
          </View>

          <DashedLine style={{ marginTop: 24.6 }} />

          <View style={styles.gtiles}>
            <View style={styles.gtile}>
              <View style={styles.glabel}>
                <Icon name="cake" width={16} height={15.5} color={colors.section} style={{ marginRight: 2 }} />
                <T size={12.25} weight={600} ls={TRACK_SMALL} color={colors.section}>
                  С Block уже
                </T>
              </View>
              <T size={20} style={styles.gval}>
                {profile.daysWithBlock}
              </T>
            </View>
            <View style={styles.gtile}>
              <View style={styles.glabel}>
                <Icon name="drop" width={12.5} height={14.5} color={colors.section} style={{ marginRight: 3.5 }} />
                <T size={12.25} weight={600} ls={TRACK_SMALL} color={colors.section}>
                  Лучшая серия
                </T>
              </View>
              <T size={20} ls={0} style={styles.gval}>
                {profile.bestStreak}
              </T>
            </View>
          </View>

          <Pressable style={({ pressed }) => [styles.refresh, { opacity: pressed ? 0.7 : 1 }]} accessibilityRole="button">
            <Icon name="refresh-cycle" width={18} height={19.5} color={colors.black} style={{ marginRight: 2.833 }} />
            <T size={15.25}>Обновить</T>
          </Pressable>
        </View>

        <View style={styles.band}>
          <T size={20} color={colors.section} style={{ marginLeft: 20 }}>
            Подробнее
          </T>
          <T size={12.5} weight={500} ls={TRACK_SMALL} color={colors.written} style={{ marginLeft: 21, marginTop: 2 }}>
            От команды Block
          </T>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.articles}>
            <Article image={art.articleAttention} title={'Как вернуть\nконцентрацию\nв 2026 году'} />
            <Article image={art.articleDelete} title={'Удалить соцсети\nили просто\nзаблокировать?'} />
            <Image source={art.articleThirdEdge} style={{ width: 17, height: 221.333, marginLeft: -1 }} />
          </ScrollView>
        </View>
      </ScrollView>

      <BottomChrome />
    </View>
  );
}

function Article({ image, title }: { image: ImageSource; title: string }) {
  return (
    <Pressable style={styles.article}>
      <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={styles.artPill}>
        <Icon name="clock-fill" width={12} color={colors.white} style={{ position: 'absolute', left: 6, top: 5.25 }} />
        <T size={12.5} weight={600} color={colors.white}>
          5 мин
        </T>
      </View>
      <View style={styles.artTitle}>
        {title.split('\n').map((line) => (
          <T key={line} size={18} color={colors.white} numberOfLines={1} style={{ lineHeight: 20 }}>
            {line}
          </T>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgPage },
  sky: { position: 'absolute', left: 0, top: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: 19.333, paddingRight: 20 },
  identity: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', marginTop: 46.25, gap: 16.25, paddingRight: 32 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  card: {
    marginTop: 51.4,
    marginHorizontal: 19.667,
    paddingHorizontal: 20,
    paddingTop: 22.5,
    paddingBottom: 17.8,
    borderRadius: radii.card,
    backgroundColor: colors.white,
    boxShadow: shadows.ruleCard,
  },
  tiles: { flexDirection: 'row', gap: 11.833 },
  tile: { flex: 1, height: 149.5, borderRadius: radii.tile, paddingLeft: 19.5, paddingTop: 17.8 },
  tpill: { alignSelf: 'flex-start', height: 28, paddingHorizontal: 8.3, borderRadius: radii.pill, justifyContent: 'center' },
  tileValue: { flexDirection: 'row', alignItems: 'center' },
  tileSub: { position: 'absolute', left: 19.5, top: 113.8 },
  lifeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 19.7 },
  gtiles: { flexDirection: 'row', gap: 8.8, marginTop: 20 },
  gtile: { flex: 1, height: 62.5, borderRadius: radii.gtile, backgroundColor: colors.bgPage, alignItems: 'center', paddingTop: 8.2 },
  glabel: { flexDirection: 'row', alignItems: 'center', height: 16 },
  gval: { marginTop: 7.4 },
  refresh: {
    marginTop: 20,
    height: 45,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    boxShadow: shadows.pillSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  band: { marginTop: 42.8, backgroundColor: colors.white, paddingTop: 32, paddingBottom: 31.3 },
  articles: { paddingLeft: 20, paddingRight: 0, gap: 8.5, marginTop: 15.7 },
  article: { width: 170, height: 221.333, borderRadius: radii.art, overflow: 'hidden' },
  artPill: {
    position: 'absolute',
    left: 12.5,
    top: 12.5,
    height: 22.5,
    paddingLeft: 21.5,
    paddingRight: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.artPill,
    boxShadow: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
  },
  artTitle: { position: 'absolute', left: 12.5, right: 8, top: 148.5 },
});
