import { SheetScrollView as ScrollView } from '@/components/SheetModal';
import { useRef, useState, type ComponentRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { PlainSettingsSheet } from '@/components/PlainSettingsSheet';
import { PressScale } from '@/components/motion';
import { DarkButtonSurface } from '@/components/DarkButtonSurface';
import { FlowSwitch } from '@/components/SessionPrimitives';
import { Icon, type IconName } from '@/components/Icon';
import { art } from '@/data/art';
import { troubleshootSteps } from '@/data/troubleshoot';
import { useAppState } from '@/state/app';
import { T } from '@/theme/typography';
import { colors, troubleshootTheme as c } from '@/theme/tokens';

const issues = [
  [art.troubleshootUnlocked, 'Приложения не блокируются'],
  [art.troubleshootLocked, 'Блокируются лишние приложения'],
  [art.troubleshootHourglass, 'Лимит времени не работает'],
  [art.troubleshootCross, 'Не работает список исключений'],
  [art.troubleshootPhone, 'Не работает выбор приложений'],
  [art.troubleshootNerd, 'Приватный просмотр выключен'],
  [art.namedGroupForbidden, 'Не удаётся удалить приложения'],
  [art.troubleshootTrash, 'Приложения блокируются\nпосле удаления Block'],
] as const;
// Один прокручиваемый лист:217/218 — продолжение213, а не отдельные страницы.
export function Troubleshoot({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [options, setOptions] = useState(false);
  const tabs = useRef<ComponentRef<typeof ScrollView>>(null);
  const app = useAppState();
  const data = troubleshootSteps[step];
  const settingsTop = useRef(Number.POSITIVE_INFINITY);
  const choose = (next: number) => { setStep(next); tabs.current?.scrollTo({ x: next < 2 ? 0 : next === 2 ? 51.667 : 50.333, animated: false }); };
  return <PlainSettingsSheet title="Решение проблем" onClose={onClose} surface={options ? c.options : c.surface}>
    <ScrollView accessibilityLabel="Руководство по решению проблем" showsVerticalScrollIndicator={false} scrollEventThrottle={32} onScroll={e => setOptions(e.nativeEvent.contentOffset.y > settingsTop.current - 391)} style={styles.scroll} contentContainerStyle={{ paddingTop: 2, paddingBottom: app.live ? 40 : 115 }}>
      <T size={20} color={c.section} ls={0} style={{ marginHorizontal: 20, lineHeight: 24 }}>{'Сбой блокировки? Попробуйте\n4 шага'}</T>
      <View testID="troubleshoot-panel" style={[styles.panel, { height: data.height }]}>
        <View style={styles.tabs}><ScrollView ref={tabs} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4, minWidth: 394 }}>{troubleshootSteps.map((_, index) => <PressScale accessibilityRole="button" accessibilityLabel={`Решение проблем: шаг ${index + 1}`} accessibilityState={{ selected: step === index }} onPress={() => choose(index)} key={index} style={[styles.tab, { width: step === index ? index === 0 ? 97 : 99 : 77.333 }, step === index && { backgroundColor: c.active, borderColor: c.active }]}>{step === index && <Icon name="reflection-confirm" width={14} height={16} color={colors.white} />}<T size={14.25} color={step === index ? colors.white : c.caption} ls={0}>Шаг {index + 1}</T></PressScale>)}</ScrollView><LinearGradient pointerEvents="none" colors={['#ffffff00', colors.white]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 20 }} /></View>
        <T size={20} ls={-.25} style={{ position: 'absolute', top: 78, left: 16, right: 16, lineHeight: 24 }}>{data.title}</T>
        <T variant="text" weight={400} size={14.25} ls={0} style={{ position: 'absolute', left: 16, right: 16, top: step === 0 ? 110 : 134, lineHeight: 18 }}>{data.p1}</T>
        {!!data.p2 && <T variant="text" weight={400} size={14.25} ls={0} style={{ position: 'absolute', left: 16, right: 8, top: step === 0 ? 164 : 224, lineHeight: 18 }}>{step === 0 ? data.p2 : <><T variant="text" weight={600} size={14.25} ls={0} style={{ lineHeight: 18 }}>{data.p2.slice(0, step === 1 ? data.p2.indexOf('\nНапример') : data.p2.indexOf(' Проверьте'))}</T>{data.p2.slice(step === 1 ? data.p2.indexOf('\nНапример') : data.p2.indexOf(' Проверьте'))}</>}</T>}
        {step === 0 && <SystemAction title="Сбросить блокировку" icon="help-reset" top={256} />}
        {step === 2 && <><SystemAction title="Подключить" icon="help-reconnect" top={315} muted /><T size={11.75} weight={500} color={c.caption} ls={0} center style={{ position: 'absolute', left: 12, right: 12, top: 365, lineHeight: 16 }}>Строгий режим. Подключение — после его окончания.</T></>}
        {step === 3 && <><SystemAction title="Перезапустить iPhone" icon="daily-goal-power" top={226} /><SystemAction title="Обновить iPhone или iPad" icon="help-update" top={276} /></>}
      </View>
      {!app.live && <><T size={20} color={c.section} ls={0} style={{ marginTop: step === 2 ? 33 : 32, marginLeft: 20, lineHeight: 25 }}>Не исправилось?</T>
      <View style={{ marginTop: 11, marginHorizontal: 20, gap: 8 }}>{issues.map(([image, title], index) => <View key={title} accessibilityState={{ disabled: true }} style={[styles.issue, { height: index === 7 ? 68 : 56 }]}><Image source={image} contentFit="contain" style={{ width: 22, height: 22 }} /><T variant="text" weight={400} size={14.25} ls={0} style={{ flex: 1, lineHeight: 18 }}>{title}</T><Icon name="activity-row-chevron" width={13} height={20} /></View>)}</View></>}
      {/* Переключатели ничего не меняют без нативного слоя: в реальном режиме скрыты. */}{!app.live && <><T onLayout={e => { settingsTop.current = e.nativeEvent.layout.y; }} size={20} color={c.section} ls={0} style={{ marginTop: app.live ? 32 : 31, marginLeft: 20, lineHeight: 25 }}>Другие настройки</T>
      <View style={styles.settings}>{([{ key: 'hideIcons', icon: 'help-hide-icons', title: 'Скрывать иконки', note: 'Если приложения\nчасто зависают.' }, { key: 'realTime', icon: 'help-realtime', title: 'Учёт в реальном времени', note: 'Выключите, если лимиты\nработают нестабильно.' }] as const).map((row, index) => <View key={row.key} style={[styles.setting, index === 0 && { borderBottomWidth: 1, borderBottomColor: c.separator }]}><Icon name={row.icon} width={20} height={21} /><View style={{ flex: 1 }}><T size={14.25} variant="text" weight={400} ls={0} style={{ lineHeight: 18 }}>{row.title}</T><T size={13} color={c.caption} variant="text" weight={400} ls={0} style={{ lineHeight: 17 }}>{row.note}</T></View><FlowSwitch label={row.title} value={app.troubleshooting[row.key]} onChange={value => app.setTroubleshooting({ ...app.troubleshooting, [row.key]: value })} trackColor={{ true: c.switchOn, false: c.switchOff }} /></View>)}</View></>}
      {!app.live && <><View accessibilityState={{ disabled: true }} style={styles.contact}><Icon name="help-contact" width={12} height={12} /><T size={14} ls={0}>Написать нам</T></View>
      <T size={11.5} weight={500} color={c.caption} center ls={0} style={{ marginTop: 12, marginHorizontal: 20, lineHeight: 14 }}>{'Нас двое, мы работаем из Франции 🇫🇷.\nЧитаем и отвечаем всем, но из-за разницы во времени\nответ может прийти с задержкой.'}</T></>}
    </ScrollView>
  </PlainSettingsSheet>;
}
function SystemAction({ title, icon, top, muted: mutedProp }: { title: string; icon: IconName; top: number; muted?: boolean }) {
  // Системных действий нет без нативного слоя: реальный пользователь видит выключенную кнопку.
  const { live } = useAppState(), muted = mutedProp || live;
  return <View accessibilityLabel={title} accessibilityState={{ disabled: true }} accessibilityHint="Системное действие пока не подключено" style={[styles.action, { top, backgroundColor: muted ? c.disabled : c.ink }]}>{!muted && <DarkButtonSurface radius={24} />}<Icon name={icon} width={14} height={17} color={muted ? c.disabledText : colors.white} /><T size={14.25} color={muted ? c.disabledText : colors.white} ls={0}>{title}</T></View>;
}
const styles = StyleSheet.create({ scroll: { position: 'absolute', left: 0, right: 0, top: 100, bottom: 0 }, panel: { marginTop: 11, marginHorizontal: 20, borderRadius: 34, backgroundColor: colors.white, boxShadow: c.panelShadow, overflow: 'hidden' }, tabs: { position: 'absolute', left: 16, right: 16, top: 16, height: 42 }, tab: { height: 42, borderRadius: 24, borderWidth: 1, borderColor: c.border, flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'center' }, action: { position: 'absolute', left: 16, right: 16, height: 42, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }, issue: { borderRadius: 20, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 }, settings: { marginTop: 11, marginHorizontal: 20, height: 169, borderRadius: 24, backgroundColor: colors.white, overflow: 'hidden' }, setting: { height: 84.5, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }, contact: { marginTop: 52, alignSelf: 'center', height: 33, borderRadius: 20, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.white, boxShadow: c.contactShadow } });
