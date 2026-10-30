import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState, type ComponentRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { BottomChrome, useBottomSpace } from '@/components/BottomChrome';
import { DashedBox, DashedLine } from '@/components/Dashed';
import { DemoMenu } from '@/components/DemoMenu';
import { Glass } from '@/components/Glass';
import { Icon } from '@/components/Icon';
import { FadeIn, PressScale, usePresence } from '@/components/motion';
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
import { START_BUTTON_HEIGHT } from '@/components/StartButton';
import { TAB_BAR_HEIGHT, TAB_BAR_SIDE } from '@/components/TabBar';
import { useDarkStatusBar } from '@/components/useStatusBar';
import { art } from '@/data/art';
import { activeLabel, rulesVariants, type LimitRule, type LockRule, type Meta, type SessionRule, type Status } from '@/data/rules';
import { useAppState } from '@/state/app';
import { T, TRACK_SMALL, type TProps } from '@/theme/typography';
import { colors, insetBorder, radii, shadows } from '@/theme/tokens';

export function RulesScreen() {
  const insets = useSafeAreaInsets();
  useDarkStatusBar();
  const bottomSpace = useBottomSpace(true);
  const top = Math.max(insets.top, 20);
  const app = useAppState();
  const data = rulesVariants[app.rulesVariant];
  const [demoOpen, setDemoOpen] = useState(false);

  // Подсказка 1 привязана к первой карточке сессии.
  const firstCardRef = useRef<ComponentRef<typeof View>>(null);
  const [firstCardBottom, setFirstCardBottom] = useState<number | null>(null);
  const measureFirstCard = () =>
    firstCardRef.current?.measureInWindow((_x, y, _w, h) => setFirstCardBottom(y + h));

  const tips = app.rulesVariant === 'first' ? app.onboarding : 'done';

  return (
    <View style={styles.root}>
      <ScrollView
        key={app.rulesVariant}
        scrollEnabled={tips === 'done'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: top + 85, paddingBottom: bottomSpace }}
      >
        {data.locks.length > 0 && (
          <FadeIn>
            <SectionHeader title="Блокировки" />
            <View style={styles.blocksRow}>
              {data.locks.map((l) => (
                <LockCard key={l.id} rule={l} />
              ))}
              <AddBlockCard />
            </View>
          </FadeIn>
        )}

        {data.sessions.length > 0 && (
          <FadeIn delay={40} style={data.locks.length > 0 && styles.section}>
            <SectionHeader title="Сессии" />
            {data.sessions.map((s, i) => (
              <View
                key={s.id}
                ref={i === 0 ? firstCardRef : undefined}
                collapsable={false}
                onLayout={i === 0 ? measureFirstCard : undefined}
              >
                <SessionCard rule={s} />
              </View>
            ))}
            <HintPill text="Напр., «Блокировать с 23 до 7»" />
          </FadeIn>
        )}

        {data.limits.length > 0 && (
          <FadeIn delay={80} style={styles.section}>
            <SectionHeader title="Лимиты" />
            {data.limits.map((l) => (
              <LimitCard key={l.id} rule={l} />
            ))}
            <HintPill text="Напр., «Блок после 15 мин в день»" />
          </FadeIn>
        )}

        {data.routines.length > 0 && (
          <FadeIn delay={120} style={styles.section}>
            <SectionHeader title="Рутины" />
            <RoutineCard />
            <HintPill text="Напр., «Открыть после 5000 шагов»" />
          </FadeIn>
        )}

        <FadeIn delay={160}>{data.templates === 'classic' ? <ClassicTemplates /> : <GalleryTemplates />}</FadeIn>
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
            {activeLabel(data.active)}
          </T>
        </View>
        <View style={styles.hdrButtons}>
          <RoundButton variant="white" icon="questionmark" iconWidth={15} iconHeight={20} accessibilityLabel="Справка" />
          <RoundButton
            variant="white"
            icon="ellipsis"
            iconWidth={20}
            iconHeight={7}
            accessibilityLabel="Ещё"
            onLongPress={() => setDemoOpen(true)}
          />
        </View>
      </View>

      <BottomChrome start="rules" />

      <Tips step={tips} firstCardBottom={firstCardBottom} onNext={app.advanceOnboarding} />
      <DemoMenu visible={demoOpen} onClose={() => setDemoOpen(false)} />
    </View>
  );
}

