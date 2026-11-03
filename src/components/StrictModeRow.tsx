import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from './Icon';
import { FlowSwitch } from './SessionPrimitives';
import { PressScale } from './motion';
import { T } from '@/theme/typography';
import { sessionTheme as c } from '@/theme/tokens';

export function StrictModeRow({ value, description, onOpen, onChange, style, disabled = false }: { value: boolean; description: string; onOpen: () => void; onChange: (value: boolean) => void; style?: StyleProp<ViewStyle>; disabled?: boolean }) {
  return <View style={[{ height: 30, flexDirection: 'row', gap: 8, alignItems: 'center' }, style]}>
    <PressScale accessibilityRole="button" accessibilityLabel="Настройки строгого режима" disabled={disabled} accessibilityState={{ disabled }} onPress={onOpen} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}><Icon name="session-shield" width={28} height={30} /><View><T size={17} color={c.strict}>Строгий режим</T><T size={12} weight={400} color={c.secondary}>{description}</T></View></PressScale>
    <View style={{ marginLeft: 'auto' }}><FlowSwitch label="Строгий режим" value={value} onChange={onChange} disabled={disabled} /></View>
  </View>;
}
