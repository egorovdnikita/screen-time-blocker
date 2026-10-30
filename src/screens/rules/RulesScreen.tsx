import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomChrome, useBottomSpace } from '@/components/BottomChrome';
import { DashedBox, DashedLine } from '@/components/Dashed';
import { Glass } from '@/components/Glass';
import { Icon } from '@/components/Icon';
import { RoundButton } from '@/components/RoundButton';
import {
  AllDay,
  AppsCount,
  HintPill,
  Lock,
  MetaSep,
  PlusCircle,
  RuleCard,
  RuleHeader,
  SectionHeader,
  Streak,
} from '@/components/Rule';
import { useDarkStatusBar } from '@/components/useStatusBar';
import { art } from '@/data/art';
import { T, TRACK_SMALL, type TProps } from '@/theme/typography';
import { colors, insetBorder, radii, shadows } from '@/theme/tokens';

export function RulesScreen() {
  const insets = useSafeAreaInsets();
  useDarkStatusBar();
  const bottomSpace = useBottomSpace(true);
  const top = Math.max(insets.top, 20);

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: top + 85, paddingBottom: bottomSpace }}>
        <SectionHeader title="Блокировки" />
        <View style={styles.blocksRow}>
          <BlockCard />
          <AddBlockCard />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Сессии" />
          <RuleCard style={styles.wideCard}>
            <RuleHeader emoji={<Image source={art.emojiLaptop} style={{ width: 26, height: 27, marginLeft: -2 }} />} title="Рабочие часы" streak={1} />
            <View style={[styles.metaRow, { marginTop: 13.5 }]}>
              <View style={styles.upcoming}>
                <Icon name="upcoming" width={13.5} height={11.5} color={colors.meta} style={{ marginRight: 2.7 }} />
                <T size={12} weight={500} ls={TRACK_SMALL} color={colors.meta}>
                  Предстоит
                </T>
              </View>
              <View style={styles.metaSepTall} />
              <T size={11.75} weight={600} ls={TRACK_SMALL} color={colors.meta}>
                9:00 – 17:00
              </T>
              <View style={styles.bullet} />
              <T size={12} weight={500} ls={TRACK_SMALL} color={colors.meta}>
                По будням
              </T>
            </View>
            <View style={[styles.bottomRow, { marginTop: 18.3 }]}>
              <Lock />
              <View style={styles.sessionApps}>
                <Image source={art.appsSession} style={{ width: 45, height: 21 }} />
              </View>
            </View>
          </RuleCard>
          <HintPill text="Напр., «Блокировать с 23 до 7»" />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Лимиты" />
          <RuleCard style={[styles.wideCard, { paddingBottom: 18.3 }]}>
            <RuleHeader emoji={<Image source={art.emojiHourglass} style={{ width: 20, height: 32 }} />} title="Лимит времени" streak={1} />
            <View style={[styles.metaRow, { marginTop: 10.6 }]}>
              <View style={styles.ongoing}>
                <Icon name="ongoing" width={13} height={13} color={colors.accentIco} style={{ marginRight: 3.2 }} />
                <T size={12} weight={500} ls={TRACK_SMALL} color={colors.accentText}>
                  Идёт
                </T>
              </View>
              <MetaSep />
              <AllDay />
            </View>
            <View style={[styles.bottomRow, { marginTop: 15.7 }]}>
              <Lock />
              <AppsCount count={1} />
              <T size={17} style={{ marginLeft: 'auto' }}>
                0с / 2ч15
              </T>
            </View>
            <View style={styles.progressTrack} />
          </RuleCard>
          <HintPill text="Напр., «Блок после 15 мин в день»" />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Рутины" />
          <RuleCard style={[styles.wideCard, { paddingBottom: 8 }]}>
            <RuleHeader emoji={<Image source={art.emojiPlant} style={{ width: 21, height: 31 }} />} title="Рутина" streak={1} />
            <View style={[styles.metaRow, { marginTop: 11.3 }]}>
              <View style={styles.blockingPill}>
                <Icon name="shield-check-white" width={13.5} height={17} color={colors.white} style={{ marginRight: 2.3 }} />
                <T size={12.5} color={colors.white}>
                  Блокирует
                </T>
              </View>
              <MetaSep />
              <AllDay />
            </View>
            <Pressable style={styles.task}>
              <View style={styles.taskRing} />
              <View style={{ flex: 1, marginLeft: 6.7 }}>
                <T size={15.25}>Убрать в комнате</T>
                <T size={11.75} weight={500} ls={TRACK_SMALL} color={colors.taskSub} style={{ marginTop: 1 }}>
                  Нажмите, чтобы проверить с ИИ
                </T>
              </View>
              <View style={styles.plusTime}>
                <Icon name="plus" width={12} height={12} color={colors.taskSub} style={{ marginRight: 3.8 }} />
                <T size={11.75} ls={TRACK_SMALL} color={colors.taskSub}>
                  5 мин
                </T>
              </View>
            </Pressable>
            <DashedLine dash="5 5" style={{ marginTop: 17 }} />
            <View style={[styles.bottomRow, { marginTop: 25.3 }]}>
              <Lock />
              <AppsCount count={1} />
              <T size={24} style={{ marginLeft: 'auto' }}>
                0с
              </T>
            </View>
          </RuleCard>
          <HintPill text="Напр., «Открыть после 5000 шагов»" />
        </View>

        <Templates />
      </ScrollView>

      {/* Неподвижная шапка */}
      <LinearGradient
        pointerEvents="none"
        colors={[colors.hdrBlur, colors.hdrBlur, 'rgba(249, 249, 249, 0)']}
        locations={[0, 0.94, 1]}
        style={[styles.hdrBg, { height: top + 74 }]}
      />
      <View style={[styles.hdr, { top: top + 12.67 }]}>
        <View>
          <T variant="display" size={28.5} ls={0}>
            Правила
          </T>
          <T size={12} weight={500} ls={TRACK_SMALL} style={{ marginTop: -1.5, marginLeft: -0.3 }}>
            3 активных
          </T>
        </View>
        <View style={styles.hdrButtons}>
          <RoundButton variant="white" icon="questionmark" iconWidth={15} iconHeight={20} accessibilityLabel="Справка" />
          <RoundButton variant="white" icon="ellipsis" iconWidth={20} iconHeight={7} accessibilityLabel="Ещё" />
        </View>
      </View>

      <BottomChrome start="rules" />
    </View>
  );
}

