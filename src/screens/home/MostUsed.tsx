import { ReflectionSheet } from './ReflectionSheet';
import { AppIcon } from './AppIcon';
import { reflectionKey, reflectionMoods } from '@/data/reflection';
import { Image } from 'expo-image';
import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { DashedLine } from '@/components/Dashed';
import { Icon } from '@/components/Icon';
import { FadeIn, PressScale, animateLayout } from '@/components/motion';
import { art } from '@/data/art';
import type { ActivityAppIcon, ActivityRow, AppRow, Day } from '@/data/home';
import { useAppState } from '@/state/app';
import { T, TRACK_SMALL } from '@/theme/typography';
import { colors, radii, shadows } from '@/theme/tokens';

import type { Anchor } from './Overlays';

type Props = { day: Day; onOpenMenu: (a: Anchor) => void };

export function MostUsed({ day, onOpenMenu }: Props) {
  const app = useAppState();
  const pillRef = useRef<ComponentRef<typeof View>>(null);
  const mode = app.mostUsedMode;
  const [editing, setEditing] = useState<AppRow | null>(null);

  const apps = day.apps.map<AppRow>((a) => ({
    ...a,
    state: app.excluded.includes(a.id) || app.reflectionExcluded.includes(reflectionKey(day.id, a.id)) ? 'excluded' : app.productive.includes(a.id) ? 'productive' : a.state,
  }));
  const counted = apps.filter((a) => a.state !== 'excluded');
  const excluded = apps.filter((a) => a.state === 'excluded');

  return (
    <View>
      <View style={styles.header}>
        <T size={20} color={colors.sectionLight}>
          Чаще всего
        </T>
        <View ref={pillRef} collapsable={false}>
          <PressScale
            onPress={() => pillRef.current?.measureInWindow((x, y, width, height) => onOpenMenu({ x, y, width, height }))}
            style={styles.pill}
            accessibilityRole="button"
            accessibilityLabel="Режим сводки"
          >
            <Icon name="updown" width={12} height={14.5} color={colors.black} style={{ marginRight: 3.4 }} />
            <T size={14.25}>{mode === 'apps' ? 'Приложения' : 'Активности'}</T>
          </PressScale>
        </View>
      </View>

      {mode === 'apps' ? (
        <FadeIn key="apps" from={6}>
          {counted.map((a) => (
            <AppItem
              key={a.id}
              app={a}
              assessment={app.reflections[reflectionKey(day.id, a.id)]}
              onMark={() => {
                animateLayout();
                setEditing(a);
              }}
              onToggleExclude={() => {
                animateLayout();
                app.toggleExcluded(a.id);
              }}
            />
          ))}
          {excluded.length > 0 && (
            <>
              <DashedLine color={colors.separator} style={{ marginHorizontal: 20, marginTop: -10.5, marginBottom: 38 }} />
              {excluded.map((a) => (
                <AppItem
                  key={a.id}
                  app={a}
                  onMark={() => setEditing(a)}
                  assessment={app.reflections[reflectionKey(day.id, a.id)]}
                  onToggleExclude={() => {
                    if (app.reflectionExcluded.includes(reflectionKey(day.id, a.id))) { app.setReflectionExcluded(day.id, a.id, false); return; }
                    animateLayout();
                    app.toggleExcluded(a.id);
                  }}
                />
              ))}
            </>
          )}
        </FadeIn>
      ) : day.activities.length > 0 ? (
        <FadeIn key="activities" from={6}>
          {day.activities.map((a) => (
            <ActivityItem key={a.id} activity={a} />
          ))}
        </FadeIn>
      ) : (
        <FadeIn key="empty" from={6} style={styles.empty}>
          <View style={styles.emptyLine}>
            <T size={15.25} color={colors.emptyActivities}>
              Нажмите на{' '}
            </T>
            <Icon name="plus" width={13} color={colors.emptyActivities} style={{ marginHorizontal: 1 }} />
            <T size={15.25} color={colors.emptyActivities}>
              {' '}под приложением
            </T>
          </View>
          <T size={15.25} color={colors.emptyActivities} center style={{ lineHeight: 18.333 }}>
            {'во вкладке «Приложения», чтобы\nдобавить активность. Здесь будет\nсводка ваших активностей.'}
          </T>
        </FadeIn>
      )}
      {editing && <ReflectionSheet app={editing} value={app.reflections[reflectionKey(day.id, editing.id)] ?? app.reflectionDefaults[editing.id]} onCancel={() => setEditing(null)} onDelete={app.reflections[reflectionKey(day.id, editing.id)] ? () => { app.deleteReflection(day.id, editing.id); setEditing(null); } : undefined} onSave={value => { app.saveReflection(day.id, editing.id, value); setEditing(null); }} onExclude={() => { app.setReflectionExcluded(day.id, editing.id, true); setEditing(null); }} />}
    </View>
  );
}


