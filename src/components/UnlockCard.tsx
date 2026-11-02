import { useId, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { appUnlockTheme as c } from '@/theme/tokens';

// Заливка карточек190–195: плавный векторный контур вместо растра с надписями.
const shape = 'M60 .833H273.333C322.5 .833 332.5 10.833 332.5 60V173.333C332.5 222.5 322.5 232.5 273.333 232.5H60C10.833 232.5 .833 222.5 .833 173.333V60C.833 10.833 10.833 .833 60 .833Z';
export function UnlockCard({ ready, children }: { ready: boolean; children: ReactNode }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  return <View style={{ width: 333.333, height: 233.333, borderRadius: 60, boxShadow: ready ? c.greenShadow : c.blueShadow }}><Svg width="100%" height="100%" viewBox="0 0 333.333 233.333"><Defs><LinearGradient id={id} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={ready ? c.green : c.blueTop} /><Stop offset="1" stopColor={ready ? c.green : c.blueBottom} /></LinearGradient></Defs><Path d={shape} fill={`url(#${id})`} stroke={ready ? c.greenRim : c.blueRim} strokeWidth={1.667} /></Svg><View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>{children}</View></View>;
}