function BlockCard() {
  return (
    <RuleCard style={styles.blockCard}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Streak count={1} />
        <Icon name="chevron-right" width={8} height={11} color={colors.chevron} style={{ marginRight: 1 }} />
      </View>
      <Image source={art.appAppleMusic} style={{ width: 52, height: 58, marginLeft: -5.2, marginTop: 10.3 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2.3 }}>
        <Icon name="shield-check" width={19} height={20} color={colors.blocking} style={{ marginRight: 5.8 }} />
        <T size={15.25} numberOfLines={1} style={{ flexShrink: 1 }}>
          Apple Music
        </T>
      </View>
      <Pressable style={styles.unlock}>
        <T size={14.25}>Открыть</T>
        <T size={10} weight={500} color={colors.unlockCount} style={{ marginLeft: 5, marginTop: 2 }}>
          (3/3)
        </T>
      </Pressable>
    </RuleCard>
  );
}

function AddBlockCard() {
  return (
    <Pressable style={{ marginTop: -0.5 }}>
      <DashedBox radius={26} style={styles.addCard}>
        <PlusCircle />
        <View style={{ marginTop: 'auto' }}>
          <T size={15.25} color={colors.addTitle}>
            Добавить
          </T>
          <View style={{ marginTop: 1.3 }}>
            <Lines lines={['Напр., «Открывать', 'TikTok 3 раза в день»']} size={12} weight={500} ls={TRACK_SMALL} color={colors.addHint} />
          </View>
        </View>
      </DashedBox>
    </Pressable>
  );
}

function Templates() {
  return (
    <View style={styles.tplBand}>
      <SectionHeader
        title="Шаблоны"
        right={
          <Pressable style={styles.seeMore}>
            <T size={14.25} color={colors.white}>
              Ещё
            </T>
            <Icon name="arrow-right-small" width={14} height={14} color={colors.white} style={{ marginLeft: 5 }} />
          </Pressable>
        }
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tplRow}>
        <DashedBox radius={26} color={colors.dashTpl} style={styles.tplCard}>
          <View style={[styles.tplPill, { backgroundColor: colors.white, boxShadow: shadows.pillSoft, top: 11.8, left: 13 }]}>
            <Icon name="lock-fill" width={13} height={15} color={colors.black} style={styles.tplPillIcon} />
            <T size={12} weight={600}>
              30 мин
            </T>
          </View>
          <Image source={art.emojiZap} style={{ position: 'absolute', left: 14.7, top: 87.3, width: 18, height: 25 }} />
          <TemplateText title="Сессия" desc={'Блокировка на 30 минут\nс этой минуты.'} color={colors.text} />
          <Pressable style={[styles.tplStart, { backgroundColor: colors.white, boxShadow: shadows.pillSoft, top: 176.3 }]}>
            <Icon name="play-fill" width={11} height={12} color={colors.black} style={{ marginRight: 4 }} />
            <T size={14.5}>Начать</T>
          </Pressable>
        </DashedBox>

        <View style={[styles.tplCard, { borderRadius: 25.5, overflow: 'hidden' }]}>
          <Image source={art.templateDeepWork} style={StyleSheet.absoluteFill} contentFit="cover" />
          <Glass tone="template" radius={radii.pill} style={[styles.tplPill, { top: 14, left: 13.7, height: 21 }]}>
            <Icon name="lock-fill" width={13} height={15} color={colors.white} style={styles.tplPillIcon} />
            <T size={12} weight={600} color={colors.white}>
              30 мин
            </T>
          </Glass>
          <TemplateText title="Глубокая работа" desc={'Полчаса на главную\nзадачу дня.'} color={colors.white} />
          <Glass tone="template" radius={radii.pill} style={[styles.tplStart, { top: 177.3, left: 13.7, width: 144.3 }]}>
            <Icon name="play-fill" width={11} height={12} color={colors.white} style={{ marginRight: 4 }} />
            <T size={14.5} color={colors.white}>
              Начать
            </T>
          </Glass>
        </View>

        <Image source={art.templateMeTimeEdge} style={{ width: 6.333, height: 204, marginTop: 8.7, marginLeft: -9.7 }} />
      </ScrollView>
    </View>
  );
}

