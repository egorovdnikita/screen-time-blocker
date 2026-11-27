import { localMaterials, colors } from '@/theme/tokens';
import { Children, createContext, useContext, type ReactNode } from 'react';
import { Platform, Text, type TextProps, type TextStyle } from 'react-native';

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

const text = Platform.select({
  ios: 'System',
  web: '"Block Text", -apple-system, system-ui, sans-serif',
  default: undefined,
});
// Как `-apple-system` в HTML (системные строки списков и запросов): на вебе без подмены начертания.
const system = Platform.select({ ios: 'System', web: '-apple-system, system-ui, sans-serif', default: undefined });

type Weight = 400 | 500 | 600 | 700 | 800 | 900;

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
  textShadowColor: localMaterials.skyText,
  textShadowRadius: 1.5,
  textShadowOffset: { width: 0, height: 0 },
};

// Название переносится только целиком: в «screen-time-blocker» дефисы неразрывные (U+2011),
// иначе строки рвались на «screen-» / «time-blocker» (аудит 2026-11-21).
const APP_NAME = /screen-time-blocker/g;
const keepAppName = (children: ReactNode) =>
  typeof children === 'string'
    ? children.replace(APP_NAME, 'screen\u2011time\u2011blocker')
    : Children.map(children, node =>
        typeof node === 'string' ? node.replace(APP_NAME, 'screen\u2011time\u2011blocker') : node,
      );

// Цвет текста области: в HTML настройки набраны #111, а не чистым чёрным. Явный color важнее.
export const TextInk = createContext<string>(colors.text);

export function T({
  size = 15,
  weight = 700,
  color,
  ls = 0.3,
  variant = 'rounded',
  center,
  onSky,
  style,
  children,
  ...rest
}: TProps) {
  const ink = useContext(TextInk);
  return (
    <Text
      allowFontScaling={false}
      {...rest}
      style={[
        {
          fontFamily:
            variant === 'display' ? display : variant === 'text' ? text : variant === 'system' ? system : rounded,
          fontSize: size,
          fontWeight: String(weight) as TextStyle['fontWeight'],
          color: color ?? ink,
          letterSpacing: ls,
        },
        center && { textAlign: 'center' },
        onSky && skyShadow,
        style,
      ]}
    >
      {keepAppName(children)}
    </Text>
  );
}

// letter-spacing: var(--track-small)
export const TRACK_SMALL = 0.6;