function AppItem({ app, assessment, onMark, onToggleExclude }: { app: AppRow; assessment?: import('@/data/reflection').Reflection; onMark?: () => void; onToggleExclude: () => void }) {
  const isOther = app.icon === 'other';
  const excluded = app.state === 'excluded';
  return (
    <Pressable
      onLongPress={isOther ? undefined : onToggleExclude}
      delayLongPress={400}
      style={({ pressed }) => [styles.row, excluded && { height: 74 }, pressed && !isOther && { opacity: 0.7 }]}
      accessibilityHint={isOther ? undefined : excluded ? 'Долгое нажатие вернёт в экранное время' : 'Долгое нажатие исключит из экранного времени'}
    >
      <View style={styles.rowIcon}>
        <AppIcon icon={app.icon} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.rowTop}>
          <T size={15.25}>{app.name}</T>
          {!excluded && (
            <T size={14.25} weight={400}>
              {app.time}
            </T>
          )}
        </View>
        {excluded ? (
          <View style={[styles.chip, styles.excludedChip]}>
            <Icon name="eye-slash" width={12} color={colors.excludedInk} style={{ marginRight: 3 }} />
            <T size={12} color={colors.excludedInk}>
              Исключено
            </T>
          </View>
        ) : isOther ? (
          <View style={styles.otherApps}>
            <Image source={app.others === 'apps-other-2' ? art.appsOther2 : art.appsOther} style={{ width: app.others === 'apps-other-2' ? 46 : 45, height: app.others === 'apps-other-2' ? 25 : 24 }} />
            {app.othersCount ? (
              <T size={12.25} ls={TRACK_SMALL} color={colors.plusMore} style={{ marginLeft: 2 }}>
                +{app.othersCount}
              </T>
            ) : null}
          </View>
        ) : (
          <>
            <View style={styles.barTrack}>
              <View style={[styles.bar, { width: `${Math.max(3.2, app.ratio * 100)}%` }]} />
            </View>
            {assessment || app.state === 'productive' ? (
              <FadeIn from={4}>
                <PressScale onPress={onMark} accessibilityRole="button" accessibilityLabel={`Изменить оценку ${app.name}`}><T size={12.25} ls={TRACK_SMALL} color={!assessment || reflectionMoods.find(m => m.id === assessment.mood)?.quality === 'productive' ? colors.qProductive : colors.qNeutral} style={{ marginTop: 9 }}>{assessment ? reflectionMoods.find(m => m.id === assessment.mood)?.title : 'С пользой'}</T></PressScale>
              </FadeIn>
            ) : (
              <PressScale onPress={onMark} style={styles.chip} accessibilityRole="button" accessibilityLabel={`Оценить время ${app.name}`}>
                <Icon name="plus-chip" width={13} height={12} color={colors.chipInk} style={{ marginRight: 3.2 }} />
                <T size={12.25} weight={600} ls={TRACK_SMALL} color={colors.chipInk}>
                  Время с пользой?
                </T>
              </PressScale>
            )}
          </>
        )}
      </View>
    </Pressable>
  );
}

const activityArt = {
  work: { src: art.activityWork, w: 32, h: 35 },
  inspiration: { src: art.activityInspiration, w: 32, h: 35 },
  procrastinate: { src: art.activityProcrastinate, w: 32, h: 35 },
};

function ActivityAppGlyph({ icon }: { icon: ActivityAppIcon }) {
  switch (icon) {
    case 'block':
      return <Icon name="ogonek-app-icon" width={20} />;
    case 'flight':
      return <Image source={art.activityFlight} style={{ width: 22, height: 24 }} />;
    case 'photos':
      return <Image source={art.activityPhotos} style={{ width: 23, height: 24 }} />;
    case 'phia':
    case 'substack':
    case 'other':
      return <AppIcon icon={icon} size={20} />;
    case 'store':
      return <Image source={art.activityStore} style={{ width: 24, height: 25 }} />;
  }
}

function ActivityItem({ activity }: { activity: ActivityRow }) {
  const a = activityArt[activity.icon];
  const good = activity.quality === 'productive';
  return (
    <View accessibilityLabel={`Активность ${activity.name}: ${activity.quality}`} style={[styles.row, { height: 88, paddingLeft: 22 }]}>
      {activity.emoji ? <T size={28} style={{ width: 32, marginRight: 14 }}>{activity.emoji}</T> : <Image source={activity.image ?? a.src} style={{ width: a.w, height: a.h, marginRight: 14 }} />}
      <View style={{ flex: 1 }}>
        <View style={styles.rowTop}>
          <T size={15.25}>{activity.name}</T>
          <T size={14.25} weight={400}>
            {activity.time}
          </T>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.bar, { width: `${Math.max(3.2, activity.ratio * 100)}%` }]} />
        </View>
        <View style={styles.activityMeta}>
          <T size={12.25} ls={TRACK_SMALL} color={good ? colors.qProductive : colors.qNeutral} style={{ width: 73 }}>
            {good ? 'С пользой' : activity.quality === 'neutral' ? 'Норма' : 'Отвлекает'}
          </T>
          <View style={styles.metaSep} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 8 }}>
            {activity.apps.map((i) => (
              <ActivityAppGlyph key={i} icon={i} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 19,
    marginTop: 39.8,
    marginBottom: 24,
  },
  pill: {
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
  excludedChip: { height: 22, paddingLeft: 8, backgroundColor: colors.excludedBg, marginTop: 5 },
  otherIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.otherBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otherApps: { flexDirection: 'row', alignItems: 'center', marginTop: 5, marginLeft: 2 },
  activityMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 11 },
  metaSep: { width: 1.333, height: 17, backgroundColor: colors.separator },
  empty: { alignItems: 'center', marginTop: 34 },
  emptyLine: { flexDirection: 'row', alignItems: 'center' },
});
