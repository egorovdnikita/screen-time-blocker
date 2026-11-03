import { StyleSheet, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/motion';
import { colors, appGroupTheme as c } from '@/theme/tokens';
export function AppGroupCheck({ checked, label, onPress, category = false, tint }: { checked: boolean; label: string; onPress: () => void; category?: boolean; tint?: string }) {
  return <PressScale accessibilityRole="checkbox" accessibilityLabel={label} accessibilityState={{ checked }} onPress={onPress} hitSlop={8} style={styles.touch}><CheckMark checked={checked} category={category} tint={tint} /></PressScale>;
}
export function CheckMark({ checked, category = false, markSize = 16, tint }: { checked: boolean; category?: boolean; markSize?: number; tint?: string }) {
  return <View style={[styles.check, { borderColor: category ? c.radio : c.optionRadio }, checked && { borderColor: tint || c.checkboxBlue, backgroundColor: tint || c.checkboxBlue }]}>{checked && <Icon name="group-check" width={markSize} height={markSize} color={colors.white} />}</View>;
}
const styles = StyleSheet.create({ touch: { width: 24, height: 32, alignItems: 'center', justifyContent: 'center' }, check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' } });
