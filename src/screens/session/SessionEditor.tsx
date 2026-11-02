import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppGroupSummary } from '@/components/AppGroupSummary';
import { AppGroupSheet } from './AppGroupSheet';
import { hasGroupSelection } from '@/data/appGroup';
import { SessionIcon } from '@/components/SessionIcon';
import { StrictSettingsSheet, StrictConfirmation, strictDaysLabel } from './StrictSettingsSheet';
import { SessionIconPicker } from './SessionIconPicker';
import { Icon } from '@/components/Icon';
import { animateLayout, PressScale } from '@/components/motion';
import { EditorRow, FlowSwitch, SessionAction } from '@/components/SessionPrimitives';
import { SessionUnlocks, unlockCountLabel } from './SessionUnlocks';
import { SessionActivity } from './SessionActivity';
import { art } from '@/data/art';
import { durationLabel, initialSession, sessionRule } from '@/data/session';
import { useAppState } from '@/state/app';
import { T, rounded } from '@/theme/typography';
import { colors, sessionTheme as c } from '@/theme/tokens';

export function SessionEditor() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const insets = useSafeAreaInsets();
  const app = useAppState();
  const [draft, setDraft] = useState(() => initialSession(mode === 'scheduled'));
  const [open, setOpen] = useState<'duration' | 'unlocks' | null>(null);
  const [editing, setEditing] = useState(false);
  const [iconOpen, setIconOpen] = useState(false);
  const [strictOpen, setStrictOpen] = useState(false);
  const [strictConfirm, setStrictConfirm] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const activityExpanded = open === 'duration';
  const unlockExpanded = open === 'unlocks';
  const compact = activityExpanded || (unlockExpanded && draft.unlocks > 0);
  const shortHeader = unlockExpanded && !compact;
  const shortTime = (hour: number, minute: number) => `${hour}:${String(minute).padStart(2, '0')}`;
  const scheduleSummary = draft.allDay ? 'Весь день' : `${shortTime(draft.start, draft.startMinute)}–${shortTime(draft.end, draft.endMinute)}`;
  const daysSummary = draft.days.length === 7 ? 'ежедневно' : draft.days.join() === '0,1,2,3,4' ? 'по будням' : draft.days.map(d => ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'][d]).join(', ');
  const patch = (update: Partial<typeof draft>) => setDraft(d => ({ ...d, ...update }));
  const dismiss = () => router.canGoBack() ? router.back() : router.replace('/(tabs)');
  const finish = (template: boolean) => { app.addSession(sessionRule(draft), template); router.dismissAll(); router.navigate('/(tabs)/rules'); };
  return <View style={styles.overlay}>
    <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Закрыть редактор сессии" onPress={dismiss} />
    <View style={[styles.sheet, { marginTop: Math.max(60, insets.top + 1) }]}>
      <View style={styles.handle} />
      <ScrollView key={compact ? "compact" : shortHeader ? "short" : "overview"} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {!compact && <View style={[styles.header, shortHeader && { height: 197, paddingTop: 60 }]}>
          <PressScale accessibilityRole="button" accessibilityLabel="Изменить иконку сессии" onPress={() => setIconOpen(true)} style={[styles.iconButton, shortHeader && { height: 43 }]}>
            {shortHeader && draft.iconId === 'zap' ? <Image source={art.sessionZapCompact} style={{ width: 41, height: 43 }} /> : <SessionIcon id={draft.iconId} width={draft.iconId === 'brain' ? 55 : 41} height={draft.iconId === 'brain' ? 50 : 56} header />}
          </PressScale>
          {editing ? <TextInput autoFocus accessibilityLabel="Название сессии" value={draft.title} onChangeText={title => patch({ title })} onBlur={() => { patch({ title: draft.title.trim() || 'Сессия' }); setEditing(false); }} onSubmitEditing={() => { patch({ title: draft.title.trim() || 'Сессия' }); setEditing(false); }} maxLength={35} style={styles.titleInput} /> :
            <PressScale onPress={() => setEditing(true)} accessibilityRole="button" accessibilityLabel="Изменить название сессии" style={styles.title}><T size={28} ls={-.4} numberOfLines={1} style={{ flexShrink: 1 }}>{draft.title}</T><Icon name="pencil" width={18} height={18} color={c.disabled} /></PressScale>}
          <T size={14} weight={400} center color={c.secondary} ls={0} style={{ marginTop: 9.8 }}>{draft.strict && !draft.scheduled ? `Блокировать ${durationLabel(draft.minutes)}. Строгий режим включён.` : draft.scheduled ? draft.allDay ? 'Блокировать приложения весь день.' : `Блокировать ${draft.days.length === 7 ? 'каждый день' : daysSummary} с ${shortTime(draft.start, draft.startMinute)} до ${shortTime(draft.end, draft.endMinute)}.` : `Блокировать на ${durationLabel(draft.minutes)}, начиная сейчас.`}</T>
        </View>}
        {!compact && <View style={styles.suggestionHeading}><Icon name="chevron-down-section" width={8} height={6} color={c.section} /><T size={20} color={c.section}>{draft.scheduled ? 'Подборки' : 'Рекомендации'}</T></View>}
        <View style={compact ? styles.compactBand : styles.normalBand}><View style={compact ? styles.compactViewport : styles.normalBand}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={compact ? styles.compactRail : undefined} contentContainerStyle={[styles.suggestions, compact && { paddingTop: 0 }]}>
          {[{ title: draft.scheduled ? 'Рабочие часы' : 'Работа', minutes: 30, start: 9, end: 17, time: '9:00–17:00', image: draft.scheduled ? art.sessionScheduledWork : art.sessionWork }, { title: draft.scheduled ? 'Вечерний отдых' : 'Для себя', minutes: 45, start: 23, end: 6, time: '23:00–6:00', image: draft.scheduled ? art.sessionWindDown : art.sessionMeTime }, { title: draft.scheduled ? 'Утро' : 'Фокус', minutes: 60, start: 6, end: 12, time: '6 ч', image: null }].map(item =>
            <PressScale key={item.title} accessibilityRole="button" onPress={() => patch(draft.scheduled ? { start: item.start, end: item.end, startMinute: 0, endMinute: 0, allDay: false } : { minutes: item.minutes })} style={styles.suggestion}>
              {item.image ? <Image source={item.image} style={StyleSheet.absoluteFill} /> : <LinearGradient colors={c.focusGradient} style={StyleSheet.absoluteFill} />}<View style={styles.suggestionCopy}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}><Icon name="lock-fill" width={10} height={12} color={colors.white} /><T size={12} weight={400} color={colors.white}>{draft.scheduled ? item.time : durationLabel(item.minutes)}</T></View><T size={15} color={colors.white} style={{ marginTop: 5 }}>{item.title}</T></View>
            </PressScale>)}
        </ScrollView></View></View>
        <View style={[styles.rows, compact && { gap: 0 }]}>
          <View style={compact ? { marginBottom: activityExpanded ? 13 : 14 } : undefined}>
          <EditorRow title="Приложения" value={<AppGroupSummary group={draft.appGroup} />} onPress={() => setAppsOpen(true)} />
          </View>
          <View style={compact ? { marginBottom: activityExpanded ? draft.scheduled ? 14 : 9 : 10 } : undefined}>
          <EditorRow title={activityExpanded || draft.scheduled ? 'Активность' : 'Длительность'} value={activityExpanded ? undefined : draft.scheduled ? `${scheduleSummary} | ${daysSummary}` : durationLabel(draft.minutes)}
            emphasized={activityExpanded} headerHeight={activityExpanded ? draft.scheduled ? 53 : 54 : 59} expanded={activityExpanded} onPress={() => { animateLayout(); setOpen(activityExpanded ? null : 'duration'); }}>
            <SessionActivity draft={draft} patch={patch} />
          </EditorRow>
          </View>
          <EditorRow title="Разблокировки" value={unlockExpanded ? undefined : draft.unlocks ? unlockCountLabel(draft.unlocks) : 'Нет'} emphasized={unlockExpanded} headerHeight={unlockExpanded ? draft.unlocks ? 54 : 53 : 59} expanded={unlockExpanded} onPress={() => { animateLayout(); setOpen(unlockExpanded ? null : 'unlocks'); }}>
            <SessionUnlocks draft={draft} patch={patch} />
          </EditorRow>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(39, insets.bottom + 5) }]}>
        <View style={styles.strict}><PressScale accessibilityRole="button" accessibilityLabel="Настройки строгого режима" onPress={() => setStrictOpen(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}><Icon name="session-shield" width={28} height={30} /><View><T size={17} color={c.strict}>Строгий режим</T><T size={12} weight={400} color={c.secondary}>{draft.strict ? draft.strictScope === 'session' ? 'Активен во время сессии' : `Активен ${strictDaysLabel(draft.strictDays)}` : 'Без изменения и удаления'}</T></View></PressScale><View style={{ marginLeft: 'auto', marginRight: draft.strict ? 26 : 0 }}><FlowSwitch label="Строгий режим" value={draft.strict} onChange={strict => strict ? setStrictOpen(true) : patch({ strict: false })} /></View>{draft.strict && <Icon name="chevron-right" width={9} height={13} color={c.disabled} style={{ position: 'absolute', right: 6 }} />}</View>
        <View style={styles.actions}><SessionAction disabled={!hasGroupSelection(draft.appGroup)} onPress={() => finish(true)}>Новый шаблон</SessionAction><SessionAction primary disabled={!hasGroupSelection(draft.appGroup)} onPress={() => draft.strict ? setStrictConfirm(true) : finish(false)}>{draft.scheduled ? 'Расписание' : 'Начать'}</SessionAction></View>
      </View>
    </View>
    {appsOpen && <AppGroupSheet value={draft.appGroup} onCancel={() => setAppsOpen(false)} onConfirm={appGroup => { patch({ appGroup }); setAppsOpen(false); }} />}
    {strictOpen && <StrictSettingsSheet value={draft} onCancel={() => setStrictOpen(false)} onActivate={settings => { patch({ ...settings, strict: true }); setStrictOpen(false); }} />}
    {strictConfirm && <StrictConfirmation onCancel={() => setStrictConfirm(false)} onContinue={() => { setStrictConfirm(false); finish(false); }} />}
    {iconOpen && <SessionIconPicker selected={draft.iconId} onSelect={iconId => { patch({ iconId }); setIconOpen(false); }} onClose={() => setIconOpen(false)} />}
  </View>;
}
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: c.backdrop }, sheet: { flex: 1, borderTopLeftRadius: c.sheetRadius, borderTopRightRadius: c.sheetRadius, overflow: 'hidden', backgroundColor: c.surface },
  handle: { position: 'absolute', zIndex: 1, top: 12, alignSelf: 'center', width: 60, height: 5, borderRadius: 4, backgroundColor: c.handle },
  header: { height: 216, paddingTop: 66, backgroundColor: colors.white, alignItems: 'center' }, iconButton: { width: 55, height: 56, alignItems: 'center', justifyContent: 'center' }, title: { maxWidth: '85%', marginTop: 14.667, flexDirection: 'row', alignItems: 'center', gap: 6 }, titleInput: { height: 34, marginTop: 14.667, fontFamily: rounded, fontSize: 28, fontWeight: '700', textAlign: 'center', color: c.ink, width: '85%' },
  suggestionHeading: { marginTop: 22, marginHorizontal: 22, flexDirection: 'row', alignItems: 'center', gap: 12, height: 26 }, suggestions: { paddingHorizontal: 20, paddingTop: 6, gap: 8 }, suggestion: { width: 160, height: 80, borderRadius: c.suggestionRadius, overflow: 'hidden' }, suggestionCopy: { paddingLeft: 8, paddingTop: 21 }, rows: { marginTop: 20, paddingHorizontal: 20, gap: 14 },
  footer: { paddingHorizontal: 20, paddingTop: 0, backgroundColor: c.surface }, strict: { height: 30, marginLeft: 5, flexDirection: 'row', gap: 8, alignItems: 'center' }, actions: { flexDirection: 'row', gap: 8, marginTop: 25 },
  normalBand: { height: 86 }, compactBand: { marginTop: 36, height: 34, overflow: 'hidden' }, compactViewport: { marginTop: 28, height: 6, overflow: 'hidden' }, compactRail: { height: 80, flexShrink: 0, flexGrow: 0, transform: [{ translateY: -74 }] },
});
