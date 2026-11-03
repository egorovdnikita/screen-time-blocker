import { Image } from 'expo-image';
import { View } from 'react-native';
import { art } from '@/data/art';
import { sessionIcon, type SessionIconId } from '@/data/sessionIcons';

export function SessionIcon({ id, width, height = width, header = false }: { id: SessionIconId; width: number; height?: number; header?: boolean }) {
  const icon = sessionIcon(id);
  return <View accessible accessibilityLabel={`Иконка: ${icon.label}`} style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
    <Image source={header && id === 'brain' ? art.sessionBrain : icon.image} contentFit="contain" style={{ width, height }} />
  </View>;
}