// ——— Карточки ———

function LockCard({ rule }: { rule: LockRule }) {
  return (
    <RuleCard style={styles.blockCard}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Streak count={1} />
        <Icon name="chevron-right" width={8} height={11} color={colors.chevron} style={{ marginRight: 1 }} />
      </View>
      <Image
        source={rule.app === 'bereal' ? art.appBereal : art.appAppleMusic}
        style={{ width: 52, height: 58, marginLeft: -5.2, marginTop: 10.3 }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2.3 }}>
        <Icon name="shield-check" width={19} height={20} color={colors.blocking} style={{ marginRight: 5.8 }} />
        <T size={15.25} numberOfLines={1} style={{ flexShrink: 1 }}>
          {rule.name}
        </T>
      </View>
      <PressScale style={styles.unlock}>
        <T size={14.25}>Открыть</T>
        <T size={10} weight={500} color={colors.unlockCount} style={{ marginLeft: 5, marginTop: 2 }}>
          {rule.unlocks}
        </T>
      </PressScale>
    </RuleCard>
  );
}

function AddBlockCard() {
  return (
    <PressScale style={{ marginTop: -0.5 }}>
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
    </PressScale>
  );
}

const sessionEmoji = {
  laptop: <Image source={art.emojiLaptop} style={{ width: 26, height: 27, marginLeft: -2 }} />,
  briefcase: <Image source={art.emojiBriefcase} style={{ width: 23, height: 23 }} />,
  zap: <Image source={art.emojiZap} style={{ width: 18, height: 25, marginLeft: 1 }} />,
};

function SessionCard({ rule }: { rule: SessionRule }) {
  return (
    <RuleCard style={[styles.wideCard, styles.cardGap]}>
      <RuleHeader emoji={sessionEmoji[rule.emoji]} title={rule.title} streak={1} />
      <View style={[styles.metaRow, { marginTop: 11 }]}>
        <StatusPill status={rule.status} />
        <MetaView meta={rule.meta} />
      </View>
      <View style={[styles.bottomRow, { marginTop: 17 }]}>
        <Lock />
        <View style={styles.sessionApps}>
          <Image source={rule.apps === 'first-rule' ? art.appsFirstRule : art.appsSession} style={{ width: 45, height: 21 }} />
        </View>
        {rule.unlock && (
          <PressScale style={styles.firstUnlock}>
            <T size={14.25}>Открыть</T>
            <T size={10} weight={500} color={colors.unlockCount} style={{ marginLeft: 5, marginTop: 2 }}>
              {rule.unlock}
            </T>
          </PressScale>
        )}
      </View>
    </RuleCard>
  );
}

function LimitCard({ rule }: { rule: LimitRule }) {
  return (
    <RuleCard style={[styles.wideCard, { marginTop: 10, paddingBottom: rule.progress === null ? 17 : 18.3 }]}>
      <RuleHeader
        emoji={
          rule.emoji === 'hourglass' ? (
            <Image source={art.emojiHourglass} style={{ width: 20, height: 32 }} />
          ) : (
            <Image source={art.emojiLimitHourglass} style={{ width: 24, height: 28 }} />
          )
        }
        title={rule.title}
        streak={1}
      />
      <View style={[styles.metaRow, { marginTop: 10.6 }]}>
        <StatusPill status={rule.status} />
        <MetaView meta={rule.meta} />
      </View>
      <View style={[styles.bottomRow, { marginTop: 15.7 }]}>
        <Lock />
        <AppsCount count={1} />
        {rule.linkedApps && <Image source={art.limitLinkedApps} style={{ width: 29, height: 23, marginLeft: 4 }} />}
        <T size={17} style={{ marginLeft: 'auto' }}>
          {rule.value}
        </T>
      </View>
      {rule.progress !== null && <Progress value={rule.progress} />}
    </RuleCard>
  );
}

