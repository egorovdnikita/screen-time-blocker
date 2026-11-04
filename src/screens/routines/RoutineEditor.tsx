import { RuleEditorScrollView, RuleEditorScrollAnchor } from '@/components/RuleEditorScroll';
import { SheetTransition, SheetGrabber } from '@/components/SheetModal';
import { HabitForm } from './HabitForm';
import { useDarkStatusBar } from '@/components/useStatusBar';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RuleEditorScrollCap, RuleEditorHeader, RuleSuggestions } from '@/components/RuleEditorPieces';
import { WeekdayPicker } from '@/components/WeekdayPicker';
import { StrictModeRow } from '@/components/StrictModeRow';
import { EditorRow, FlowSwitch, SessionAction, EditorTone, ruleEditorTone } from '@/components/SessionPrimitives';
import { Icon } from '@/components/Icon';
import { PressScale, animateLayout } from '@/components/motion';
import { art } from '@/data/art';
import { hasGroupSelection, countLabel } from '@/data/appGroup';
import { initialRoutine, routineHabits, routineReward, routineRule, canSaveRoutine, type Habit, type RoutineDraft } from '@/data/routine';
import { durationLabel } from '@/data/session';
import { daysLabel } from '@/data/timeLimit';
import { useAppState } from '@/state/app';
import { ruleEditorSpacing, colors, settingsTheme, timeLimitTheme as l, routineTheme as c, habitFormTheme } from '@/theme/tokens';
import { T, TextInk } from '@/theme/typography';
import { AppGroupSheet } from '../session/AppGroupSheet';
import { StrictSettingsSheet, StrictConfirmation, strictDaysLabel } from '../session/StrictSettingsSheet';
import { RemoveRuleDialog } from '../rules/RemoveRuleDialog';
import { HabitPicker } from './HabitPicker';

export function RoutineEditor() {
  return <EditorTone.Provider value={ruleEditorTone}><TextInk.Provider value={settingsTheme.title}><RoutineEditorBody /></TextInk.Provider></EditorTone.Provider>;
}

