import { DarkButtonSurface } from '@/components/DarkButtonSurface';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { FlowSwitch } from '@/components/SessionPrimitives';
import { PressScale } from '@/components/motion';
import { useAppState } from '@/state/app';
import { T } from '@/theme/typography';
import { colors, settingsTheme as c, shareDevicesTheme as g } from '@/theme/tokens';

export function ShareDevicesGuide() {
  const app = useAppState();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const finish = () => { app.markShareGuideSeen(); router.replace('/(tabs)/rules'); };
  return <View style={{ flex: 1 }}><StatusBar style="dark" animated /><LinearGradient colors={[g.top, g.bottom]} style={StyleSheet.absoluteFill} /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: Math.max(852, height) }}>
    <PressScale accessibilityRole="button" accessibilityLabel="Пропустить инструкцию общего доступа" onPress={finish} style={[styles.close, { top: Math.max(79, insets.top + 20) }]}><Icon name="reflection-close" width={18} height={18} /></PressScale>
    <T size={27} color={g.ink} ls={-.4} style={{ marginTop: 157, marginHorizontal: 20, lineHeight: 33 }}>{'Выключите общий доступ\nв Экранном времени'}</T>
    <T size={14} weight={400} color={g.ink} ls={0} style={{ marginTop: 7, marginHorizontal: 20, lineHeight: 17 }}>{'Block нужна эта настройка для учёта времени. '}<T size={14} color={g.ink} ls={0}>Нет других устройств Apple? Пропустите шаг.</T></T>
    <View style={styles.setting}><View style={styles.settingRow}><T size={14} weight={400} variant="display" color={g.ink} ls={-.3} style={{ flexShrink: 1 }}>Общий доступ на устройствах</T><View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ marginLeft: 'auto' }}><FlowSwitch label="Пример выключенного общего доступа" value={false} onChange={() => {}} width={44} thumbWidth={24} /></View></View><T size={11.5} weight={400} variant="display" color={g.copy} ls={-.15} style={{ marginTop: 8, marginHorizontal: 14, lineHeight: 14 }}>{'Настройка доступна на любом устройстве с iCloud\nдля синхронизации Экранного времени.'}</T></View>
    <View style={styles.steps}>{['Откройте Настройки → Экранное время', 'Найдите настройку общего доступа', 'Убедитесь, что настройка выключена'].map((step, i) => <View key={step} style={styles.step}><View style={styles.number}><T size={13} color={colors.white} ls={0}>{i + 1}</T></View><T size={14.25} color={g.ink} ls={-.15}>{step}</T></View>)}</View>
    <PressScale accessibilityRole="button" accessibilityLabel="Завершить инструкцию общего доступа" onPress={finish} style={[styles.done, { bottom: Math.max(39, insets.bottom + 5) }]}><DarkButtonSurface /><T size={17} color={colors.white} ls={0}>Готово</T></PressScale>
  </ScrollView></View>;
}
const styles = StyleSheet.create({ close: { position: 'absolute', right: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, boxShadow: g.closeShadow, alignItems: 'center', justifyContent: 'center' }, setting: { position: 'absolute', top: 379, left: 23, right: 23, height: 115, paddingVertical: 18, paddingHorizontal: 14, borderWidth: 1, borderColor: g.border, borderRadius: 19, backgroundColor: g.setting }, settingRow: { height: 39, borderRadius: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.white }, steps: { position: 'absolute', top: 522, left: 80, right: 20, gap: 16 }, step: { height: 30, justifyContent: 'center' }, number: { position: 'absolute', left: -39, width: 22, height: 22, borderRadius: 11, backgroundColor: g.number, alignItems: 'center', justifyContent: 'center' }, done: { position: 'absolute', left: 20, right: 20, height: 60, borderRadius: 32, backgroundColor: c.dark, alignItems: 'center', justifyContent: 'center' } });
