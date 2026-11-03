import { AppIconPicker } from './AppIconPicker';
import { appIcons } from '@/data/preferences';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SettingsStack } from './SettingsStack';
import { SheetScrollView } from '@/components/SheetModal';
import { FlowSwitch } from '@/components/SessionPrimitives';
import { Icon } from '@/components/Icon';
import { GlassDialog } from '@/components/GlassDialog';
import { PressScale } from '@/components/motion';
import { BlockScreens } from '@/screens/rules/BlockScreens';
import { useAppState } from '@/state/app';
import { colors, interfaceTheme as c } from '@/theme/tokens';
import { T } from '@/theme/typography';

export function InterfaceSettings({ onClose, initialPicker = false, demoAlert = false }: { onClose: () => void; initialPicker?: boolean; demoAlert?: boolean }) {
  const app = useAppState(); const [warning, setWarning] = useState(false), [screens, setScreens] = useState(false);
  const [picker, setPicker] = useState(false);
  return <SettingsStack onShown={() => { if(initialPicker) setPicker(true); }} onClose={onClose} surface={c.surface} radius={44}><T size={20} center ls={0} style={{ position: 'absolute', top: 44, left: 20, right: 20, lineHeight: 26 }}>Интерфейс</T>
    <SheetScrollView accessibilityLabel="Настройки интерфейса" style={{ marginTop: 100 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
      <T size={20} color={c.section} ls={0} style={{ lineHeight: 26 }}>Внешний вид</T>
      <View style={[styles.group, { marginTop: 11 }]}>
        <View accessibilityState={{ disabled: true }} style={[styles.basic, { borderBottomWidth: 1, borderColor: c.line }]}><Icon name="interface-theme" width={19} height={21} color={c.icon} /><T size={14.25} weight={400} variant="text" ls={0}>Тема</T><T size={17} color={c.value} ls={0} style={{ marginLeft: 'auto' }}>Система</T><Icon name="updown" width={16} height={18} color={c.chevron} /></View>
        <PressScale accessibilityRole="button" accessibilityLabel="Иконка приложения" onPress={() => setPicker(true)} style={[styles.basic, { height: 56.333 }]}><Icon name="interface-app" width={19} height={21} color={c.icon} /><T size={14.25} weight={400} variant="text" ls={0}>Иконка приложения</T><Image source={appIcons.find(item=>item.id===app.appIcon)!.image} style={{width:24,height:24,borderRadius:6,marginLeft:'auto'}} /><Icon name="activity-row-chevron" width={13} height={20} /></PressScale>
      </View>
      <View style={[styles.group, { marginTop: 11.666 }]}>
        <View style={[styles.feature, { height: 67.667, borderBottomWidth: 1, borderColor: c.line }]}><Icon name="interface-flame" width={19} height={21} color={c.icon} /><View style={{ flex: 1 }}><T size={14.25} weight={400} variant="text" ls={0}>Серия</T><T size={13} weight={400} variant="text" color={c.value} ls={0} style={{ lineHeight: 17 }}>Показывать серии в правилах</T></View><FlowSwitch label="Показывать серии в правилах" value={app.interfaceSettings.streak} onChange={streak => app.setInterfaceSettings({ ...app.interfaceSettings, streak })} /></View>
        <View style={[styles.feature, { height: 101 }]}><T size={20} color={c.icon} ls={-1} style={{ width: 19 }}>Aa</T><View style={{ flex: 1 }}><T size={14.25} weight={400} variant="text" ls={0}>Спецсимволы</T><T size={13} weight={400} variant="text" color={c.value} ls={0} style={{ lineHeight: 17 }}>{'Добавлять спецсимволы\nв случайные коды\nприложения'}</T></View><FlowSwitch label="Спецсимволы в случайных кодах" value={app.interfaceSettings.special} onChange={special => special ? setWarning(true) : app.setInterfaceSettings({ ...app.interfaceSettings, special: false })} /></View>
      </View>
      <T size={20} color={c.section} ls={0} style={{ lineHeight: 26, marginTop: 30 }}>Экраны блокировки</T>
      <PressScale accessibilityRole="button" accessibilityLabel="Интерфейс: экраны блокировки" onPress={() => setScreens(true)} style={[styles.group, styles.feature, { marginTop: 11.333, height: 84 }]}><Icon name="shield-check" width={19} height={21} color={c.icon} /><View style={{ flex: 1 }}><T size={14.25} weight={400} variant="text" ls={0}>Экраны блокировки</T><T size={13} weight={400} variant="text" color={c.value} ls={0} style={{ lineHeight: 17 }}>{'Что показывать поверх\nзаблокированных приложений.'}</T></View><Icon name="activity-row-chevron" width={13} height={20} /></PressScale>
    </SheetScrollView>
    {warning && <GlassDialog name="спецсимволы" title="Перед продолжением" titleWeight={700} titleSize={16} top={323} height={232} radius={31.623} blur={4} surface={c.alertSurface} titleTop={20} titleSide={29} buttonSide={15} buttonBottom={16} buttonRadius={28} buttonWeight={400} confirmLabel="Продолжить" cancelColor={c.alertCancel} confirmColor={c.alertConfirm} onCancel={() => setWarning(false)} onConfirm={() => { app.setInterfaceSettings({ ...app.interfaceSettings, special: true }); setWarning(false); }}><T size={14} weight={400} variant="text" color={c.alertInk} ls={0} style={{ position: 'absolute', top: 48, left: 29, right: 29, lineHeight: 20 }}>{'Если клавиатура не поддерживает\nспецсимволы, вы не сможете\nввести код. Проверьте, есть ли\nна вашей клавиатуре нужные\nсимволы.'}</T></GlassDialog>}
    {picker && <AppIconPicker demoAlert={demoAlert} onClose={() => setPicker(false)} />}
    {screens && <BlockScreens onClose={() => setScreens(false)} />}
  </SettingsStack>;
}
const styles = StyleSheet.create({ group: { borderRadius: 20, backgroundColor: colors.white, overflow: 'hidden' }, basic: { height: 53.333, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 13 }, feature: { paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 13 } });
