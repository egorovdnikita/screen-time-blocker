import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GlassDialog } from '@/components/GlassDialog';
import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/motion';
import { SheetScrollView } from '@/components/SheetModal';
import { useAppState } from '@/state/app';
import { colors, interfaceTheme as c, mainSettingsTheme } from '@/theme/tokens';
import { T } from '@/theme/typography';
import { SettingsStack } from './SettingsStack';

// APP-26: что хранится на устройстве и полный сброс. Макета нет — собрано из стиля «Интерфейса».
// Системные ограничения в Expo Go не включаются, поэтому сброс не оставляет «осиротевших» блокировок.
export function DataSettings({ onClose }: { onClose: () => void }) {
  const app = useAppState();
  const [confirm, setConfirm] = useState(false);
  const [failed, setFailed] = useState(false);
  const rules = app.createdSessions.length + app.createdLocks.length + app.createdLimits.length + app.createdRoutines.length;
  const templates = app.savedTemplates.length + app.savedLimitTemplates.length + app.savedRoutineTemplates.length;
  const rows = [
    { title: 'Созданные правила', value: rules },
    { title: 'Шаблоны', value: templates },
    { title: 'Привычки и занятия', value: app.customHabits.length + app.customActivities.length },
    { title: 'Записи дневника', value: Object.keys(app.reflections).length },
    { title: 'Группы и экраны блокировки', value: app.namedGroups.length + app.customBlockScreens.length },
  ];
  const status = app.storage.readError ? 'Не удалось прочитать сохранённые данные. Изменения сейчас не сохраняются.'
    : app.storage.writeError ? 'Последние изменения не сохранились. Повторим при следующем изменении.'
    : app.storage.restoredBackup ? 'Сохранённые данные были повреждены. Их копия оставлена на устройстве, приложение начато заново.'
    : null;
  // После сброса вкладки сами уходят на знакомство 000 (onboardingCompleted = false), листы закрываются вместе с ними.
  const reset = async () => {
    const ok = await app.resetLocalData();
    if (!ok) { setFailed(true); setConfirm(true); }
  };
  return <SettingsStack onClose={onClose} surface={c.surface} radius={44}>
    <T size={20} center ls={0} style={{ position: 'absolute', top: 44, left: 20, right: 20, lineHeight: 26 }}>Данные на устройстве</T>
    <SheetScrollView accessibilityLabel="Данные на устройстве" style={{ marginTop: 100 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
      <T size={20} color={c.section} ls={0} style={{ lineHeight: 26 }}>Хранится на iPhone</T>
      <View style={[styles.group, { marginTop: 11 }]}>{rows.map((row, index) => <View key={row.title} accessibilityLabel={`${row.title}: ${row.value}`} style={[styles.row, index < rows.length - 1 && { borderBottomWidth: 1, borderColor: c.line }]}><T size={14.25} weight={400} variant="text" ls={0}>{row.title}</T><T size={17} color={c.value} ls={0} style={{ marginLeft: 'auto' }}>{row.value}</T></View>)}</View>
      <T size={13} weight={400} variant="text" color={c.value} ls={0} style={{ marginTop: 10, marginHorizontal: 4, lineHeight: 17 }}>Также сохраняются профиль, цель, напоминания и настройки. Аккаунта и облака нет: данные не покидают устройство и удаляются вместе с приложением.</T>
      {status && <View accessibilityRole="alert" style={[styles.group, styles.status]}><Icon name="shield-check" width={19} height={21} color={c.icon} /><T size={13} weight={400} variant="text" ls={0} style={{ flex: 1, lineHeight: 17 }}>{status}</T></View>}
      <PressScale accessibilityRole="button" accessibilityLabel="Удалить все данные" onPress={() => { setFailed(false); setConfirm(true); }} style={[styles.group, styles.row, { marginTop: 30, justifyContent: 'center' }]}><Icon name="reflection-trash" width={17} height={19} color={mainSettingsTheme.danger} /><T size={14.25} weight={500} variant="text" color={mainSettingsTheme.danger} ls={0}>Удалить все данные</T></PressScale>
    </SheetScrollView>
    {confirm && <GlassDialog name="удаление данных" title={failed ? 'Не удалось удалить' : 'Удалить все данные?'} titleWeight={700} titleSize={16} top={323} height={212} radius={31.623} blur={4} surface={c.alertSurface} titleTop={20} titleSide={29} buttonSide={15} buttonBottom={16} buttonRadius={28} buttonWeight={400} confirmLabel={failed ? 'Повторить' : 'Удалить'} cancelColor={c.alertCancel} confirmColor={mainSettingsTheme.danger} onCancel={() => setConfirm(false)} onConfirm={reset}><T size={14} weight={400} variant="text" color={c.alertInk} ls={0} style={{ position: 'absolute', top: 48, left: 29, right: 29, lineHeight: 20 }}>{failed ? 'Данные остались на устройстве без изменений. Попробуйте ещё раз.' : 'Правила, шаблоны, дневник и настройки будут удалены. Знакомство начнётся заново.'}</T></GlassDialog>}
  </SettingsStack>;
}
const styles = StyleSheet.create({
  group: { borderRadius: 20, backgroundColor: colors.white, overflow: 'hidden' },
  row: { height: 53.333, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  status: { marginTop: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13 },
});
