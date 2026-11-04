import { lockApps } from '@/data/lockRule';
import { DarkButtonSurface } from './DarkButtonSurface';
import { Image } from 'expo-image';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Switch, View, type StyleProp, type ViewStyle } from 'react-native';
import { art } from '@/data/art';
import { T } from '@/theme/typography';
import { colors, softNoticeTheme, sessionPickerTheme as p, sessionTheme as c } from '@/theme/tokens';
import { Icon } from './Icon';
import { FadeIn, PressScale, spring } from './motion';

export function SessionApps({ selected = [true, true, true], reverse = true, bare = false, appIds, size = 'compact', style }: { selected?: boolean[]; reverse?: boolean; bare?: boolean; appIds?: readonly string[]; size?: 'compact' | 'large' | 'setup'; style?: StyleProp<ViewStyle> }) {
  const items = appIds ? appIds.map(id => lockApps.find(x=>x.id===id)).filter((x): x is typeof lockApps[number] => !!x).map(x=>({source:x.id==='xchat'?art.sessionXchat:x.id==='messages'?art.sessionMessages:x.id==='bereal'?art.sessionBereal:x.image,name:x.name})) : [art.sessionXchat,art.sessionMessages,art.sessionBereal].map((source,i)=>({source,name:['XChat','Сообщения','BeReal'][i],selected:selected[i]})).filter(x=>x.selected);
  if (reverse) items.reverse();
  const large = size === 'large'; const setup = size === 'setup';
  return <View style={[styles.apps, bare && { width:45,height:21,backgroundColor:p.whiteFade },large&&{width:100,height:44,backgroundColor:p.whiteFade},setup&&{width:54,height:26,backgroundColor:p.whiteFade},style]} accessibilityLabel={appIds?items.map(x=>x.name).join(', '):['XChat','Сообщения','BeReal'].filter((_,i)=>selected[i]).join(', ')}>
    {items.map((item,i)=><Image key={item.name} source={item.source} style={large||setup?{position:'absolute',left:large?4+i*28:2.16+i*15.12,top:large?2.5:1.5,width:large?37.5:20.25,height:large?37.5:22.1,borderRadius:large?9:5}:{width:16,height:16,borderRadius:4,marginLeft:i?-4:0}}/>)}
  </View>;
}
// Редакторы лимитов, блокировок и рутин в HTML набраны другими серыми, чем редактор сессии.
export const EditorTone = createContext({ value: c.value as string, label: c.secondary as string });
export const ruleEditorTone = { value: c.ruleValue, label: c.ruleLabel };

