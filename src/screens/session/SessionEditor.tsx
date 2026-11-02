import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/motion';
import { EditorRow, SessionAction, SessionApps } from '@/components/SessionPrimitives';
import { art } from '@/data/art';
import { hourLabel, initialSession, sessionRule } from '@/data/session';
import { useAppState } from '@/state/app';
import { T } from '@/theme/typography';
import { colors, sessionTheme as c } from '@/theme/tokens';

export function SessionEditor() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const insets = useSafeAreaInsets();
  const app = useAppState();
  const [draft, setDraft] = useState(() => initialSession(mode === 'scheduled'));
  const [open, setOpen] = useState<'duration' | 'unlocks' | 'apps' | null>(null);
  const [clock, setClock] = useState<'start' | 'end' | null>(null);
  const [editing, setEditing] = useState(false);
  const [selectedApps, setSelectedApps] = useState([true, true, true]);
  const patch = (update: Partial<typeof draft>) => setDraft(d => ({ ...d, ...update }));
  const dismiss = () => router.canGoBack() ? router.back() : router.replace('/(tabs)');
  const finish = (template: boolean) => { app.addSession({ ...sessionRule(draft), selectedApps }, template); router.dismissAll(); router.navigate('/(tabs)/rules'); };
  return <View style={styles.overlay}>
    <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Закрыть редактор сессии" onPress={dismiss} />
    <View style={[styles.sheet, { marginTop: Math.max(60, insets.top + 1) }]}>
      <View style={styles.handle} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.header}>
          <Image source={art.sessionZap} style={styles.zap} />
          {editing ? <TextInput autoFocus accessibilityLabel="Название сессии" value={draft.title} onChangeText={title => patch({ title })} onBlur={() => setEditing(false)} onSubmitEditing={() => setEditing(false)} maxLength={35} style={styles.titleInput} /> :
            <PressScale onPress={() => setEditing(true)} accessibilityRole="button" accessibilityLabel="Изменить название сессии" style={styles.title}><T size={28} ls={-.4}>{draft.title}</T><Icon name="pencil" width={18} height={18} color={c.disabled} /></PressScale>}
          <T size={14} weight={400} center color={c.secondary} ls={0} style={{ marginTop: 9.8 }}>{draft.scheduled ? `Блокировать с ${hourLabel(draft.start)} до ${hourLabel(draft.end)}.` : `Блокировать на ${draft.minutes} мин, начиная сейчас.`}</T>
        </View>
        <View style={styles.suggestionHeading}><Icon name="chevron-down-section" width={8} height={6} color={c.section} /><T size={20} color={c.section}>Рекомендации</T></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestions}>
          {[{ title: 'Работа', minutes: 30, image: draft.scheduled ? art.sessionScheduledWork : art.sessionWork }, { title: 'Для себя', minutes: 45, image: draft.scheduled ? art.sessionWindDown : art.sessionMeTime }, { title: 'Фокус', minutes: 60, image: null }].map(item =>
            <PressScale key={item.title} accessibilityRole="button" onPress={() => patch({ title: item.title, minutes: item.minutes })} style={styles.suggestion}>
              {item.image ? <Image source={item.image} style={StyleSheet.absoluteFill} /> : <LinearGradient colors={c.focusGradient} style={StyleSheet.absoluteFill} />}<View style={styles.suggestionCopy}><T size={12} weight={400} color={colors.white}>{item.minutes} мин</T><T size={15} color={colors.white} style={{ marginTop: 5 }}>{item.title}</T></View>
            </PressScale>)}
        </ScrollView>
        <View style={styles.rows}>
          <EditorRow title="Приложения" value={<SessionApps selected={selectedApps} />} expanded={open === 'apps'} onPress={() => setOpen(open === 'apps' ? null : 'apps')}>
            {[['XChat', art.sessionXchat], ['Сообщения', art.sessionMessages], ['BeReal', art.sessionBereal]].map(([name, source], i) => <PressScale key={String(name)} accessibilityRole="checkbox" accessibilityLabel={String(name)} accessibilityState={{ checked: selectedApps[i] }} onPress={() => setSelectedApps(a => a.map((v, j) => j === i ? !v : v))} style={styles.appRow}>
              <Image source={source} style={{ width: 28, height: 28, borderRadius: 7 }} /><T size={15} weight={400}>{String(name)}</T><T size={18} color={c.blue} style={{ marginLeft: 'auto' }}>{selectedApps[i] ? '✓' : '○'}</T>
            </PressScale>)}
          </EditorRow>
          <EditorRow title={draft.scheduled ? 'Активность' : 'Длительность'} value={draft.scheduled ? `${hourLabel(draft.start)} – ${hourLabel(draft.end)}` : `${draft.minutes} мин`} expanded={open === 'duration'} onPress={() => setOpen(open === 'duration' ? null : 'duration')}>
            <View style={styles.segments}>{[false, true].map(scheduled => <PressScale key={String(scheduled)} onPress={() => patch({ scheduled })} accessibilityRole="button" accessibilityState={{ selected: draft.scheduled === scheduled }} style={[styles.segment, draft.scheduled === scheduled && styles.segmentOn]}><T size={14} color={draft.scheduled === scheduled ? colors.white : c.secondary}>{scheduled ? 'По расписанию' : 'Сразу'}</T></PressScale>)}</View>
            {draft.scheduled ? <View style={styles.details}>
              {(['start', 'end'] as const).map(key => <View key={key}>
                <PressScale onPress={() => setClock(clock === key ? null : key)} accessibilityRole="button" accessibilityLabel={key === 'start' ? 'Начало' : 'Конец'} style={styles.scheduleRow}><T size={15} weight={400}>{key === 'start' ? 'Начало' : 'Конец'}</T><T size={17} weight={400}>{hourLabel(draft[key])}</T></PressScale>
                {clock === key && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>{Array.from({ length: 24 }, (_, hour) => <PressScale key={hour} accessibilityRole="button" onPress={() => { patch({ [key]: hour }); setClock(null); }} style={styles.time}><T size={15} color={c.blue}>{hourLabel(hour)}</T></PressScale>)}</ScrollView>}
              </View>)}
              <View style={styles.days}>{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((name, day) => <PressScale accessibilityRole="checkbox" accessibilityState={{ checked: draft.days.includes(day) }} key={day} onPress={() => patch({ days: draft.days.includes(day) && draft.days.length > 1 ? draft.days.filter(v => v !== day) : [...new Set([...draft.days, day])].sort() })} style={[styles.day, draft.days.includes(day) && styles.dayOn]}><T size={11} color={draft.days.includes(day) ? colors.white : c.ink}>{name}</T></PressScale>)}</View>
            </View> : <View style={styles.durationChoices}>{[15, 30, 45, 60, 90, 120].map(minutes => <PressScale key={minutes} accessibilityRole="button" accessibilityState={{ selected: draft.minutes === minutes }} onPress={() => patch({ minutes })} style={[styles.duration, draft.minutes === minutes && styles.segmentOn]}><T size={18} color={draft.minutes === minutes ? colors.white : c.ink}>{minutes} мин</T></PressScale>)}</View>}
          </EditorRow>
          <EditorRow title="Разблокировки" value={draft.unlocks ? `${draft.unlocks} раза` : 'Нет'} expanded={open === 'unlocks'} onPress={() => setOpen(open === 'unlocks' ? null : 'unlocks')}>
            <View style={styles.durationChoices}>{[0, 1, 2, 3].map(unlocks => <PressScale key={unlocks} accessibilityRole="button" onPress={() => patch({ unlocks })} style={[styles.duration, draft.unlocks === unlocks && styles.segmentOn]}><T size={17} color={draft.unlocks === unlocks ? colors.white : c.ink}>{unlocks || 'Нет'}</T></PressScale>)}</View>
          </EditorRow>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(39, insets.bottom + 5) }]}>
        <View style={styles.strict}><Icon name="session-shield" width={28} height={30} /><View><T size={17} color={c.strict}>Строгий режим</T><T size={12} weight={400} color={c.secondary}>Без изменения и удаления</T></View><Switch accessibilityLabel="Строгий режим" value={draft.strict} onValueChange={strict => patch({ strict })} thumbColor={Platform.OS === 'ios' ? undefined : colors.white} trackColor={{ true: c.blue, false: c.off }} style={{ marginLeft: 'auto' }} /></View>
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
  segments: { flexDirection: 'row', padding: 12, gap: 6 }, segment: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 24, backgroundColor: c.badge }, segmentOn: { backgroundColor: c.blue },
  durationChoices: { paddingHorizontal: 16, paddingBottom: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, duration: { padding: 12, borderRadius: 20, backgroundColor: c.badge, minWidth: 70, alignItems: 'center' },
  details: { paddingHorizontal: 16, paddingBottom: 20 }, scheduleRow: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, time: { padding: 10, borderRadius: 16, backgroundColor: c.badge }, days: { flexDirection: 'row', gap: 7, marginTop: 10 }, day: { width: 32, height: 32, borderRadius: 16, backgroundColor: c.badge, alignItems: 'center', justifyContent: 'center' }, dayOn: { backgroundColor: c.ink },
  appRow: { height: 52, flexDirection: 'row', gap: 12, alignItems: 'center', paddingHorizontal: 18 },
});