function Progress({ value }: { value: number }) {
  const v = useRef(new Animated.Value(0)).current;
  const [w, setW] = useState(0);
  return (
    <View
      style={styles.progressTrack}
      onLayout={(e) => {
        setW(e.nativeEvent.layout.width);
        Animated.spring(v, { toValue: value, useNativeDriver: false, damping: 20, stiffness: 120 }).start();
      }}
    >
      {value > 0 && w > 0 && (
        <Animated.View
          style={{
            height: '100%',
            borderRadius: 2.167,
            backgroundColor: colors.limitProgress,
            width: v.interpolate({ inputRange: [0, 1], outputRange: [0, w] }),
          }}
        />
      )}
    </View>
  );
}

function RoutineCard() {
  const [done, setDone] = useState(false);
  return (
    <RuleCard style={[styles.wideCard, { marginTop: 10, paddingBottom: 8 }]}>
      <RuleHeader emoji={<Image source={art.emojiPlant} style={{ width: 21, height: 31 }} />} title="Рутина" streak={1} />
      <View style={[styles.metaRow, { marginTop: 11.3 }]}>
        <StatusPill status={{ kind: 'blocking' }} />
        <MetaSep />
        <AllDay />
      </View>
      <Pressable style={styles.task} onPress={() => setDone((d) => !d)} accessibilityRole="checkbox" accessibilityState={{ checked: done }}>
        <View style={[styles.taskRing, done && { backgroundColor: colors.limitProgress, boxShadow: undefined }]}>
          {done && <Icon name="tip-check" width={14} height={12} color={colors.white} />}
        </View>
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
  );
}

function StatusPill({ status }: { status: Status }) {
  if (status.kind === 'blocking') {
    return (
      <View style={styles.blockingPill}>
        <Icon name="shield-check-white" width={13.5} height={17} color={colors.white} style={{ marginRight: 2.3 }} />
        <T size={12.5} color={colors.white}>
          Блокирует
        </T>
        {status.strict && <Icon name="strict-badge" width={14} color="#ff7428" style={{ position: 'absolute', right: -5, top: -6 }} />}
      </View>
    );
  }
  if (status.kind === 'ongoing') {
    return (
      <View style={styles.ongoing}>
        <Icon name="ongoing" width={13} height={13} color={colors.accentIco} style={{ marginRight: 3.2 }} />
        <T size={12} weight={500} ls={TRACK_SMALL} color={colors.accentText}>
          Идёт
        </T>
      </View>
    );
  }
  return (
    <View style={styles.upcoming}>
      <Icon name="upcoming" width={13.5} height={11.5} color={colors.meta} style={{ marginRight: 2.7 }} />
      <T size={12} weight={500} ls={TRACK_SMALL} color={colors.meta}>
        {status.text ?? 'Предстоит'}
      </T>
    </View>
  );
}

function MetaView({ meta }: { meta: Meta }) {
  if (meta.kind === 'ring') {
    const color = meta.tone === 'blocking' ? colors.blockingPill : colors.accentText;
    const r = 6.4;
    const c = 2 * Math.PI * r;
    return (
      <>
        <MetaSep />
        <Svg width={16} height={16} viewBox="0 0 16 16">
          <Circle cx={8} cy={8} r={r} fill="none" stroke={colors.ringTrack} strokeWidth={1.9} />
          <Circle
            cx={8}
            cy={8}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={1.9}
            strokeLinecap="round"
            strokeDasharray={`${c * meta.progress} ${c}`}
            transform="rotate(-100 8 8)"
          />
        </Svg>
        <T size={12} weight={500} ls={TRACK_SMALL} color={color} style={{ marginLeft: 6.5 }} numberOfLines={1}>
          {meta.text}
        </T>
      </>
    );
  }
  return (
    <>
      <View style={styles.metaSepTall} />
      <T size={11.75} weight={600} ls={TRACK_SMALL} color={colors.meta} numberOfLines={1} style={{ flexShrink: 1 }}>
        {meta.time}
      </T>
      {meta.days && (
        <>
          <View style={styles.bullet} />
          <T size={12} weight={500} ls={TRACK_SMALL} color={colors.meta} numberOfLines={1} style={{ flexShrink: 1 }}>
            {meta.days}
          </T>
        </>
      )}
    </>
  );
}

