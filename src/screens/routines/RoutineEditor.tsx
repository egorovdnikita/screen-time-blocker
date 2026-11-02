import { useDarkStatusBar } from '@/components/useStatusBar';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RuleEditorHeader, RuleSuggestions } from '@/components/RuleEditorPieces';
import { WeekdayPicker } from '@/components/WeekdayPicker';
import { SheetTransition } from '@/components/SheetModal';
import { StrictModeRow } from '@/components/StrictModeRow';
import { EditorRow, FlowSwitch, SessionAction } from '@/components/SessionPrimitives';
import { Icon } from '@/components/Icon';
import { PressScale, animateLayout } from '@/components/motion';
import { art } from '@/data/art';
import { hasGroupSelection, countLabel } from '@/data/appGroup';
import { initialRoutine, habits, routineReward, routineRule, canSaveRoutine, type RoutineDraft } from '@/data/routine';
import { durationLabel } from '@/data/session';
import { daysLabel } from '@/data/timeLimit';
import { useAppState } from '@/state/app';
import { colors, timeLimitTheme as l, routineTheme as c } from '@/theme/tokens';
import { T } from '@/theme/typography';
import { AppGroupSheet } from '../session/AppGroupSheet';
import { StrictSettingsSheet, StrictConfirmation, strictDaysLabel } from '../session/StrictSettingsSheet';
import { HabitPicker } from './HabitPicker';

