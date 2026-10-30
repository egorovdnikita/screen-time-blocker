import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { T } from '@/theme/typography';
import { colors, gradients, shadows } from '@/theme/tokens';

import { Icon } from './Icon';

type Props = { variant?: 'home' | 'rules'; onPress?: () => void };

export const START_BUTTON_HEIGHT = 59.667;

// «+ Начать блокировку» — плавающая кнопка над таб-баром.
export function StartButton({ variant = 'home', onPress }: Props) {
  const g = variant === 'home' ? gradients.start : gradients.startRules;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.root, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}
    >
      <View style={styles.clip}>
        <LinearGradient
          colors={g.colors}
          locations={g.locations}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <Icon name="plus" width={18} height={17} color={colors.white} style={{ marginRight: 3.5 }} />
        <T size={17.25} color={colors.white}>
          Начать блокировку
        </T>
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.rim]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { height: START_BUTTON_HEIGHT, borderRadius: 999, boxShadow: shadows.start },
  clip: {
    flex: 1,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rim: { borderRadius: 999, boxShadow: shadows.startRim },
});