// ——— Шаблоны ———

function TemplatesShell({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.tplBand}>
      <SectionHeader
        title="Шаблоны"
        right={
          <PressScale style={styles.seeMore}>
            <T size={14.25} color={colors.white}>
              Ещё
            </T>
            <Icon name="arrow-right-small" width={14} height={14} color={colors.white} style={{ marginLeft: 5 }} />
          </PressScale>
        }
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tplRow} decelerationRate="fast" snapToInterval={171.333 + 17.3}>
        {children}
      </ScrollView>
    </View>
  );
}

function ClassicTemplates() {
  return (
    <TemplatesShell>
      <PressScale scaleTo={0.97}>
        <DashedBox radius={26} color={colors.dashTpl} style={styles.tplCard}>
          <View style={[styles.tplPill, { backgroundColor: colors.white, boxShadow: shadows.pillSoft, top: 11.8, left: 13 }]}>
            <Icon name="lock-fill" width={13} height={15} color={colors.black} style={styles.tplPillIcon} />
            <T size={12} weight={600}>
              30 мин
            </T>
          </View>
          <Image source={art.emojiZap} style={{ position: 'absolute', left: 14.7, top: 87.3, width: 18, height: 25 }} />
          <TemplateText title="Сессия" desc={'Блокировка на 30 минут\nс этой минуты.'} color={colors.text} top={112.7} />
          <View style={[styles.tplStart, { backgroundColor: colors.white, boxShadow: shadows.pillSoft, top: 176.3 }]}>
            <Icon name="play-fill" width={11} height={12} color={colors.black} style={{ marginRight: 4 }} />
            <T size={14.5}>Начать</T>
          </View>
        </DashedBox>
      </PressScale>

      <ImageTemplate image={art.templateDeepWork} duration="30 мин" title="Глубокая работа" desc={'Полчаса на главную\nзадачу дня.'} withStart />

      <Image source={art.templateMeTimeEdge} style={{ width: 6.333, height: 204, marginTop: 8.7, marginLeft: -9.7 }} />
    </TemplatesShell>
  );
}

function GalleryTemplates() {
  return (
    <TemplatesShell>
      <ImageTemplate image={art.templateDeepWorkFirst} duration="30 мин" title="Глубокая работа" desc={'Полчаса на главную\nзадачу дня.'} />
      <ImageTemplate image={art.templateMeTime} duration="1ч" title="Время для себя" desc={'Отдохните от суеты.\nПрогуляйтесь или\nничего не делайте.'} />
      <Image source={art.templateFocusEdge} style={{ width: 14.333, height: 221, marginLeft: -9.3 }} />
    </TemplatesShell>
  );
}

function ImageTemplate({
  image,
  duration,
  title,
  desc,
  withStart,
}: {
  image: number;
  duration: string;
  title: string;
  desc: string;
  withStart?: boolean;
}) {
  const lines = desc.split('\n').length;
  return (
    <PressScale scaleTo={0.97} style={[styles.tplCard, { borderRadius: 25.5, overflow: 'hidden' }]}>
      <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" />
      <Glass tone="template" radius={radii.pill} style={[styles.tplPill, { top: 14, left: 13.7, height: 21 }]}>
        <Icon name="lock-fill" width={13} height={15} color={colors.white} style={styles.tplPillIcon} />
        <T size={12} weight={600} color={colors.white}>
          {duration}
        </T>
      </Glass>
      <TemplateText title={title} desc={desc} color={colors.white} top={withStart ? 112.7 : 127.7 - (lines - 2) * 14.33} />
      {withStart && (
        <Glass tone="template" radius={radii.pill} style={[styles.tplStart, { top: 177.3, left: 13.7, width: 144.3 }]}>
          <Icon name="play-fill" width={11} height={12} color={colors.white} style={{ marginRight: 4 }} />
          <T size={14.5} color={colors.white}>
            Начать
          </T>
        </Glass>
      )}
    </PressScale>
  );
}

