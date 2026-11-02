import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Switch, View } from 'react-native';
import { art } from '@/data/art';
import { T } from '@/theme/typography';
import { colors, sessionPickerTheme as p, sessionTheme as c } from '@/theme/tokens';
import { Icon } from './Icon';
import { FadeIn, PressScale, spring } from './motion';

export function SessionApps({ selected = [true, true, true], reverse = true, bare = false }: { selected?: boolean[]; reverse?: boolean; bare?: boolean }) {
  const items = [art.sessionXchat, art.sessionMessages, art.sessionBereal].map((source, i) => ({ source, selected: selected[i] })).filter(item => item.selected);
  if (reverse) items.reverse();
  return <View style={[styles.apps, bare && { width: 45, height: 21, backgroundColor: p.whiteFade }]} accessibilityLabel={['XChat', 'Сообщения', 'BeReal'].filter((_, i) => selected[i]).join(', ')}>
    {items.map((item, i) => <Image key={i} source={item.source} style={{ width: 16, height: 16, borderRadius: 4, marginLeft: i ? -4 : 0 }} />)}
  </View>;
}
export function EditorRow({ title, value, expanded, onPress, children, emphasized, headerHeight = 59 }: { title: string; value?: ReactNode; expanded?: boolean; onPress?: () => void; children?: ReactNode; emphasized?: boolean; headerHeight?: number }) {
  return <View style={[styles.card, emphasized && { borderRadius: p.activityRadius, boxShadow: 'none' }]}>
    <PressScale accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ expanded: !!expanded }} onPress={onPress} style={[styles.row, { minHeight: headerHeight }, emphasized && { paddingTop: 8 }]}>
      <Icon name="chevron-down-section" width={12} height={8} color={colors.chevronCompact} style={expanded ? { transform: [{ rotate: '180deg' }] } : undefined} />
      <T size={emphasized ? 21 : 14} weight={emphasized ? 700 : 600} color={emphasized ? c.ink : c.secondary} style={emphasized ? { lineHeight: 26 } : undefined}>{title}</T><View style={{ marginLeft: 'auto' }}>{typeof value === 'string' ? <T size={14} weight={400}>{value}</T> : value}</View>
    </PressScale>{expanded && children}
  </View>;
}
export function SessionAction({ children, onPress, primary, disabled }: { children: ReactNode; onPress: () => void; primary?: boolean; disabled?: boolean }) {
  return <PressScale onPress={onPress} accessibilityRole="button" disabled={disabled} accessibilityState={{ disabled: !!disabled }} style={[styles.action, primary && styles.primary, disabled && (primary ? { backgroundColor: c.buttonDisabled, boxShadow: 'none' } : { opacity: .65 })]}>{primary && !disabled && <LinearGradient pointerEvents="none" colors={c.buttonGradient} locations={[0, .65, 1]} start={{ x: .017, y: .37 }} end={{ x: .983, y: .63 }} style={StyleSheet.absoluteFill} />}<T size={17} color={disabled ? primary ? c.buttonDisabledInk : c.buttonDisabledSecondary : primary ? colors.white : c.ink} center>{children}</T></PressScale>;
}
const styles = StyleSheet.create({
  apps: { width: 51, height: 27, borderRadius: 16, backgroundColor: c.badge, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.white, borderRadius: c.rowRadius, boxShadow: c.rowShadow, overflow: 'hidden' },
  row: { minHeight: 59, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', gap: 10 },
  action: { flex: 1, height: 60, borderRadius: 32, backgroundColor: colors.white, justifyContent: 'center' },
  primary: { overflow: 'hidden', backgroundColor: c.dark, boxShadow: c.buttonShadow },
});

export function SessionNotice({ message, top }: { message: string; top: number }) {
  return <FadeIn key={message} style={{ position: 'absolute', top, left: 16, right: 16, zIndex: 100 }}><View pointerEvents="none" accessibilityLiveRegion="polite" style={{ height: 48, borderRadius: 16, backgroundColor: colors.goalGreen, paddingHorizontal: 16, flexDirection: 'row', gap: 10, alignItems: 'center' }}><Icon name="period-check" width={18} height={18} color={colors.white} /><T size={14} color={colors.white}>{message}</T></View></FadeIn>;
}

export function FlowSwitch({ label, value, onChange, width = 63 }: { label: string; value: boolean; onChange: (value: boolean) => void; width?: number }) {
  if (Platform.OS !== 'web') return <Switch accessibilityLabel={label} value={value} onValueChange={onChange} trackColor={{ true: p.switchOn, false: p.switchOff }} thumbColor={Platform.OS === 'ios' ? undefined : colors.white} />;
  return <WebFlowSwitch label={label} value={value} onChange={onChange} width={width} />;
}

// Геометрия HTML нужна веб-превью. На устройстве сохраняем системные
// жесты, анимацию и материал UISwitch; цвет бегунка iOS не переопределяем.
function WebFlowSwitch({ label, value, onChange, width }: { label: string; value: boolean; onChange: (value: boolean) => void; width: number }) {
  const [thumb] = useState(() => new Animated.Value(value ? width - 40 : 0));
  useEffect(() => { spring(thumb, value ? width - 40 : 0); }, [value, thumb, width]);
  // Общая геометрия из switches.css: трек 63×28, овальный бегунок 36×24.
  return <Pressable accessibilityLabel={label} accessibilityRole="switch" aria-checked={value} accessibilityState={{ checked: value }} onPress={() => onChange(!value)} style={{ width, height: 28, borderRadius: 14, backgroundColor: value ? p.switchOn : p.switchOff }}>
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 2, top: 2, width: 36, height: 24, borderRadius: 14, backgroundColor: colors.white, boxShadow: p.switchThumbShadow, transform: [{ translateX: thumb }] }} />
  </Pressable>;
}
