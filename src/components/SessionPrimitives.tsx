import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { art } from '@/data/art';
import { T } from '@/theme/typography';
import { colors, sessionTheme as c } from '@/theme/tokens';
import { Icon } from './Icon';
import { FadeIn, PressScale } from './motion';

export function SessionApps({ selected = [true, true, true] }: { selected?: boolean[] }) {
  return <View style={styles.apps} accessibilityLabel={['XChat', 'Сообщения', 'BeReal'].filter((_, i) => selected[i]).join(', ')}>
    {[art.sessionXchat, art.sessionMessages, art.sessionBereal].filter((_, i) => selected[i]).map((source, i) => <Image key={i} source={source} style={{ width: 16, height: 16, borderRadius: 4, marginLeft: i ? -4 : 0 }} />)}
  </View>;
}
export function EditorRow({ title, value, expanded, onPress, children }: { title: string; value?: ReactNode; expanded?: boolean; onPress?: () => void; children?: ReactNode }) {
  return <View style={styles.card}>
    <PressScale accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ expanded: !!expanded }} onPress={onPress} style={styles.row}>
      <Icon name="chevron-down-section" width={12} height={8} color={colors.chevronCompact} style={expanded ? { transform: [{ rotate: '180deg' }] } : undefined} />
      <T size={14} weight={600} color={c.secondary}>{title}</T><View style={{ marginLeft: 'auto' }}>{typeof value === 'string' ? <T size={14} weight={400}>{value}</T> : value}</View>
    </PressScale>{expanded && children}
  </View>;
}
export function SessionAction({ children, onPress, primary, disabled }: { children: ReactNode; onPress: () => void; primary?: boolean; disabled?: boolean }) {
  return <PressScale onPress={onPress} accessibilityRole="button" disabled={disabled} accessibilityState={{ disabled: !!disabled }} style={[styles.action, primary && styles.primary, disabled && { opacity: .4 }]}><T size={17} color={primary ? colors.white : c.ink} center>{children}</T></PressScale>;
}
const styles = StyleSheet.create({
  apps: { width: 51, height: 27, borderRadius: 16, backgroundColor: c.badge, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.white, borderRadius: c.rowRadius, boxShadow: c.rowShadow, overflow: 'hidden' },
  row: { minHeight: 59, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', gap: 10 },
  action: { flex: 1, height: 60, borderRadius: 30, backgroundColor: colors.white, justifyContent: 'center' },
  primary: { backgroundColor: c.dark, boxShadow: c.buttonShadow },
});

export function SessionNotice({ message, top }: { message: string; top: number }) {
  return <FadeIn key={message} style={{ position: 'absolute', top, left: 16, right: 16, zIndex: 100 }}><View pointerEvents="none" accessibilityLiveRegion="polite" style={{ height: 48, borderRadius: 16, backgroundColor: colors.goalGreen, paddingHorizontal: 16, flexDirection: 'row', gap: 10, alignItems: 'center' }}><Icon name="period-check" width={18} height={18} color={colors.white} /><T size={14} color={colors.white}>{message}</T></View></FadeIn>;
}