function TemplateText({ title, desc, color, top }: { title: string; desc: string; color: string; top: number }) {
  return (
    <View style={{ position: 'absolute', left: 12.7, right: 8, top }}>
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

// ——— Онбординг-подсказки (03-creating-an-account__06/07) ———

function Tips({ step, firstCardBottom, onNext }: { step: 'tip-first-rule' | 'tip-add-more' | 'done'; firstCardBottom: number | null; onNext: () => void }) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const dim = usePresence(step !== 'done', 'timing');
  const first = usePresence(step === 'tip-first-rule');
  const second = usePresence(step === 'tip-add-more');
  if (!dim.mounted) return null;

  const barBottom = insets.bottom > 0 ? TAB_BAR_SIDE : 12;
  const startTop = height - (barBottom + TAB_BAR_HEIGHT + 20.7 + START_BUTTON_HEIGHT);

  const bubble = (p: Animated.Value, dir: 'up' | 'down') => ({
    opacity: p,
    transform: [
      { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [dir === 'up' ? -10 : 10, 0] }) },
      { scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
    ],
  });

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.tutorialDim, opacity: dim.progress }]} />
      {first.mounted && firstCardBottom !== null && (
        <Animated.View style={[styles.tutorial, { top: firstCardBottom + 18, transformOrigin: 'top center' }, bubble(first.progress, 'up')]}>
          <Icon name="period-tip" width={28} height={16} color={colors.black} style={[styles.tutorialTip, { top: -14 }]} />
          <T size={15.25} color={colors.white} style={{ marginRight: 56 }}>
            Первое правило добавлено!
          </T>
          <T size={15.25} weight={400} color={colors.white} style={{ lineHeight: 18.333, marginTop: 15.3 }}>
            Нажмите на карточку для настройки.
          </T>
          <PressScale onPress={onNext} style={styles.tutorialNext} accessibilityLabel="Далее">
            <Icon name="arrow-right-small" width={14} color={colors.black} />
          </PressScale>
        </Animated.View>
      )}
      {second.mounted && (
        <Animated.View style={[styles.tutorial, { bottom: height - startTop + 11, transformOrigin: 'bottom center' }, bubble(second.progress, 'down')]}>
          <Icon name="period-tip" width={28} height={16} color={colors.black} style={[styles.tutorialTip, { bottom: -14, transform: [{ rotate: '180deg' }] }]} />
          <T size={15.25} color={colors.white} style={{ marginRight: 56 }}>
            Добавьте ещё!
          </T>
          <T size={15.25} weight={400} color={colors.white} style={{ lineHeight: 18.333, marginTop: 15.3 }}>
            {'Создавайте свои правила или используйте\nнаши шаблоны.'}
          </T>
          <PressScale onPress={onNext} style={styles.tutorialNext} accessibilityLabel="Понятно">
            <Icon name="tip-check" width={16} height={14} color={colors.black} />
          </PressScale>
        </Animated.View>
      )}
    </View>
  );
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
  wideCard: { marginHorizontal: 20, paddingTop: 11.7, paddingHorizontal: 16, paddingBottom: 17 },
  cardGap: { marginTop: 10 },
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
  metaSepTall: { width: 1.333, height: 10, borderRadius: 1, backgroundColor: colors.metaSep, marginLeft: 6.8, marginRight: 11 },
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
  firstUnlock: {
    marginLeft: 'auto',
    height: 30,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    boxShadow: shadows.pillSoft,
    flexDirection: 'row',
    alignItems: 'center',
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
  progressTrack: { height: 4.333, borderRadius: 2.167, backgroundColor: colors.progressTrack, marginTop: 8, overflow: 'hidden' },
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
  taskRing: {
    width: 26.333,
    height: 26.333,
    borderRadius: 13.2,
    boxShadow: insetBorder(colors.taskRing, 2),
    marginLeft: -1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  tutorial: {
    position: 'absolute',
    left: 10,
    right: 10,
    borderRadius: 34,
    backgroundColor: colors.black,
    padding: 20,
  },
  tutorialTip: { position: 'absolute', left: '50%', marginLeft: -14 },
  tutorialNext: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 46,
    height: 24,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
