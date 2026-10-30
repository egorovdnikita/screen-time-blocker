import { useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import { colors } from '@/theme/tokens';

const STROKE = 1.333;
const DASH = '5.333 4.667';

type BoxProps = {
  children?: ReactNode;
  radius: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

// Пунктирная рамка как в макете (border-style: dashed в RN не даёт задать шаг штриха).
export function DashedBox({ children, radius, color = colors.dash, style }: BoxProps) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ w: width, h: height });
  };
  return (
    <View style={style} onLayout={onLayout}>
      {size && (
        <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width={size.w} height={size.h}>
          <Rect
            x={STROKE / 2}
            y={STROKE / 2}
            width={size.w - STROKE}
            height={size.h - STROKE}
            rx={radius - STROKE / 2}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeDasharray={DASH}
          />
        </Svg>
      )}
      {children}
    </View>
  );
}

type LineProps = { color?: string; dash?: string; style?: StyleProp<ViewStyle> };

export function DashedLine({ color = colors.dash, dash = DASH, style }: LineProps) {
  const [w, setW] = useState(0);
  return (
    <View style={[{ height: STROKE }, style]} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && (
        <Svg width={w} height={STROKE}>
          <Line x1={0} y1={STROKE / 2} x2={w} y2={STROKE / 2} stroke={color} strokeWidth={STROKE} strokeDasharray={dash} />
        </Svg>
      )}
    </View>
  );
}
