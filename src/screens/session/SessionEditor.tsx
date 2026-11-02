import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { animateLayout, PressScale } from '@/components/motion';
import { EditorRow, FlowSwitch, SessionAction, SessionApps } from '@/components/SessionPrimitives';
import { SessionActivity } from './SessionActivity';
import { art } from '@/data/art';
import { durationLabel, hourLabel, initialSession, sessionRule } from '@/data/session';
import { useAppState } from '@/state/app';
import { T } from '@/theme/typography';
import { colors, sessionTheme as c } from '@/theme/tokens';

export function SessionEditor() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const insets = useSafeAreaInsets();
  const app = useAppState();
  const [draft, setDraft] = useState(() => initialSession(mode === 'scheduled'));
  const [open, setOpen] = useState<'duration' | 'unlocks' | 'apps' | null>(null);
  const [editing, setEditing] = useState(false);
  const [selectedApps, setSelectedApps] = useState([true, true, true]);
  const activityExpanded = open === 'duration';
  const patch = (update: Partial<typeof draft>) => setDraft(d => ({ ...d, ...update }));
  const dismiss = () => router.canGoBack() ? router.back() : router.replace('/(tabs)');
  const finish = (template: boolean) => { app.addSession({ ...sessionRule(draft), selectedApps }, template); router.dismissAll(); router.navigate('/(tabs)/rules'); };
  return <View style={styles.overlay}>
    <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Закрыть редактор сессии" onPress={dismiss} />
    <View style={[styles.sheet, { marginTop: Math.max(60, insets.top + 1) }]}>
      <View style={styles.handle} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {!activityExpanded && <View style={styles.header}>
          <Image source={art.sessionZap} style={styles.zap} />
          {editing ? <TextInput autoFocus accessibilityLabel="Название сессии" value={draft.title} onChangeText={title => patch({ title })} onBlur={() => setEditing(false)} onSubmitEditing={() => setEditing(false)} maxLength={35} style={styles.titleInput} /> :
            <PressScale onPress={() => setEditing(true)} accessibilityRole="button" accessibilityLabel="Изменить название сессии" style={styles.title}><T size={28} ls={-.4}>{draft.title}</T><Icon name="pencil" width={18} height={18} color={c.disabled} /></PressScale>}
          <T size={14} weight={400} center color={c.secondary} ls={0} style={{ marginTop: 9.8 }}>{draft.scheduled ? draft.allDay ? 'Блокировать приложения весь день.' : `Блокировать с ${hourLabel(draft.start, draft.startMinute)} до ${hourLabel(draft.end, draft.endMinute)}.` : `Блокировать на ${durationLabel(draft.minutes)}, начиная сейчас.`}</T>
        </View>}
        {!activityExpanded && <View style={styles.suggestionHeading}><Icon name="chevron-down-section" width={8} height={6} color={c.section} /><T size={20} color={c.section}>Рекомендации</T></View>}
        <View style={activityExpanded ? styles.compactBand : styles.normalBand}><View style={activityExpanded ? styles.compactViewport : styles.normalBand}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={activityExpanded ? styles.compactRail : undefined} contentContainerStyle={[styles.suggestions, activityExpanded && { paddingTop: 0 }]}>
          {[{ title: 'Работа', minutes: 30, image: draft.scheduled ? art.sessionScheduledWork : art.sessionWork }, { title: 'Для себя', minutes: 45, image: draft.scheduled ? art.sessionWindDown : art.sessionMeTime }, { title: 'Фокус', minutes: 60, image: null }].map(item =>
            <PressScale key={item.title} accessibilityRole="button" onPress={() => patch({ title: item.title, minutes: item.minutes })} style={styles.suggestion}>
              {item.image ? <Image source={item.image} style={StyleSheet.absoluteFill} /> : <LinearGradient colors={c.focusGradient} style={StyleSheet.absoluteFill} />}<View style={styles.suggestionCopy}><T size={12} weight={400} color={colors.white}>{item.minutes} мин</T><T size={15} color={colors.white} style={{ marginTop: 5 }}>{item.title}</T></View>
            </PressScale>)}
        </ScrollView></View></View>
        <View style={[styles.rows, activityExpanded && { gap: 0 }]}>
          <View style={activityExpanded ? { marginBottom: 13 } : undefined}>
          <EditorRow title="Приложения" value={<SessionApps selected={selectedApps} />} expanded={open === 'apps'} onPress={() => setOpen(open === 'apps' ? null : 'apps')}>
            {[['XChat', art.sessionXchat], ['Сообщения', art.sessionMessages], ['BeReal', art.sessionBereal]].map(([name, source], i) => <PressScale key={String(name)} accessibilityRole="checkbox" accessibilityLabel={String(name)} accessibilityState={{ checked: selectedApps[i] }} onPress={() => setSelectedApps(a => a.map((v, j) => j === i ? !v : v))} style={styles.appRow}>
              <Image source={source} style={{ width: 28, height: 28, borderRadius: 7 }} /><T size={15} weight={400}>{String(name)}</T><T size={18} color={c.blue} style={{ marginLeft: 'auto' }}>{selectedApps[i] ? '✓' : '○'}</T>
            </PressScale>)}
          </EditorRow>
          </View>
          <View style={activityExpanded ? { marginBottom: draft.scheduled ? 14 : 9 } : undefined}>
          <EditorRow title={activityExpanded || draft.scheduled ? 'Активность' : 'Длительность'} value={activityExpanded ? undefined : draft.scheduled ? draft.allDay ? 'Весь день' : `${hourLabel(draft.start, draft.startMinute)} – ${hourLabel(draft.end, draft.endMinute)}` : durationLabel(draft.minutes)}
            emphasized={activityExpanded} headerHeight={activityExpanded ? draft.scheduled ? 53 : 54 : 59} expanded={activityExpanded} onPress={() => { animateLayout(); setOpen(activityExpanded ? null : 'duration'); }}>
            <SessionActivity draft={draft} patch={patch} />
          </EditorRow>
          </View>
          <EditorRow title="Разблокировки" value={draft.unlocks ? `${draft.unlocks} раза` : 'Нет'} expanded={open === 'unlocks'} onPress={() => setOpen(open === 'unlocks' ? null : 'unlocks')}>
            <View style={styles.durationChoices}>{[0, 1, 2, 3].map(unlocks => <PressScale key={unlocks} accessibilityRole="button" onPress={() => patch({ unlocks })} style={[styles.duration, draft.unlocks === unlocks && styles.segmentOn]}><T size={17} color={draft.unlocks === unlocks ? colors.white : c.ink}>{unlocks || 'Нет'}</T></PressScale>)}</View>
          </EditorRow>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(39, insets.bottom + 5) }]}>
        <View style={styles.strict}><Icon name="session-shield" width={28} height={30} /><View><T size={17} color={c.strict}>Строгий режим</T><T size={12} weight={400} color={c.secondary}>Без изменения и удаления</T></View><View style={{ marginLeft: 'auto' }}><FlowSwitch label="Строгий режим" value={draft.strict} onChange={strict => patch({ strict })} /></View></View>
        <View style={styles.actions}><SessionAction disabled={!selectedApps.some(Boolean)} onPress={() => finish(true)}>Новый шаблон</SessionAction><SessionAction primary disabled={!selectedApps.some(Boolean)} onPress={() => finish(false)}>{draft.scheduled ? 'Расписание' : 'Начать'}</SessionAction></View>
      </View>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: c.backdrop }, sheet: { flex: 1, borderTopLeftRadius: c.sheetRadius, borderTopRightRadius: c.sheetRadius, overflow: 'hidden', backgroundColor: c.surface },
  handle: { position: 'absolute', zIndex: 1, top: 12, alignSelf: 'center', width: 60, height: 5, borderRadius: 4, backgroundColor: c.handle },
  header: { height: 216, paddingTop: 66, backgroundColor: colors.white, alignItems: 'center' }, zap: { width: 41, height: 56 }, title: { marginTop: 14.667, flexDirection: 'row', alignItems: 'center', gap: 6 }, titleInput: { height: 34, marginTop: 14.667, fontSize: 28, fontWeight: '700', textAlign: 'center', color: c.ink, width: '85%' },
  suggestionHeading: { marginTop: 22, marginHorizontal: 22, flexDirection: 'row', alignItems: 'center', gap: 12, height: 26 }, suggestions: { paddingHorizontal: 20, paddingTop: 6, gap: 8 }, suggestion: { width: 160, height: 80, borderRadius: c.suggestionRadius, overflow: 'hidden' }, suggestionCopy: { paddingLeft: 8, paddingTop: 21 }, rows: { marginTop: 20, paddingHorizontal: 20, gap: 14 },
  footer: { paddingHorizontal: 20, paddingTop: 0, backgroundColor: c.surface }, strict: { height: 30, marginLeft: 5, flexDirection: 'row', gap: 8, alignItems: 'center' }, actions: { flexDirection: 'row', gap: 8, marginTop: 25 },
  normalBand: { height: 86 }, compactBand: { marginTop: 36, height: 34, overflow: 'hidden' }, compactViewport: { marginTop: 28, height: 6, overflow: 'hidden' }, compactRail: { height: 80, flexShrink: 0, flexGrow: 0, transform: [{ translateY: -74 }] },
  segmentOn: { backgroundColor: c.blue },
  durationChoices: { paddingHorizontal: 16, paddingBottom: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, duration: { padding: 12, borderRadius: 20, backgroundColor: c.badge, minWidth: 70, alignItems: 'center' },
  appRow: { height: 52, flexDirection: 'row', gap: 12, alignItems: 'center', paddingHorizontal: 18 },
});
