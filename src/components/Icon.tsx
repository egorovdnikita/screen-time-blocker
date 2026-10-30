import { memo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { icons, type IconName } from '@/icons/data';

type Props = {
  name: IconName;
  width: number;
  height?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export const Icon = memo(function Icon({ name, width, height = width, color, style }: Props) {
  // Обёртка нужна вебу: голый <svg> не позиционирован и уходит под абсолютные слои (blur, градиенты).
  return (
    <View style={[{ width, height }, style]}>
      <SvgXml xml={icons[name]} width={width} height={height} color={color} />
    </View>
  );
});

export type { IconName };