function RoutineEditorBody() {
  const [swipeClosing, setSwipeClosing] = useState(false);
  const [afterClose, setAfterClose] = useState<(() => void) | null>(null);
  useDarkStatusBar();
  const app = useAppState();
  const { id } = useLocalSearchParams<{ id?: string }>();
  // Правило читается один раз: после удаления его уже нет в списке, а лист ещё закрывается.
  const [existing] = useState(() => app.createdRoutines.find(rule => rule.id === id));
  const [draft, setDraft] = useState<RoutineDraft>(() => existing?.configuration ?? initialRoutine());
  const [open, setOpen] = useState<'after' | 'days' | null>(null);
  const [modal, setModal] = useState<'apps' | 'habits' | 'library' | 'edit' | 'strict' | 'confirm' | 'remove' | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const insets = useSafeAreaInsets();
  const after = open === 'after', days = open === 'days', selected = draft.habitIds.length > 0;
  const compact = open !== null;
  const completion = after && draft.earningMode === 'completion';
  const patch = (update: Partial<RoutineDraft>) => { animateLayout(); setDraft(d => ({ ...d, ...update })); };
  const toggle = (next: typeof open) => { animateLayout(); setOpen(v => v === next ? null : next); };
  const dismiss = () => router.canGoBack() ? router.back() : router.replace('/(tabs)');
  const finish = (template = false) => { const rule = routineRule(draft); if (!rule) return; setAfterClose(() => () => { if (existing) app.updateRoutine({ ...rule, id: existing.id }); else app.addRoutine(rule, template); router.dismissAll(); router.navigate('/(tabs)/rules'); }); setSwipeClosing(true); };
  const count = draft.appGroup.selectedApps.filter(Boolean).length + draft.appGroup.categories.length;
  const warning = <View style={[styles.warning, { flexDirection: 'row', alignItems: 'center', gap: 3 }]}><View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.warningDot, alignItems: 'center', justifyContent: 'center' }}><T size={9} color={colors.white} ls={0} style={{ lineHeight: 10 }}>!</T></View><T size={12} color={c.warning} ls={0}>Выбрать</T></View>;
  const badge = hasGroupSelection(draft.appGroup) ? <View style={styles.badge}><Icon name="apps-grid" width={14} height={14} color={l.ink} /><T size={14} weight={600} color={l.ink} ls={0}>{count || 'Все'}</T></View> : warning;
  const subtitle = draft.earningMode === 'completion' ? `Завершайте привычки, чтобы разблокировать приложения. Действует ${draft.days.length === 7 ? 'каждый день' : daysLabel(draft.days)}.` : `Зарабатывайте время в приложениях${days ? ' после выполнения привычек с фото.' : ', выполняя привычки.'} Действует ${draft.days.length === 7 ? 'каждый день' : daysLabel(draft.days)}.`;
  return <SheetTransition closing={swipeClosing} onHidden={() => { if (afterClose) afterClose(); else dismiss(); }} onSwipeClose={() => setSwipeClosing(true)} backdrop={<Pressable accessibilityLabel="Закрыть рутину" onPress={() => setSwipeClosing(true)} style={[StyleSheet.absoluteFill, { backgroundColor: draft.earningMode === 'completion' ? habitFormTheme.backdrop : l.backdrop }]} />}>
    <View style={[styles.sheet, { marginTop: Math.max(59, insets.top + 1) }]}>
      <RuleEditorScrollView focusOffset={after ? completion ? 21 : 23 : 0} focus={open} accessibilityLabel="Содержимое редактора рутины" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: ruleEditorSpacing.scrollBottom }}>
        <RuleEditorHeader title={draft.title} fallback="Рутина" subtitle={subtitle} subtitleColor={c.subtitle} image={art.routinePlant} width={47} height={53} top={68} onTitleChange={title => patch({ title })} editLabel="Изменить название рутины" inputLabel="Название рутины" />
        <View style={[styles.recommendation, { marginTop: 23 }]}><Icon name="chevron-down-section" width={10} height={8} color={c.muted} /><T size={20} color={c.muted} ls={0}>Рекомендации</T></View>
        <View style={{ marginTop: completion ? 5.333 : after && selected ? 8 : 4 }}><RuleSuggestions items={[{ image: art.routineTemplateAdhd, title: 'При СДВГ', caption: '4 привычки' }, { image: art.routineTemplateClean, title: 'Уборка дома', caption: '5 привычек' }, { image: art.routineTemplatePositive, title: 'Позитив', caption: '5 привычек' }]} /></View>
        <RuleEditorScrollAnchor style={{ paddingHorizontal: 20 }}>
          <View style={{ marginTop: completion ? 21 : after && selected ? 22 : 20 }}><EditorRow title="Разблокировать" value={badge} onPress={() => setModal('apps')} /></View>
          {after ? <View style={[styles.after, { marginTop: completion ? 12.667 : selected ? 13 : 14, minHeight: completion ? 244 : selected ? 292 : 250, paddingTop: completion ? 15 : 16 }]}>
            <PressScale accessibilityRole="button" accessibilityLabel="Свернуть привычки рутины" onPress={() => toggle('after')} style={styles.panelTitle}><Icon name="chevron-down-section" width={10} height={8} color={c.muted} style={{ transform: [{ rotate: '180deg' }] }} /><T size={20} ls={0}>После</T></PressScale>
            <View style={[styles.segments, completion && { gap: 4 }]}>{(['time', 'completion'] as const).map(mode => <PressScale key={mode} accessibilityRole="radio" accessibilityLabel={mode === 'time' ? 'Накопить время' : 'Выполнение привычек'} accessibilityState={{ checked: draft.earningMode === mode }} onPress={() => patch({ earningMode: mode })} style={[styles.segment, completion && { width: mode === 'completion' ? 136 : 140, paddingHorizontal: 0 }, draft.earningMode === mode && { backgroundColor: completion ? c.completionBlue : c.blue, borderColor: completion ? c.completionBlue : c.blue }]}><T size={15} color={draft.earningMode === mode ? colors.white : c.muted} ls={0}>{draft.earningMode === mode ? '✓ ' : ''}{mode === 'time' ? 'Накопить время' : 'Выполнение'}</T></PressScale>)}</View>
            {selected && <View style={{ marginTop: 21 }}>{routineHabits(draft).map(h => <PressScale key={h.id} accessibilityRole="button" accessibilityLabel={`Изменить привычку ${h.title}`} onPress={() => { setEditingHabit(h); setModal('edit'); }} style={[styles.selectedHabit, completion && { height: 45 }]}><View><T size={15} ls={0}>{h.title}</T><T size={12} weight={400} color={c.muted} ls={0} style={{ marginTop: 2 }}>ИИ-проверка</T></View>{!completion && <View style={styles.reward}><T size={12} color={c.muted} ls={0}>+ {h.minutes} мин</T></View>}<Icon name="chevron-right" width={completion ? 13 : 8} height={completion ? 20 : 12} color={c.edit} /></PressScale>)}</View>}
            <PressScale accessibilityRole="button" accessibilityLabel={selected ? 'Добавить ещё привычку' : 'Добавить привычку'} onPress={() => setModal(selected ? 'library' : 'habits')} style={[styles.addHabit, selected ? { width: 174, height: 40, marginTop: completion ? 7 : 0, alignSelf: 'center', justifyContent: 'center', paddingHorizontal: 0 } : { marginTop: 20 }]}>{!selected && <View style={styles.plus}><Icon name="plus" width={12} height={14} color={c.muted} /></View>}{selected ? <><T size={13} weight={400} color={c.muted} ls={0}>Добавить ещё</T><View style={[styles.plus, { width: 23, height: 23, marginLeft: 10, marginRight: 0 }]}><Icon name="plus" width={12} height={14} color={c.muted} /></View></> : <View><T size={15} color={c.muted} ls={0}>Добавить привычку</T><T size={11} weight={400} color={c.muted} ls={0}>Приложения, прогулка, уборка и другое.</T></View>}</PressScale>
            {!completion && <View style={[styles.earn, { marginTop: selected ? 20 : 19, paddingTop: selected ? 15 : 13 }]}><View accessibilityState={{ disabled: true }} style={styles.start}><T size={12} color={c.earned} ls={0}>Начать с: {draft.startingMinutes ? durationLabel(draft.startingMinutes) : '0 с'}</T><Icon name="lock-up-down" width={10} height={16} color={c.earned} /></View><T size={24} ls={0}>Даст {selected ? durationLabel(routineReward(draft)) : '0 с'}</T></View>}
          </View> : <View style={{ marginTop: 14 }}><EditorRow title="После" onPress={() => toggle('after')} value={selected ? `${draft.earningMode === 'time' ? 'Накопить время' : 'Выполнение'}　│　${countLabel(draft.habitIds.length, 'привычка', 'привычки', 'привычек')}` : <View style={{ width: 207, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><T size={14} weight={400} ls={0}>За привычки</T>{warning}</View>} /></View>}
          {days ? <View style={styles.daysPanel}><PressScale accessibilityRole="button" accessibilityLabel="Свернуть дни рутины" onPress={() => toggle('days')} style={[styles.panelTitle, { height: 24 }]}><Icon name="chevron-down-section" width={10} height={8} color={c.muted} style={{ transform: [{ rotate: '180deg' }] }} /><T size={20} ls={0}>Активно</T></PressScale><View style={styles.allDay}><T size={15} weight={400} ls={0}>Весь день</T><FlowSwitch label="Рутина весь день" value={draft.allDay} onChange={allDay => patch({ allDay })} /></View><WeekdayPicker value={draft.days} onChange={days => patch({ days })} labelPrefix="День рутины" weight={700} style={{ marginTop: 10 }} /><T size={11} weight={400} color={c.muted} center ls={0} style={{ marginTop: 7 }}>Активно по дням недели ({draft.days.length}/7)</T></View> : <View style={{ marginTop: completion ? 12.333 : after ? 12 : 13 }}><EditorRow title="Активно" value={daysLabel(draft.days)} onPress={() => toggle('days')} /></View>}
        </RuleEditorScrollAnchor>
      </RuleEditorScrollView>
      <RuleEditorScrollCap active={compact} />
      <SheetGrabber style={styles.handle} />
      <View style={[styles.footer, { paddingBottom: Math.max(39, insets.bottom + 5) }]}><StrictModeRow value={draft.strict} description={draft.strict ? draft.strictScope === 'session' ? 'Активен во время сессии' : `Активен ${strictDaysLabel(draft.strictDays)}` : 'Без изменения и удаления'} onOpen={() => setModal('strict')} onChange={strict => strict ? setModal('strict') : patch({ strict: false })} style={{ marginLeft: 5 }} /><View style={[styles.actions, { marginTop: compact ? 26 : 24 }]}>{existing ? <SessionAction onPress={() => setModal('remove')}>Удалить</SessionAction> : <SessionAction disabled={!canSaveRoutine(draft)} onPress={() => finish(true)}>Новый шаблон</SessionAction>}<SessionAction primary disabled={!canSaveRoutine(draft)} onPress={() => draft.strict ? setModal('confirm') : finish()}>{existing ? 'Сохранить' : 'Расписание'}</SessionAction></View></View>
    </View>
    {modal === 'apps' && <AppGroupSheet purpose="routine" value={draft.appGroup} onCancel={() => setModal(null)} onConfirm={appGroup => { patch({ appGroup }); setModal(null); }} />}
    {(modal === 'habits' || modal === 'library') && <HabitPicker library={modal === 'library'} value={modal === 'library' ? [] : draft.habitIds} onCancel={() => setModal(null)} onSave={(ids, definitions) => { const habitIds = modal === 'library' ? [...new Set([...draft.habitIds, ...ids])] : ids; const previous = routineHabits(draft); patch({ habitIds, habitDefinitions: habitIds.map(id => definitions.find(h => h.id === id) ?? previous.find(h => h.id === id)!).filter(Boolean).map(h => ({ ...h })) }); setModal(null); }} />}
    {modal === 'edit' && editingHabit && <HabitForm value={editingHabit} onCancel={() => setModal(null)} onSave={habit => { app.upsertHabit(habit); patch({ habitDefinitions: routineHabits(draft).map(h => h.id === habit.id ? { ...habit } : { ...h }) }); setModal(null); }} />}
    {modal === 'strict' && <StrictSettingsSheet value={draft} onCancel={() => setModal(null)} onActivate={settings => { patch({ ...settings, strict: true }); setModal(null); }} />}
    {modal === 'confirm' && <StrictConfirmation onCancel={() => setModal(null)} onContinue={() => finish()} />}
    {modal === 'remove' && existing && <RemoveRuleDialog id={existing.id} title={existing.title} strict={false} onClose={() => setModal(null)} onDeleted={() => setSwipeClosing(true)} />}
  </SheetTransition>;
}
const styles = StyleSheet.create({
  sheet: { flex: 1, borderRadius: 40, overflow: 'hidden', backgroundColor: l.surface }, handle: { position: 'absolute', zIndex: 5, top: 12, width: 64, height: 5, borderRadius: 4, alignSelf: 'center', backgroundColor: l.handle }, recommendation: { height: 26, marginHorizontal: 20, flexDirection: 'row', gap: 7, alignItems: 'center' }, warning: { borderRadius: 18, backgroundColor: c.warningFill, paddingHorizontal: 8, paddingVertical: 3 }, badge: { borderRadius: 18, backgroundColor: l.badge, paddingVertical: 5, paddingHorizontal: 10, flexDirection: 'row', gap: 4, alignItems: 'center' },
  after: { padding: 16, borderRadius: l.panelRadius, backgroundColor: colors.white }, panelTitle: { height: 26, flexDirection: 'row', gap: 10, alignItems: 'center' }, segments: { marginTop: 12, flexDirection: 'row', gap: 5 }, segment: { height: 41, paddingHorizontal: 15, borderWidth: 1, borderColor: c.segmentBorder, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }, addHabit: { height: 52, borderRadius: 28, borderWidth: 1, borderStyle: 'dashed', borderColor: c.addBorder, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }, plus: { width: 26, height: 26, borderRadius: 13, backgroundColor: c.addFill, justifyContent: 'center', alignItems: 'center', marginRight: 11 }, selectedHabit: { height: 52, flexDirection: 'row', alignItems: 'flex-start' }, reward: { marginLeft: 'auto', marginRight: 15, marginTop: 4, borderWidth: 1, borderColor: c.badgeBorder, borderRadius: 17, paddingVertical: 4, paddingHorizontal: 9 }, earn: { borderTopWidth: 1, borderTopColor: c.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, start: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 18, flexDirection: 'row', alignItems: 'center', backgroundColor: c.earnedFill },
  daysPanel: { marginTop: 13, height: 200, borderRadius: l.panelRadius, backgroundColor: colors.white, padding: 15 }, allDay: { marginTop: 17, height: 55, borderRadius: 18, backgroundColor: l.grid, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, footer: { paddingHorizontal: 20, paddingTop: ruleEditorSpacing.footerTop, backgroundColor: l.surface }, actions: { flexDirection: 'row', gap: 8 },
});