export function RoutineEditor() {
  useDarkStatusBar();
  const [draft, setDraft] = useState(initialRoutine);
  const [open, setOpen] = useState<'after' | 'days' | null>(null);
  const [modal, setModal] = useState<'apps' | 'habits' | 'strict' | 'confirm' | null>(null);
  const insets = useSafeAreaInsets();
  const app = useAppState();
  const after = open === 'after', days = open === 'days', selected = draft.habitIds.length > 0;
  const compact = open !== null;
  const patch = (update: Partial<RoutineDraft>) => { animateLayout(); setDraft(d => ({ ...d, ...update })); };
  const toggle = (next: typeof open) => { animateLayout(); setOpen(v => v === next ? null : next); };
  const dismiss = () => router.canGoBack() ? router.back() : router.replace('/(tabs)');
  const finish = (template = false) => { const rule = routineRule(draft); if (!rule) return; app.addRoutine(rule, template); router.dismissAll(); router.navigate('/(tabs)/rules'); };
  const count = draft.appGroup.selectedApps.filter(Boolean).length + draft.appGroup.categories.length;
  const warning = <View style={[styles.warning, { flexDirection: 'row', alignItems: 'center', gap: 3 }]}><View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.warningDot, alignItems: 'center', justifyContent: 'center' }}><T size={9} color={colors.white} ls={0} style={{ lineHeight: 10 }}>!</T></View><T size={12} color={c.warning} ls={0}>Выбрать</T></View>;
  const badge = hasGroupSelection(draft.appGroup) ? <View style={styles.badge}><Icon name="apps-grid" width={14} height={14} color={l.ink} /><T size={14} weight={400} ls={0}>{count || 'Все'}</T></View> : warning;
  const subtitle = `Зарабатывайте время в приложениях${days ? ' после выполнения привычек с фото.' : ', выполняя привычки.'} Действует ${draft.days.length === 7 ? 'каждый день' : daysLabel(draft.days)}.`;
  return <SheetTransition backdrop={<Pressable accessibilityLabel="Закрыть рутину" onPress={dismiss} style={[StyleSheet.absoluteFill, { backgroundColor: l.backdrop }]} />}>
    <View style={[styles.sheet, { marginTop: Math.max(59, insets.top + 1) }]}>
      <ScrollView key={days ? 'days' : after ? selected ? 'selected' : 'after' : 'overview'} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {!compact && <RuleEditorHeader title={draft.title} fallback="Рутина" subtitle={subtitle} image={art.routinePlant} width={47} height={53} top={68} onTitleChange={title => patch({ title })} editLabel="Изменить название рутины" inputLabel="Название рутины" />}
        {after && <View style={{ height: 64, backgroundColor: colors.white }} />}
        {days && <View style={{ height: 108 }}><T size={14} weight={400} color={c.muted} center ls={0} style={{ position: 'absolute', top: 49, left: 28, right: 28, lineHeight: 18 }}>{subtitle}</T></View>}
        {(!after || !selected) && <View style={[styles.recommendation, { marginTop: days ? 22 : after ? 21 : 23 }]}><Icon name="chevron-down-section" width={10} height={8} color={c.muted} /><T size={20} color={c.muted} ls={0}>Рекомендации</T></View>}
        <View style={{ marginTop: after && selected ? 8 : 4 }}><RuleSuggestions items={[{ image: art.routineTemplateAdhd, title: 'При СДВГ', caption: '4 привычки' }, { image: art.routineTemplateClean, title: 'Уборка дома', caption: '5 привычек' }, { image: art.routineTemplatePositive, title: 'Позитив', caption: '5 привычек' }]} /></View>
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ marginTop: after && selected ? 22 : 20 }}><EditorRow title="Разблокировать" value={badge} onPress={() => setModal('apps')} /></View>
          {after ? <View style={[styles.after, { marginTop: selected ? 13 : 14, minHeight: selected ? 292 : 250 }]}>
            <PressScale accessibilityRole="button" accessibilityLabel="Свернуть привычки рутины" onPress={() => toggle('after')} style={styles.panelTitle}><Icon name="chevron-down-section" width={10} height={8} color={c.muted} style={{ transform: [{ rotate: '180deg' }] }} /><T size={20} ls={0}>После</T></PressScale>
            <View style={styles.segments}>{(['time', 'completion'] as const).map(mode => <PressScale key={mode} accessibilityRole="radio" accessibilityLabel={mode === 'time' ? 'Накопить время' : 'Выполнение привычек'} accessibilityState={{ checked: draft.earningMode === mode }} onPress={() => patch({ earningMode: mode })} style={[styles.segment, draft.earningMode === mode && { backgroundColor: c.blue, borderColor: c.blue }]}><T size={15} color={draft.earningMode === mode ? colors.white : c.muted} ls={0}>{draft.earningMode === mode ? '✓ ' : ''}{mode === 'time' ? 'Накопить время' : 'Выполнение'}</T></PressScale>)}</View>
            {selected && <View style={{ marginTop: 21 }}>{habits.filter(h => draft.habitIds.includes(h.id)).map(h => <PressScale key={h.id} accessibilityRole="button" accessibilityLabel={`Изменить привычку ${h.title}`} onPress={() => setModal('habits')} style={styles.selectedHabit}><View><T size={15} ls={0}>{h.title}</T><T size={12} weight={400} color={c.muted} ls={0} style={{ marginTop: 2 }}>ИИ-проверка</T></View><View style={styles.reward}><T size={12} color={c.muted} ls={0}>+ {h.minutes} мин</T></View><Icon name="chevron-right" width={8} height={12} color={c.edit} /></PressScale>)}</View>}
            <PressScale accessibilityRole="button" accessibilityLabel={selected ? 'Добавить ещё привычку' : 'Добавить привычку'} onPress={() => setModal('habits')} style={[styles.addHabit, selected ? { width: 174, height: 40, marginTop: 0, alignSelf: 'center', justifyContent: 'center', paddingHorizontal: 0 } : { marginTop: 20 }]}>{!selected && <View style={styles.plus}><Icon name="plus" width={12} height={14} color={c.muted} /></View>}{selected ? <><T size={13} weight={400} color={c.muted} ls={0}>Добавить ещё</T><View style={[styles.plus, { width: 23, height: 23, marginLeft: 10, marginRight: 0 }]}><Icon name="plus" width={12} height={14} color={c.muted} /></View></> : <View><T size={15} color={c.muted} ls={0}>Добавить привычку</T><T size={11} weight={400} color={c.muted} ls={0}>Приложения, прогулка, уборка и другое.</T></View>}</PressScale>
            <View style={[styles.earn, { marginTop: selected ? 20 : 19, paddingTop: selected ? 15 : 13 }]}><View accessibilityState={{ disabled: true }} style={styles.start}><T size={12} color={c.earned} ls={0}>Начать с: {draft.startingMinutes ? durationLabel(draft.startingMinutes) : '0 с'}</T><Icon name="lock-up-down" width={10} height={16} color={c.earned} /></View><T size={24} ls={0}>Даст {selected ? durationLabel(routineReward(draft)) : '0 с'}</T></View>
          </View> : <View style={{ marginTop: 14 }}><EditorRow title="После" onPress={() => toggle('after')} value={selected ? `${draft.earningMode === 'time' ? 'Накопить время' : 'Выполнение'}　│　${countLabel(draft.habitIds.length, 'привычка', 'привычки', 'привычек')}` : <View style={{ width: 207, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><T size={14} weight={400} ls={0}>За привычки</T>{warning}</View>} /></View>}
          {days ? <View style={styles.daysPanel}><PressScale accessibilityRole="button" accessibilityLabel="Свернуть дни рутины" onPress={() => toggle('days')} style={[styles.panelTitle, { height: 24 }]}><Icon name="chevron-down-section" width={10} height={8} color={c.muted} style={{ transform: [{ rotate: '180deg' }] }} /><T size={20} ls={0}>Активно</T></PressScale><View style={styles.allDay}><T size={15} weight={400} ls={0}>Весь день</T><FlowSwitch label="Рутина весь день" value={draft.allDay} onChange={allDay => patch({ allDay })} /></View><WeekdayPicker value={draft.days} onChange={days => patch({ days })} labelPrefix="День рутины" weight={700} style={{ marginTop: 10 }} /><T size={11} weight={400} color={c.muted} center ls={0} style={{ marginTop: 7 }}>Активно по дням недели ({draft.days.length}/7)</T></View> : <View style={{ marginTop: after ? 12 : 13 }}><EditorRow title="Активно" value={daysLabel(draft.days)} onPress={() => toggle('days')} /></View>}
        </View>
      </ScrollView>
      {compact && <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 64, backgroundColor: colors.white }} />}<View pointerEvents="none" style={styles.handle} />
      <View style={[styles.footer, { paddingBottom: Math.max(39, insets.bottom + 5) }]}><StrictModeRow value={draft.strict} description={draft.strict ? draft.strictScope === 'session' ? 'Активен во время сессии' : `Активен ${strictDaysLabel(draft.strictDays)}` : 'Без изменения и удаления'} onOpen={() => setModal('strict')} onChange={strict => strict ? setModal('strict') : patch({ strict: false })} style={{ marginLeft: 5 }} /><View style={[styles.actions, { marginTop: compact ? 26 : 24 }]}><SessionAction disabled={!canSaveRoutine(draft)} onPress={() => finish(true)}>Новый шаблон</SessionAction><SessionAction primary disabled={!canSaveRoutine(draft)} onPress={() => draft.strict ? setModal('confirm') : finish()}>Расписание</SessionAction></View></View>
    </View>
    {modal === 'apps' && <AppGroupSheet purpose="routine" value={draft.appGroup} onCancel={() => setModal(null)} onConfirm={appGroup => { patch({ appGroup }); setModal(null); }} />}
    {modal === 'habits' && <HabitPicker value={draft.habitIds} onCancel={() => setModal(null)} onSave={habitIds => { patch({ habitIds }); setModal(null); }} />}
    {modal === 'strict' && <StrictSettingsSheet value={draft} onCancel={() => setModal(null)} onActivate={settings => { patch({ ...settings, strict: true }); setModal(null); }} />}
    {modal === 'confirm' && <StrictConfirmation onCancel={() => setModal(null)} onContinue={() => finish()} />}
  </SheetTransition>;
}
const styles = StyleSheet.create({
  sheet: { flex: 1, borderRadius: 40, overflow: 'hidden', backgroundColor: l.surface }, handle: { position: 'absolute', zIndex: 5, top: 12, width: 64, height: 5, borderRadius: 4, alignSelf: 'center', backgroundColor: l.handle }, recommendation: { height: 26, marginHorizontal: 20, flexDirection: 'row', gap: 7, alignItems: 'center' }, warning: { borderRadius: 18, backgroundColor: c.warningFill, paddingHorizontal: 8, paddingVertical: 3 }, badge: { borderRadius: 18, backgroundColor: l.badge, paddingVertical: 5, paddingHorizontal: 10, flexDirection: 'row', gap: 4, alignItems: 'center' },
  after: { padding: 16, borderRadius: l.panelRadius, backgroundColor: colors.white }, panelTitle: { height: 26, flexDirection: 'row', gap: 10, alignItems: 'center' }, segments: { marginTop: 12, flexDirection: 'row', gap: 5 }, segment: { height: 41, paddingHorizontal: 15, borderWidth: 1, borderColor: c.segmentBorder, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }, addHabit: { height: 52, borderRadius: 28, borderWidth: 1, borderStyle: 'dashed', borderColor: c.addBorder, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }, plus: { width: 26, height: 26, borderRadius: 13, backgroundColor: c.addFill, justifyContent: 'center', alignItems: 'center', marginRight: 11 }, selectedHabit: { height: 52, flexDirection: 'row', alignItems: 'flex-start' }, reward: { marginLeft: 'auto', marginRight: 15, marginTop: 4, borderWidth: 1, borderColor: c.badgeBorder, borderRadius: 17, paddingVertical: 4, paddingHorizontal: 9 }, earn: { borderTopWidth: 1, borderTopColor: c.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, start: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 18, flexDirection: 'row', alignItems: 'center', backgroundColor: c.earnedFill },
  daysPanel: { marginTop: 13, height: 200, borderRadius: l.panelRadius, backgroundColor: colors.white, padding: 15 }, allDay: { marginTop: 17, height: 55, borderRadius: 18, backgroundColor: l.grid, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, footer: { paddingHorizontal: 20, backgroundColor: l.surface }, actions: { flexDirection: 'row', gap: 8 },
});
