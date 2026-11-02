import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, Modal, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';

// Затемнение — неподвижный сосед листа, а не часть переводимого контейнера.
// Используется и нативными Modal, и прозрачным маршрутом редактора.
export function SheetTransition({ backdrop, children, shown = true }: { backdrop: ReactNode; children: ReactNode; shown?: boolean }) {
  const { height } = useWindowDimensions();
  const [progress] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!shown) return;
    const animation = Animated.timing(progress, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' });
    animation.start();
    return () => animation.stop();
  }, [shown, progress]);
  return <View pointerEvents="box-none" style={{ flex: 1 }}>
    <Animated.View testID="sheet-backdrop" style={[StyleSheet.absoluteFill, { opacity: progress.interpolate({ inputRange: [0, .6, 1], outputRange: [0, 1, 1] }) }]}>{backdrop}</Animated.View>
    <Animated.View testID="sheet-content" pointerEvents="box-none" style={[StyleSheet.absoluteFill, { transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }) }] }]}>{children}</Animated.View>
  </View>;
}

export function SheetModal({ backdrop, children, onClose, visible = true }: { backdrop: ReactNode; children: ReactNode; onClose: () => void; visible?: boolean }) {
  // Отдельный экземпляр на каждое открытие запускает анимацию после onShow.
  return visible ? <PresentedSheet backdrop={backdrop} onClose={onClose}>{children}</PresentedSheet> : null;
}
function PresentedSheet({ backdrop, children, onClose }: { backdrop: ReactNode; children: ReactNode; onClose: () => void }) {
  const [shown, setShown] = useState(false);
  return <Modal transparent animationType="none" onShow={() => setShown(true)} onRequestClose={onClose}>
    <SheetTransition backdrop={backdrop} shown={shown}>{children}</SheetTransition>
  </Modal>;
}
