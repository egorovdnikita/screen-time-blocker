import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomChrome } from '@/components/BottomChrome';
import { Icon } from '@/components/Icon';
import { useDarkStatusBar } from '@/components/useStatusBar';
import { T, TRACK_SMALL } from '@/theme/typography';
import { colors } from '@/theme/tokens';

// Макета «Обзора» нет — заглушка в стилистике остальных экранов.
export function OverviewScreen() {
  const insets = useSafeAreaInsets();
  useDarkStatusBar();
  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 20) + 12.67 }]}>
      <T variant="display" size={28.5} ls={0} style={{ marginLeft: 20 }}>
        Обзор
      </T>
      <View style={styles.empty}>
        <Icon name="hands-clap" width={50} height={48} color={colors.section} />
        <T size={17} color={colors.section} style={{ marginTop: 12 }}>
          Скоро здесь будет обзор
        </T>
        <T size={12.5} weight={500} ls={TRACK_SMALL} color={colors.written} style={{ marginTop: 4 }}>
          Макет экрана ещё не готов
        </T>
      </View>
      <BottomChrome />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgPage },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 120 },
});
