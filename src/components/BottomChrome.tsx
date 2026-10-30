import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StartButton } from './StartButton';
import { TAB_BAR_HEIGHT, TAB_BAR_SIDE } from './TabBar';

// Отступ снизу у прокручиваемого контента, чтобы последний блок выходил из-под таб-бара и кнопки.
export function useBottomSpace(withStart: boolean) {
  const insets = useSafeAreaInsets();
  const bar = (insets.bottom > 0 ? TAB_BAR_SIDE : 12) + TAB_BAR_HEIGHT;
  return bar + (withStart ? 80 : 0) + 24;
}

type Props = { start?: 'home' | 'rules' };

// .edge-bottom (подложка под таб-баром) + плавающая кнопка «Начать блокировку».
export function BottomChrome({ start }: Props) {
  const insets = useSafeAreaInsets();
  const barBottom = insets.bottom > 0 ? TAB_BAR_SIDE : 12;
  return (
    <>
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(244, 246, 248, 0)', 'rgba(244, 246, 248, 0.55)', 'rgba(244, 246, 248, 0.55)']}
        locations={[0, 0.3, 1]}
        style={[styles.edge, { height: 104 + (start ? 0 : -40) }]}
      />
      {start && (
        <View style={[styles.start, { bottom: barBottom + TAB_BAR_HEIGHT + 20.7 }]}>
          <StartButton variant={start} />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  edge: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  start: { position: 'absolute', left: 20.5, right: 20.5 },
});
