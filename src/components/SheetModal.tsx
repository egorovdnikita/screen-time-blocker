import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, Keyboard, Modal, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';

type Backdrop = ReactNode | ((requestClose: () => void) => ReactNode);
// Подложка неподвижна; перемещается только содержимое, в том числе при закрытии.
export function SheetTransition({ backdrop, children, shown = true, closing = false, onHidden }: { backdrop: ReactNode; children: ReactNode; shown?: boolean; closing?: boolean; onHidden?: () => void }) {
  const { height } = useWindowDimensions();
  const [progress] = useState(() => new Animated.Value(0));
  const hidden = useRef(onHidden);
  useEffect(() => { hidden.current = onHidden; }, [onHidden]);
  useEffect(() => {
    if (!shown) return;
    const animation = Animated.timing(progress, { toValue: closing ? 0 : 1, duration: closing ? 240 : 320, easing: closing ? Easing.in(Easing.cubic) : Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' });
    animation.start(({ finished }) => { if (finished && closing) hidden.current?.(); });
    return () => animation.stop();
  }, [shown, closing, progress]);
  return <View pointerEvents={closing ? 'none' : 'box-none'} style={{ flex: 1 }}>
    <Animated.View testID="sheet-backdrop" style={[StyleSheet.absoluteFill, { opacity: progress.interpolate({ inputRange: [0, .6, 1], outputRange: [0, 1, 1] }) }]}>{backdrop}</Animated.View>
    <Animated.View testID="sheet-content" pointerEvents="box-none" style={[StyleSheet.absoluteFill, { transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }) }] }]}>{children}</Animated.View>
  </View>;
}
export function SheetModal({ backdrop, children, onClose, visible = true, onShown, animateClose = false }: { backdrop: Backdrop; children: ReactNode; onClose: () => void; visible?: boolean; onShown?: () => void; animateClose?: boolean }) {
  return visible ? <PresentedSheet backdrop={backdrop} onClose={onClose} onShown={onShown} animateClose={animateClose}>{children}</PresentedSheet> : null;
}
function PresentedSheet({ backdrop, children, onClose, onShown, animateClose }: { backdrop: Backdrop; children: ReactNode; onClose: () => void; onShown?: () => void; animateClose: boolean }) {
  const [shown, setShown] = useState(false);
  const [closing, setClosing] = useState(false);
  const requestClose = useCallback(() => { Keyboard.dismiss(); if (animateClose) setClosing(true); else onClose(); }, [animateClose, onClose]);
  return <Modal transparent animationType="none" onShow={() => { setShown(true); onShown?.(); }} onRequestClose={requestClose}>
    <SheetTransition backdrop={typeof backdrop === 'function' ? backdrop(requestClose) : backdrop} shown={shown} closing={closing} onHidden={onClose}>{children}</SheetTransition>
  </Modal>;
}
