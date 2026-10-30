import { Pressable, View } from 'react-native';

import { colors, shadows } from '@/theme/tokens';

import { Glass } from './Glass';
import { Icon, type IconName } from './Icon';

type Props = {
  icon: IconName;
  iconWidth: number;
  iconHeight: number;
  variant: 'glass' | 'white';
  onPress?: () => void;
  onLongPress?: () => void;
  accessibilityLabel: string;
};

const SIZE = 44;

export function RoundButton({ icon, iconWidth, iconHeight, variant, onPress, onLongPress, accessibilityLabel }: Props) {
  const content = <Icon name={icon} width={iconWidth} height={iconHeight} color={variant === 'glass' ? colors.white : colors.black} />;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={450}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] })}
    >
      {variant === 'glass' ? (
        <Glass radius={SIZE / 2} style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
          {content}
        </Glass>
      ) : (
        <View
          style={{
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            backgroundColor: colors.white,
            boxShadow: shadows.btnWhite,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {content}
        </View>
      )}
    </Pressable>
  );
}
