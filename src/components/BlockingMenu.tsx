import { SheetModal, SheetGrabber } from './SheetModal';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from './Icon';
import { PressScale } from './motion';
import { T } from '@/theme/typography';
import { colors, sessionTheme as c } from '@/theme/tokens';

const options: { title: string; hint: string; icon: IconName; color: string; mode?: 'immediate' | 'scheduled' | 'lock' | 'limit' | 'routine' }[] = [
  { title: 'Прямо сейчас', hint: 'Например, на 30 минут', icon: 'blocking-timer', color: c.orange, mode: 'immediate' },
  { title: 'По расписанию', hint: 'Например, с 23:00 до 6:00', icon: 'blocking-scheduled', color: c.cyan, mode: 'scheduled' },
  { title: 'Лимит запусков', hint: 'Например, до 3 запусков в день', icon: 'blocking-viewfinder', color: c.red, mode: 'lock' },
  { title: 'Лимит времени', hint: 'Напр., после 15 минут в приложении', icon: 'blocking-clock', color: c.violet, mode: 'limit' },
  { title: 'Выполнить привычки', hint: 'Например, 15 минут за тренировку', icon: 'blocking-checklist', color: c.green, mode: 'routine' },
];

export function BlockingMenu({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return <SheetModal animateClose visible={visible} onClose={onClose} backdrop={close => <Pressable accessibilityLabel="Закрыть меню блокировки" onPress={() => close()} style={[StyleSheet.absoluteFill, { backgroundColor: c.backdrop }]} />}>{close => <>
    <View pointerEvents="box-none" style={styles.root}>

      <View style={[styles.sheet, { bottom: Math.max(8, insets.bottom - 22.3) }]}>
        <BlurView intensity={28} tint="light" style={StyleSheet.absoluteFill} />
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: c.menu }]} />
        <SheetGrabber style={styles.handle} />
        <T size={25} center ls={-.35} style={styles.title}>Блокировать</T>
        {options.map((item, i) => <PressScale key={item.title} accessibilityRole="button" accessibilityLabel={item.title} accessibilityHint={item.hint} accessibilityState={{ disabled: !item.mode }} disabled={!item.mode}
          onPress={() => close(() => { onClose(); if (item.mode === 'lock') router.push('/lock'); else if (item.mode === 'limit') router.push('/limit'); else if (item.mode === 'routine') router.push('/routine'); else router.push({ pathname: '/session', params: { mode: item.mode } }); })}
          style={[styles.row, i > 0 && styles.separator]}>
          <View style={[styles.icon, { backgroundColor: item.color }]}><Icon name={item.icon} width={item.icon === 'blocking-viewfinder' ? 31 : 28} height={28} color={colors.white} />{item.icon === 'blocking-viewfinder' && <Icon name="lock-fill" width={16} height={18} color={colors.white} style={{ position: 'absolute' }} />}</View>
          <View style={{ flex: 1 }}><T size={18} ls={-.2}>{item.title}</T><T size={13.5} weight={400} ls={-.1} style={{ marginTop: 1 }}>{item.hint}</T></View>
        </PressScale>)}
      </View>
    </View>
  </>}</SheetModal>;
}
const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: { position: 'absolute', left: 8, right: 8, height: 498, borderRadius: c.sheetRadius, overflow: 'hidden', paddingHorizontal: 18, borderWidth: 1, borderColor: colors.white },
  handle: { alignSelf: 'center', width: 60, height: 5, borderRadius: 4, backgroundColor: c.handle, marginTop: 11 },
  title: { marginTop: 26, lineHeight: 31, marginBottom: 23 },
  row: { height: 75, flexDirection: 'row', alignItems: 'center', gap: 12 },
  separator: { borderTopWidth: 1, borderStyle: 'dashed', borderColor: c.line },
  icon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