export function EditorRow({ title, value, expanded, onPress, children, emphasized, headerHeight = 59 }: { title: string; value?: ReactNode; expanded?: boolean; onPress?: () => void; children?: ReactNode; emphasized?: boolean; headerHeight?: number }) {
  const tone = useContext(EditorTone);
  return <View style={[styles.card, emphasized && { borderRadius: p.activityRadius, boxShadow: 'none' }]}>
    <PressScale accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ expanded: !!expanded }} onPress={onPress} style={[styles.row, { minHeight: headerHeight }, emphasized && { paddingTop: 8 }]}>
      <Icon name="chevron-down-section" width={12} height={8} color={colors.chevronCompact} style={expanded ? { transform: [{ rotate: '180deg' }] } : undefined} />
      <T size={emphasized ? 21 : 14} weight={emphasized ? 700 : 600} color={emphasized ? c.ink : tone.label} ls={0} style={emphasized ? { lineHeight: 26 } : undefined}>{title}</T><View style={{ marginLeft: 'auto' }}>{typeof value === 'string' ? <T size={14} weight={400} color={tone.value} ls={0}>{value}</T> : value}</View>
    </PressScale>{expanded && children}
  </View>;
}
export function SessionAction({ children, onPress, primary, disabled }: { children: ReactNode; onPress: () => void; primary?: boolean; disabled?: boolean }) {
  return <PressScale onPress={onPress} accessibilityRole="button" disabled={disabled} accessibilityState={{ disabled: !!disabled }} style={[styles.action, primary && styles.primary, disabled && (primary ? { backgroundColor: c.buttonDisabled, boxShadow: 'none' } : { opacity: .65 })]}>{primary && !disabled && <DarkButtonSurface />}<T size={17} color={disabled ? primary ? c.buttonDisabledInk : c.buttonDisabledSecondary : primary ? colors.white : c.ink} center ls={0}>{children}</T></PressScale>;
}
const styles = StyleSheet.create({
  apps: { width: 51, height: 27, borderRadius: 16, backgroundColor: c.badge, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.white, borderRadius: c.rowRadius, boxShadow: c.rowShadow, overflow: 'hidden' },
  row: { minHeight: 59, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', gap: 10 },
  action: { flex: 1, height: 60, borderRadius: 32, backgroundColor: colors.white, justifyContent: 'center' },
  primary: { backgroundColor: c.dark },
});

export function SessionNotice({ message, top, tone = 'default' }: { message: string; top: number; tone?: 'default' | 'soft' }) {
  return <FadeIn key={message} style={{ position: 'absolute', top, left: 16, right: 16, zIndex: 100 }}><View pointerEvents="none" accessibilityLiveRegion="polite" style={{ height: tone === 'soft' ? 49.333 : message.includes('\n') ? 67.333 : 48, borderRadius: tone === 'soft' ? 18 : 16, backgroundColor: tone === 'soft' ? softNoticeTheme.surface : colors.goalGreen, boxShadow: tone === 'soft' ? softNoticeTheme.shadow : undefined, paddingHorizontal: 16, flexDirection: 'row', gap: tone === 'soft' ? 15 : 10, alignItems: 'center' }}><Icon name={tone === 'soft' ? 'reflection-confirm' : 'period-check'} width={tone === 'soft' ? 19 : 18} height={tone === 'soft' ? 23 : 18} color={colors.white} /><T size={tone === 'soft' ? 14.25 : 14} color={colors.white} style={{ lineHeight: 20 }}>{message}</T></View></FadeIn>;
}

export function FlowSwitch({ label, value, onChange, width = 63, thumbWidth = 36, height = 28, trackColor = { true: p.switchOn, false: p.switchOff }, disabled = false }: { label: string; value: boolean; onChange: (value: boolean) => void; width?: number; thumbWidth?: number; height?: number; trackColor?: { true: string; false: string }; disabled?: boolean }) {
  if (Platform.OS !== 'web') return <Switch style={{ alignSelf: 'center' }} accessibilityLabel={label} disabled={disabled} value={value} onValueChange={onChange} trackColor={trackColor} thumbColor={Platform.OS === 'ios' ? undefined : colors.white} />;
  return <WebFlowSwitch label={label} value={value} onChange={onChange} width={width} thumbWidth={thumbWidth} height={height} trackColor={trackColor} disabled={disabled} />;
}

// thumbWidth меняет только веб-иллюстрацию129; нативный UISwitch не масштабируется.
// Геометрия HTML нужна веб-превью. На устройстве сохраняем системные
// жесты, анимацию и материал UISwitch; цвет бегунка iOS не переопределяем.
function WebFlowSwitch({ label, value, onChange, width, thumbWidth, height, trackColor, disabled }: { label: string; value: boolean; onChange: (value: boolean) => void; width: number; thumbWidth: number; height: number; trackColor: { true: string; false: string }; disabled: boolean }) {
  const [thumb] = useState(() => new Animated.Value(value ? width - thumbWidth - 4 : 0));
  useEffect(() => { spring(thumb, value ? width - thumbWidth - 4 : 0); }, [value, thumb, width, thumbWidth]);
  // Общая геометрия из switches.css: трек 63×28, овальный бегунок 36×24.
  return <Pressable accessibilityLabel={label} accessibilityRole="switch" disabled={disabled} aria-checked={value} accessibilityState={{ checked: value, disabled }} onPress={() => onChange(!value)} style={{ width, height, borderRadius: height / 2, backgroundColor: value ? trackColor.true : trackColor.false }}>
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 2, top: 2, width: thumbWidth, height: height - 4, borderRadius: height / 2, backgroundColor: colors.white, boxShadow: p.switchThumbShadow, transform: [{ translateX: thumb }] }} />
  </Pressable>;
}
