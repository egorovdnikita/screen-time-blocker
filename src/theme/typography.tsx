import { Platform, Text, type TextProps, type TextStyle } from 'react-native';

import { colors } from './tokens';

// В макете SF Pro Rounded. На iOS это системный шрифт с дизайном rounded,
// на вебе — ui-rounded, на Android — системный (Roboto).
export const rounded = Platform.select({
  ios: 'ui-rounded',
  web: 'ui-rounded, "SF Pro Rounded", -apple-system, system-ui, sans-serif',
  default: undefined,
});

const display = Platform.select({
  ios: 'System',
  web: '"SF Pro Display", -apple-system, system-ui, sans-serif',
  default: undefined,
});

const text = Platform.select({ ios: 'System', web: '"Block Text", -apple-system, system-ui, sans-serif', default: undefined });
// Как `-apple-system` в HTML (системные строки списков и запросов): на вебе без подмены начертания.
const system = Platform.select({ ios: 'System', web: '-apple-system, system-ui, sans-serif', default: undefined });

type Weight = 400 | 500 | 600 | 700 | 800;

export type TProps = TextProps & {
  size?: number;
  weight?: Weight;
  color?: string;
  ls?: number;
  variant?: 'rounded' | 'display' | 'text' | 'system';
  center?: boolean;
  onSky?: boolean;
};

export const skyShadow: TextStyle = {
  textShadowColor: 'rgba(10, 30, 120, 0.7)',
  textShadowRadius: 1.5,
  textShadowOffset: { width: 0, height: 0 },
};

export function T({
  size = 15,
  weight = 700,
  color = colors.text,
  ls = 0.3,
  variant = 'rounded',
  center,
  onSky,
  style,
  ...rest
}: TProps) {
  return (
    <Text
      allowFontScaling={false}
      {...rest}
      style={[
        {
          fontFamily: variant === 'display' ? display : variant === 'text' ? text : variant === 'system' ? system : rounded,
          fontSize: size,
          fontWeight: String(weight) as TextStyle['fontWeight'],
          color,
          letterSpacing: ls,
        },
        center && { textAlign: 'center' },
        onSky && skyShadow,
        style,
      ]}
    />
  );
}

// letter-spacing: var(--track-small)
export const TRACK_SMALL = 0.6;
