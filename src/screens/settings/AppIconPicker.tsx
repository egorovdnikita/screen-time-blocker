import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { floatingSheetTop } from '@/components/sheetLayout';
import { useState } from 'react';
import { Image } from 'expo-image';
import { MaterialBlur } from '@/components/MaterialBlur';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { appIcons } from '@/data/preferences';
import { useAppState } from '@/state/app';
import { T } from '@/theme/typography';
import { colors, remainingTheme as c } from '@/theme/tokens';
import { PlainSettingsSheet } from '@/components/PlainSettingsSheet';
import { SheetModal, SheetScrollView } from '@/components/SheetModal';
import { PressScale } from '@/components/motion';
import { Icon } from '@/components/Icon';

// Выбор хранится локально. Подтверждение ОС доступно только как отдельное демо311.
export function AppIconPicker({ onClose, demoAlert = false }: { onClose: () => void; demoAlert?: boolean }) {
  const {width, height} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const columns = width >= 339 ? 4 : 3;
  const gap = Math.max(8, (width - 16 - 51 - columns * 62) / (columns - 1));
  const top = floatingSheetTop(height, insets.top, 409.333, 434.667);
  const app = useAppState(), [alert, setAlert] = useState(false);
  return <PlainSettingsSheet onShown={() => { if(demoAlert) setAlert(true); }} title="Иконка приложения" top={top} inset={8} bottom={8} onClose={onClose} surface={c.surface} backdropColor={c.dim}>
    <SheetScrollView accessibilityLabel="Выбор иконки приложения" style={{marginTop:100.667}} contentContainerStyle={{paddingBottom:Math.max(24,insets.bottom)}}><View style={[styles.grid,{columnGap:gap}]}>{appIcons.map(item => <PressScale key={item.id} accessibilityRole="button" accessibilityLabel={`Иконка: ${item.title}`} accessibilityState={{ selected: app.appIcon === item.id }} onPress={() => app.setAppIcon(item.id)} style={styles.tile}>
      <Image source={item.image} style={[styles.image, app.appIcon === item.id && { borderWidth: 2, borderColor: c.selection }]} />
      {app.appIcon === item.id && <View style={styles.check}><Icon name="checkmark" width={9} height={10} color={colors.white} /></View>}
      <T size={14} center ls={0} style={{ lineHeight: 18, marginTop: 12, width: 82, marginLeft: -10 }}>{item.title}</T>
    </PressScale>)}</View></SheetScrollView>
    {alert && <SheetModal animateClose motion="dialog" swipeEnabled={false} onClose={() => setAlert(false)} backdrop={close => <Pressable accessibilityLabel="Закрыть демо подтверждения иконки" onPress={() => close()} style={[StyleSheet.absoluteFill, { backgroundColor: c.alertDim }]} />}>{close => <View accessibilityRole="alert" style={[styles.alert,{top:Math.max(insets.top+12,Math.min(345.333,(height-187.333)/2+13))}]}><MaterialBlur blurPx={20} nativeIntensity={75} tint="light" style={StyleSheet.absoluteFill} /><Image source={appIcons[5].image} style={{ position: 'absolute', left: 8, top: 19, width: 60, height: 60, borderRadius: 15 }} /><T size={16.25} weight={400} variant="text" ls={0} style={{ position: 'absolute', left: 77, right: 8, top: 27, lineHeight: 21 }}>Вы изменили иконку приложения «Block».</T><PressScale accessibilityRole="button" accessibilityLabel="ОК: демо иконки" onPress={() => close()} style={styles.ok}><T size={17} weight={400} variant="text" ls={0}>ОК</T></PressScale></View>}</SheetModal>}
  </PlainSettingsSheet>;
}
const styles = StyleSheet.create({ grid: { marginLeft: 26, marginRight: 25, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', rowGap: 13.333 }, tile: { width: 62, height: 92 }, image: { width: 62, height: 62, borderRadius: 18 }, check: { position: 'absolute', right: -5, top: 48, width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: c.surface, backgroundColor: c.selection, alignItems: 'center', justifyContent: 'center' }, alert: { position: 'absolute', top: 345.333, left: 37, right: 37, height: 187.333, borderRadius: 34, overflow: 'hidden', backgroundColor: c.alert, borderWidth: 1, borderColor: c.menuBorder }, ok: { position: 'absolute', left: 15, right: 15, bottom: 15, height: 48, borderRadius: 27, backgroundColor: c.alertButton, alignItems: 'center', justifyContent: 'center' } });
