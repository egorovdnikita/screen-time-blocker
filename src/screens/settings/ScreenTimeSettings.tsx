import { SheetScrollView as ScrollView } from '@/components/SheetModal';
import { EstimatedTime } from './EstimatedTime';
import { Reminders } from './Reminders';
import { remindersEnabled } from '@/data/reminders';
import { DailyGoal } from './DailyGoal';
import { currentGoalDay, goalTimeLabel } from '@/data/dailyGoal';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/motion';
import { activityCatalog } from '@/data/reflection';
import { useAppState } from '@/state/app';
import { T } from '@/theme/typography';
import { colors, dailyGoalTheme as g, settingsTheme as c } from '@/theme/tokens';
import { SettingsStack } from './SettingsStack';
import { ActivityCatalog } from './ActivityCatalog';

export function ScreenTimeSettings({ onClose, nested = false }: { onClose: () => void; nested?: boolean }) {
  const app = useAppState();
  const [estimated, setEstimated] = useState(false);
  const [activities, setActivities] = useState(false);
  const [reminders, setReminders] = useState(false);
  const [daily, setDaily] = useState(false);
  const [notice, setNotice] = useState(0);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(0), 2800); return () => clearTimeout(timer); }, [notice]);
  const goal = app.dailyGoals?.[currentGoalDay(app.period)] ?? app.dailyGoalMinutes ?? 260;
  const goalLabel = goalTimeLabel(goal);
  return <SettingsStack root={!nested} surface={c.surface} onClose={onClose}><ScrollView contentContainerStyle={{ minHeight: 720, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
    <T size={18} color={c.title} center ls={0} style={{ marginTop: 44, lineHeight: 25 }}>Настройки времени</T>
    <T size={20} color={c.section} ls={0} style={{ marginTop: 31, marginHorizontal: 20, lineHeight: 24 }}>Цель на день</T>
    <View style={styles.goal}><PressScale accessibilityRole="button" accessibilityLabel="Уменьшить цель на день" disabled={goal <= 5} onPress={() => app.setDailyGoalMinutes(goal - 5)} style={[styles.step, { left: 52 }, reminders && { backgroundColor: c.transparent, boxShadow: undefined }]}><T size={23} variant="text" weight={500} color={c.title} ls={0}>−</T></PressScale><T size={37} color={c.ink} ls={-.6}>{app.dailyGoalEnabled ? `${goalLabel}/день` : 'Выкл.'}</T><PressScale accessibilityRole="button" accessibilityLabel="Увеличить цель на день" disabled={goal >= 1440} onPress={() => app.setDailyGoalMinutes(goal + 5)} style={[styles.step, { right: 52 }, reminders && { backgroundColor: c.transparent, boxShadow: undefined }]}><T size={23} variant="text" weight={500} color={c.title} ls={0}>+</T></PressScale></View>
    <PressScale accessibilityRole="button" accessibilityLabel="Настроить дни цели" onPress={() => setDaily(true)} style={{ marginTop: 13, height: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}><T size={14} color={c.title} ls={0}>Настроить дни</T><Icon name="chevron-right" width={9} height={12} color={c.chevron} /></PressScale>
    <PressScale accessibilityRole="button" accessibilityLabel="Настроить напоминания" onPress={() => setReminders(true)} style={[styles.row, { marginHorizontal: 20, marginTop: 23, height: 52, borderRadius: 18 }]}><Icon name="settings-bell" width={15} height={17} color={c.icon} /><T size={14} weight={500} color={c.title} ls={0} style={{ marginLeft: 17 }}>Напоминания</T><T size={14} color={c.value} ls={0} style={{ marginLeft: 'auto', marginRight: 20 }}>{remindersEnabled(app.reminders) ? 'Вкл.' : 'Выкл.'}</T><Icon name="chevron-right" width={8} height={13} color={c.chevron} /></PressScale>
    <T size={11.5} weight={600} color={c.note} ls={0} style={{ marginTop: 9, marginHorizontal: 20, lineHeight: 15 }}>{'Цель за день не блокирует приложения.\nДля блокировки добавьте лимит времени. ↗'}</T>
    <T size={20} color={c.section} ls={0} style={{ marginHorizontal: 20, marginTop: 29, lineHeight: 24 }}>Настройка</T>
    <View style={styles.rows}>{[
      { icon: 'screen-excluded' as const, title: 'Исключённые приложения', value: String(new Set([...app.excluded, ...app.reflectionExcluded.map(key => key.slice(key.lastIndexOf(':') + 1))]).size) },
      { icon: 'screen-activities' as const, title: 'Активности', value: String(activityCatalog(app.customActivities).length), onPress: () => setActivities(true) },
      { icon: 'screen-before' as const, title: 'До установки', value: '7 ч' },
      { icon: 'screen-estimate' as const, title: 'Примерное время', value: goalTimeLabel(app.estimatedMinutes), onPress: () => setEstimated(true) },
    ].map((item, i) => <PressScale key={item.title} accessibilityRole="button" accessibilityLabel={`Настройки: ${item.title}`} disabled={!item.onPress} accessibilityState={{ disabled: !item.onPress }} onPress={item.onPress} style={[styles.row, i < 3 && { borderBottomWidth: 1, borderBottomColor: c.border }]}><Icon name={item.icon} width={16} height={16} color={c.icon} /><T size={14} weight={500} color={c.title} ls={0} style={{ marginLeft: 16 }}>{item.title}</T><T size={14} color={c.value} ls={0} style={{ marginLeft: 'auto', marginRight: 24 }}>{item.value}</T><Icon name="chevron-right" width={8} height={13} color={c.chevron} /></PressScale>)}</View>
  </ScrollView>{!!notice && <View accessibilityLiveRegion="polite" style={{ position: 'absolute', zIndex: 10, top: 12.667, left: 16, right: 15, height: 50, borderRadius: 16, paddingHorizontal: 14, backgroundColor: g.toast, boxShadow: g.toastShadow, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 14 }}><Icon name="reflection-confirm" width={18} height={20} color={colors.white} /><T size={14} weight={600} color={colors.white} ls={0}>Изменения сохранены</T></View>}{reminders && <Reminders value={app.reminders} acknowledged={app.remindersAcknowledged} onClose={() => setReminders(false)} onSave={value => { app.saveReminders(value); setReminders(false); setNotice(Date.now()); }} />}{daily && <DailyGoal value={app.dailyGoals ?? Array(7).fill(goal)} onClose={() => setDaily(false)} onSave={days => { app.saveDailyGoals(days); setDaily(false); setNotice(Date.now()); }} onDisable={() => { app.disableDailyGoal(); setDaily(false); setNotice(Date.now()); }} />}{estimated && <EstimatedTime onClose={() => setEstimated(false)} />}{activities && <ActivityCatalog onClose={() => setActivities(false)} />}</SettingsStack>;
}
const styles = StyleSheet.create({
  goal: { height: 46, marginTop: 37, alignItems: 'center', justifyContent: 'center' }, step: { position: 'absolute', top: 1, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, boxShadow: c.stepShadow, alignItems: 'center', justifyContent: 'center' }, row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 53, backgroundColor: colors.white }, rows: { marginTop: 11, marginHorizontal: 20, borderRadius: 18, overflow: 'hidden' },
});
