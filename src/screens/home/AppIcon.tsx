import { Image } from 'expo-image';
import { View } from 'react-native';
import { Icon } from '@/components/Icon';
import { art } from '@/data/art';
import type { AppIconKind } from '@/data/home';
import { colors } from '@/theme/tokens';

export function AppIcon({ icon, size = 28 }: { icon: AppIconKind; size?: number }) {
  switch (icon) {
    case 'block':
      return <Icon name="ogonek-app-icon" width={size} />;
    case 'photos':
      return <Image source={art.appPhotos} style={{ width: size + 4, height: size + 6, margin: -2, marginTop: -3 }} />;
    case 'phia':
      return <Image source={art.appPhia} style={{ width: size + 4, height: size + 4, margin: -2 }} />;
    case 'substack':
      return <Image source={art.appSubstack} style={{ width: size + 4, height: size + 6, margin: -2, marginTop: -3 }} />;
    case 'other':
      return (
        <View style={{ width: size, height: size, borderRadius: 8, backgroundColor: colors.otherBg, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="archive" width={17.5} height={16} color={colors.otherIco} />
        </View>
      );
  }
}
