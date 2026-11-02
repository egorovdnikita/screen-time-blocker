import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SheetTransition } from '@/components/SheetModal';
import { StrictModeRow } from '@/components/StrictModeRow';
import { EditorRow, SessionAction } from '@/components/SessionPrimitives';
import { Icon } from '@/components/Icon';
import { animateLayout, PressScale } from '@/components/motion';
import { art } from '@/data/art';
import { daysLabel, initialTimeLimit, timeLimitRule, type TimeLimitDraft } from '@/data/timeLimit';
import { durationLabel, unlockMethodLabel } from '@/data/session';
import { useAppState } from '@/state/app';
import { T, rounded } from '@/theme/typography';
import { colors, timeLimitTheme as c } from '@/theme/tokens';
import { StrictSettingsSheet, StrictConfirmation, strictDaysLabel } from '../session/StrictSettingsSheet';
import { SessionUnlocks, UnlockDuration } from '../session/SessionUnlocks';
import { LimitAppPicker } from './LimitAppPicker';

type Open = 'after' | 'days' | 'unlocks' | 'notifications' | null;
export function TimeLimitEditor() {
  const [draft, setDraft] = useState(initialTimeLimit);
  const [open, setOpen] = useState<Open>(null);
  const [modal, setModal] = useState<'apps' | 'duration' | 'strict' | 'confirm' | null>(null);
  const [editing, setEditing] = useState(false);
  const insets = useSafeAreaInsets();
  const app = useAppState();
  const after = open === 'after', days = open === 'days', extra = open === 'unlocks', notify = open === 'notifications';
  const deep = extra && draft.unlocks > 0;
  const compact = open !== null;
  const patch = (update: Partial<TimeLimitDraft>) => { animateLayout(); setDraft(d => ({ ...d, ...update })); };
  const toggle = (next: Open) => { animateLayout(); setOpen(x => x === next ? null : next); };
  const setMinutes = (minutes: number) => patch({ minutes, notifyBefore: Math.min(draft.notifyBefore, Math.floor((minutes - 1) / 10) * 10), notifyEvery: Math.min(draft.notifyEvery, Math.floor(minutes / 10) * 10) });
  const dismiss = () => router.canGoBack() ? router.back() : router.replace('/(tabs)');
  const finish = (template = false) => { const rule = timeLimitRule(draft); if (!rule) return; app.addLimit(rule, template); router.dismissAll(); router.navigate('/(tabs)/rules'); };
  const selectedCount = draft.limitApps.length + draft.limitCategories.length;
  const badge = selectedCount ? <View style={styles.badge}><Icon name="apps-grid" width={14} height={14} color={c.ink} /><T size={14} weight={400} ls={0}>{selectedCount}</T></View> : <View style={styles.warning}><T size={12} color={c.warning} ls={0}>● Выбрать</T></View>;
  const row = (title: string, value: string, action: () => void, margin = 14) => <View style={{ marginTop: margin }}><EditorRow title={title} value={value} onPress={action} /></View>;
  const afterValue = `${durationLabel(draft.minutes)}　│　Приложения`;
  const extraValue = draft.unlocks ? `${draft.unlocks}　│　${draft.unlockMethod === 'wait' ? 'Ожидание' : unlockMethodLabel[draft.unlockMethod]}` : 'Нет';
  return <SheetTransition backdrop={<Pressable accessibilityLabel="Закрыть лимит времени" onPress={dismiss} style={[StyleSheet.absoluteFill, { backgroundColor: c.backdrop }]} />}>
    <View style={[styles.sheet, { marginTop: Math.max(59, insets.top + 1) }]}>
      <ScrollView key={deep ? 'deep' : notify ? 'notify' : after ? 'after' : days || extra ? 'details' : 'overview'} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {!compact && <View style={styles.header}><Image source={art.timeLimitHourglass} style={{ width: 39, height: 51, marginTop: 70 }} />{editing ? <TextInput accessibilityLabel="Название лимита времени" autoFocus value={draft.title} onChangeText={title => patch({ title })} onBlur={() => { patch({ title: draft.title.trim() || 'Время экрана' }); setEditing(false); }} maxLength={80} style={styles.titleInput} /> : <PressScale accessibilityLabel="Изменить название лимита" accessibilityRole="button" onPress={() => setEditing(true)} style={styles.title}><T size={27} ls={0} numberOfLines={1} style={{ flexShrink: 1 }}>{draft.title}</T><Icon name="pencil" width={18} height={18} color={c.hint} /></PressScale>}<T size={14} weight={400} color={c.subtitle} center ls={0} style={styles.subtitle}>Блокировать приложения после {draft.minutes < 60 ? `${draft.minutes} ${draft.minutes === 1 ? 'минуты' : 'минут'}` : durationLabel(draft.minutes)} в них. Действует {draft.days.length === 7 ? 'каждый день' : daysLabel(draft.days)}.</T></View>}
        {compact && <View style={{ height: 64, backgroundColor: colors.white }} />}
        {deep && <View pointerEvents="none" style={{ position: 'absolute', top: 64, left: 20, right: 20, height: 12, backgroundColor: colors.white, borderBottomLeftRadius: c.panelRadius, borderBottomRightRadius: c.panelRadius }} />}
        {!deep && <>
          {!after && !notify && <View style={[styles.recommendation, { marginTop: compact ? 17 : 23 }]}><Icon name="chevron-down-section" width={10} height={8} color={c.hint} /><T size={20} color={c.hint} ls={0}>Рекомендации</T></View>}
          <View style={after ? { height: 45, overflow: 'hidden' } : notify ? { height: 27, overflow: 'hidden' } : { marginTop: 4 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={after ? { height: 80, flexGrow: 0, flexShrink: 0, transform: [{ translateY: -35 }] } : notify ? { height: 80, flexGrow: 0, flexShrink: 0, transform: [{ translateY: -53 }] } : undefined} contentContainerStyle={styles.suggestions}>
              {[{ image: art.timeLimitTemplateGentle, title: 'Мягкий лимит', minutes: 30 }, { image: art.timeLimitTemplateHard, title: 'Строгий лимит', minutes: 15 }, { image: art.timeLimitTemplateThird, title: 'Отдых', minutes: 10 }].map(item => <PressScale key={item.title} accessibilityRole="button" accessibilityLabel={`Рекомендация ${item.title}`} onPress={() => setMinutes(item.minutes)} style={styles.suggestion}><Image source={item.image} style={StyleSheet.absoluteFill} /><T size={12} weight={400} color={colors.white} ls={0} style={{ marginLeft: 22, marginTop: 20 }}>{item.minutes} мин макс.</T><T size={15} color={colors.white} ls={0} style={{ marginLeft: 8, marginTop: 5 }}>{item.title}</T></PressScale>)}
            </ScrollView>
          </View>
        </>}
        <View style={{ paddingHorizontal: 20 }}>
          {!deep && <>
            <View style={{ marginTop: 20 }}><EditorRow title="Блокировать" value={badge} onPress={() => setModal('apps')} /></View>
            {after ? <View style={styles.after}>
              <PressScale accessibilityRole="button" accessibilityLabel="Свернуть порог лимита" onPress={() => toggle('after')} style={styles.panelTitle}><Icon name="chevron-down-section" width={10} height={8} color={c.hint} style={{ transform: [{ rotate: '180deg' }] }} /><T size={20} ls={0}>После</T></PressScale>
              <View style={styles.afterGrid}><PressScale accessibilityRole="button" accessibilityLabel="Проведено времени" onPress={() => setModal('duration')} style={styles.detailRow}><T size={14} weight={400} ls={0}>Проведено времени</T><T size={14} color={c.value} ls={0} style={{ marginLeft: 'auto' }}>{durationLabel(draft.minutes)}　›</T></PressScale><View accessibilityState={{ disabled: true }} style={styles.detailRow}><T size={14} weight={400} ls={0}>Для чего</T><T size={14} color={c.value} ls={0} style={{ marginLeft: 'auto' }}>Выбранные　⌃</T></View></View>
              <View style={[styles.detailRow, styles.until]} accessibilityState={{ disabled: true }}><T size={14} weight={400} ls={0}>Заблокировать до</T><T size={14} color={c.value} ls={0} style={{ marginLeft: 'auto' }}>Завтра　⌃</T></View><T size={12} weight={400} color={c.hint} center ls={0} style={styles.afterNote}>Когда лимит будет достигнут, приложения останутся заблокированными до следующего дня.</T>
            </View> : row('После', afterValue, () => toggle('after'))}
          </>}
          {days ? <View style={styles.daysPanel}><PressScale accessibilityRole="button" accessibilityLabel="Свернуть дни лимита" onPress={() => toggle('days')} style={styles.panelTitle}><Icon name="chevron-down-section" width={10} height={8} color={c.hint} style={{ transform: [{ rotate: '180deg' }] }} /><T size={20} ls={0}>Активно</T></PressScale><View style={styles.days}>{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((label, i) => <PressScale key={label} accessibilityRole="checkbox" accessibilityLabel={`День лимита ${label}`} accessibilityState={{ checked: draft.days.includes(i), disabled: draft.days.length === 1 && draft.days.includes(i) }} disabled={draft.days.length === 1 && draft.days.includes(i)} onPress={() => patch({ days: draft.days.includes(i) ? draft.days.filter(d => d !== i) : [...draft.days, i].sort() })} style={[styles.day, draft.days.includes(i) ? { backgroundColor: c.ink, borderColor: c.ink } : { backgroundColor: colors.white, borderColor: c.dayBorder }]}><T size={14} weight={600} color={draft.days.includes(i) ? colors.white : c.dayOff} ls={0}>{label}</T></PressScale>)}</View></View> : row('Активно', daysLabel(draft.days), () => toggle('days'), deep ? 24 : 13)}
          {extra ? <View style={{ marginTop: deep ? 13 : 6 }}><EditorRow title="Ещё открытия" expanded emphasized onPress={() => toggle('unlocks')} headerHeight={deep ? 56 : 55}><SessionUnlocks draft={draft} patch={patch} waitLabel="Ожидание" entryLabel="для входа" /></EditorRow></View> : compact ? row('Ещё открытия', extraValue, () => toggle('unlocks'), days ? 8 : notify ? 10 : 13) : <View style={styles.emptyExtra} />}
          {notify ? <View style={styles.notify}><PressScale accessibilityRole="button" accessibilityLabel="Свернуть уведомления лимита" onPress={() => toggle('notifications')} style={styles.panelTitle}><Icon name="chevron-down-section" width={10} height={8} color={c.hint} style={{ transform: [{ rotate: '180deg' }] }} /><T size={20} ls={0}>Уведомления</T></PressScale><View style={styles.notifyGrid}><NotifyRow label={'До достижения\nлимита'} value={draft.notifyBefore} max={Math.max(0, Math.floor((draft.minutes - 1) / 10) * 10)} onChange={notifyBefore => patch({ notifyBefore })} /><NotifyRow label="Каждые" value={draft.notifyEvery} max={Math.floor(draft.minutes / 10) * 10} onChange={notifyEvery => patch({ notifyEvery })} /></View></View> : compact && !after ? row('Уведомления', draft.notifyBefore || draft.notifyEvery ? 'Настроены' : 'Нет', () => toggle('notifications'), extra && draft.unlocks > 0 ? 12 : days ? 16 : 13) : null}
        </View>
      </ScrollView>
      <View pointerEvents="none" style={styles.handle} />
      <View style={[styles.footer, { paddingBottom: Math.max(39, insets.bottom + 5) }]}><StrictModeRow value={draft.strict} description={draft.strict ? draft.strictScope === 'session' ? 'Активен во время сессии' : `Активен ${strictDaysLabel(draft.strictDays)}` : 'Без изменения и удаления'} onOpen={() => setModal('strict')} onChange={strict => strict ? setModal('strict') : patch({ strict: false })} style={{ marginLeft: 5 }} /><View style={styles.actions}><SessionAction disabled={!selectedCount} onPress={() => finish(true)}>Новый шаблон</SessionAction><SessionAction primary disabled={!selectedCount} onPress={() => draft.strict ? setModal('confirm') : finish()}>Расписание</SessionAction></View></View>
    </View>
    {modal === 'apps' && <LimitAppPicker value={draft.limitApps} categories={draft.limitCategories} onCancel={() => setModal(null)} onSave={(limitApps, limitCategories) => { patch({ limitApps, limitCategories }); setModal(null); }} />}
    {modal === 'duration' && <UnlockDuration maxHours={24} value={draft.minutes} onCancel={() => setModal(null)} onConfirm={minutes => { setMinutes(minutes); setModal(null); }} />}
    {modal === 'strict' && <StrictSettingsSheet value={draft} onCancel={() => setModal(null)} onActivate={settings => { patch({ ...settings, strict: true }); setModal(null); }} />}
    {modal === 'confirm' && <StrictConfirmation onCancel={() => setModal(null)} onContinue={() => finish()} />}
  </SheetTransition>;
}
function NotifyRow({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (value: number) => void }) {
  const name = label.replace('\n', ' ');
  return <View style={styles.notifyRow}><T size={14} weight={400} ls={0} style={{ flex: 1 }}>{label}</T><T size={15} color={c.value} ls={0} style={{ marginRight: 13 }}>{value ? `${value} мин` : 'Нет'}</T><View style={styles.stepper}><PressScale accessibilityRole="button" accessibilityLabel={`Уменьшить уведомление: ${name}`} disabled={!value} accessibilityState={{ disabled: !value }} onPress={() => onChange(Math.max(0, value - 10))} style={styles.step}><T size={23} weight={400} color={value ? c.ink : c.dayOff} ls={0}>−</T></PressScale><View style={styles.stepperLine} /><PressScale accessibilityRole="button" accessibilityLabel={`Увеличить уведомление: ${name}`} disabled={value >= max} accessibilityState={{ disabled: value >= max }} onPress={() => onChange(Math.min(max, value + 10))} style={styles.step}><T size={23} weight={400} color={value >= max ? c.dayOff : c.ink} ls={0}>＋</T></PressScale></View></View>;
}
const styles = StyleSheet.create({
  sheet: { flex: 1, borderRadius: 40, overflow: 'hidden', backgroundColor: c.surface }, handle: { position: 'absolute', zIndex: 2, top: 12, width: 64, height: 5, borderRadius: 4, alignSelf: 'center', backgroundColor: c.handle },
  header: { height: 234, alignItems: 'center', backgroundColor: colors.white }, title: { marginTop: 18, height: 33, flexDirection: 'row', alignItems: 'center', gap: 3, maxWidth: '90%' }, titleInput: { marginTop: 18, height: 33, width: '90%', textAlign: 'center', fontSize: 27, fontWeight: '700', fontFamily: rounded, color: c.ink }, subtitle: { marginTop: 9, marginHorizontal: 24, lineHeight: 18 }, recommendation: { marginHorizontal: 20, height: 26, flexDirection: 'row', gap: 7, alignItems: 'center' }, suggestions: { paddingHorizontal: 20, gap: 8 }, suggestion: { width: 160, height: 80, borderRadius: 20, overflow: 'hidden' },
  badge: { flexDirection: 'row', gap: 4, alignItems: 'center', backgroundColor: c.badge, borderRadius: 18, paddingVertical: 5, paddingHorizontal: 10 }, warning: { backgroundColor: c.warningFill, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 18 },
  after: { marginTop: 14, height: 272, borderRadius: c.panelRadius, backgroundColor: colors.white, padding: 16 }, panelTitle: { height: 27, flexDirection: 'row', alignItems: 'center', gap: 10 }, afterGrid: { marginTop: 14, backgroundColor: c.grid, borderRadius: c.gridRadius, overflow: 'hidden' }, detailRow: { height: 51, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: c.line }, until: { marginTop: 12, borderRadius: c.gridRadius, backgroundColor: c.grid }, afterNote: { marginTop: 12, lineHeight: 15 },
  daysPanel: { marginTop: 13, height: 109, padding: 16, borderRadius: c.panelRadius, backgroundColor: colors.white }, days: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' }, day: { width: 39, height: 39, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, emptyExtra: { marginTop: 14, height: 57, borderRadius: c.panelRadius, backgroundColor: colors.white },
  notify: { marginTop: 21, height: 210, padding: 16, borderRadius: c.panelRadius, backgroundColor: colors.white }, notifyGrid: { marginTop: 13, backgroundColor: c.grid, borderRadius: 0, overflow: 'hidden' }, notifyRow: { height: 65, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: c.line }, stepper: { width: 94, height: 32, borderRadius: c.stepperRadius, backgroundColor: c.stepper, flexDirection: 'row' }, step: { width: 47, height: 32, justifyContent: 'center', alignItems: 'center' }, stepperLine: { position: 'absolute', left: 47, top: 4, bottom: 4, width: 1, backgroundColor: c.stepperLine }, footer: { paddingHorizontal: 20, backgroundColor: c.surface }, actions: { marginTop: 26, flexDirection: 'row', gap: 8 },
});
