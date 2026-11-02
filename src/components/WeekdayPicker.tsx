import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { PressScale } from './motion';
import { T } from '@/theme/typography';
import { colors, timeLimitTheme as c } from '@/theme/tokens';
export function WeekdayPicker({ value, onChange, labelPrefix, style, weight = 600 }: { value: number[]; onChange: (days: number[]) => void; labelPrefix: string; style?: StyleProp<ViewStyle>; weight?: 600 | 700 }) {
  return <View style={[styles.days, style]}>{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((label, i) => {
    const on = value.includes(i), disabled = value.length === 1 && on;
    return <PressScale key={label} accessibilityRole="checkbox" accessibilityLabel={`${labelPrefix} ${label}`} accessibilityState={{ checked: on, disabled }} disabled={disabled} onPress={() => onChange(on ? value.filter(d => d !== i) : [...value, i].sort())} style={[styles.day, { backgroundColor: on ? c.ink : colors.white, borderColor: on ? c.ink : c.dayBorder }]}><T size={14} weight={weight} color={on ? colors.white : c.dayOff} ls={0}>{label}</T></PressScale>;
  })}</View>;
}
const styles = StyleSheet.create({ days: { flexDirection: 'row', justifyContent: 'space-between' }, day: { width: 39, height: 39, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' } });