function TemplateText({ title, desc, color }: { title: string; desc: string; color: string }) {
  return (
    <View style={{ position: 'absolute', left: 12.7, right: 8, top: 112.7 }}>
      <T size={17} color={color}>
        {title}
      </T>
      <View style={{ marginTop: 1.3 }}>
        <Lines lines={desc.split('\n')} size={12.5} weight={500} color={color} />
      </View>
    </View>
  );
}

// Переносы строк заданы макетом — держим их, а не полагаемся на ширину шрифта.
function Lines({ lines, ...t }: { lines: string[] } & TProps) {
  return lines.map((line) => (
    <T key={line} numberOfLines={1} {...t} style={{ lineHeight: 14.33 }}>
      {line}
    </T>
  ));
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgPage },
  hdrBg: { position: 'absolute', left: 0, right: 0, top: 0 },
  hdr: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', alignItems: 'flex-start' },
  hdrButtons: { marginLeft: 'auto', flexDirection: 'row', gap: 8, marginTop: 2.3 },
  section: { marginTop: 32 },
  blocksRow: { flexDirection: 'row', gap: 11.667, paddingHorizontal: 20, marginTop: 10 },
  blockCard: { width: 150, height: 196.5, paddingTop: 15.3, paddingLeft: 15.2, paddingRight: 16.75 },
  unlock: {
    position: 'absolute',
    left: 16.333,
    top: 144.333,
    width: 118,
    height: 33.5,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    boxShadow: shadows.pillSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCard: { width: 150.333, height: 197.667, padding: 16.3, paddingBottom: 22 },
  wideCard: { marginHorizontal: 20, marginTop: 10, paddingTop: 11.7, paddingHorizontal: 16, paddingBottom: 17 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  upcoming: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 18.5,
    paddingLeft: 8,
    paddingRight: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    boxShadow: insetBorder(colors.pillBorder, 1.167),
    marginLeft: -0.5,
  },
  metaSepTall: { width: 1.333, height: 10, borderRadius: 1, backgroundColor: colors.metaSep, marginHorizontal: 6.8, marginRight: 11 },
  bullet: { width: 2.667, height: 2.667, borderRadius: 1.4, backgroundColor: colors.bullet, marginHorizontal: 7.3 },
  bottomRow: { flexDirection: 'row', alignItems: 'center' },
  sessionApps: {
    width: 50.5,
    height: 26.667,
    borderRadius: radii.pill,
    backgroundColor: colors.appsPill,
    marginLeft: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ongoing: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 23.667,
    paddingLeft: 8.167,
    paddingRight: 9.5,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    boxShadow: insetBorder(colors.ongoingBorder, 1.167),
  },
  progressTrack: { height: 4.333, borderRadius: 2.167, backgroundColor: colors.progressTrack, marginTop: 8 },
  blockingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 23.333,
    paddingLeft: 8.667,
    paddingRight: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.blockingPill,
  },
  task: { flexDirection: 'row', alignItems: 'center', marginTop: 21 },
  taskRing: { width: 26.333, height: 26.333, borderRadius: 13.2, boxShadow: insetBorder(colors.taskRing, 2), marginLeft: -1 },
  plusTime: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 23,
    paddingHorizontal: 8.5,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    boxShadow: insetBorder(colors.taskRing, 1.167),
    marginRight: -0.5,
  },
  tplBand: { backgroundColor: colors.white, marginTop: 78.7, paddingTop: 17.67, paddingBottom: 19.3 },
  seeMore: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 33,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.seeMore,
  },
  tplRow: { paddingLeft: 19.333, paddingRight: 20, gap: 17.3, marginTop: 14 },
  tplCard: { width: 171.333, height: 221.333 },
  tplPill: {
    position: 'absolute',
    height: 22.5,
    paddingLeft: 23.667,
    paddingRight: 8,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tplPillIcon: { position: 'absolute', left: 7.6, top: 3.5 },
  tplStart: {
    position: 'absolute',
    left: 13,
    width: 145,
    height: 31.667,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
