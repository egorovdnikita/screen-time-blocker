import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, Keyboard, Modal, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';

export type SheetClose = (afterClose?: () => void) => void;
export type SheetContent = ReactNode | ((close: SheetClose) => ReactNode);
type SheetMotion = 'sheet' | 'dialog';
type Backdrop = ReactNode | ((requestClose: SheetClose) => ReactNode);
// Подложка неподвижна; перемещается только содержимое, в том числе при закрытии.
export function SheetTransition({ backdrop, children, shown = true, closing = false, onHidden, motion = 'sheet', overlay }: { backdrop: ReactNode; children: ReactNode; shown?: boolean; closing?: boolean; onHidden?: () => void; motion?: SheetMotion; overlay?: ReactNode }) {
  const { height } = useWindowDimensions();
  const [progress] = useState(() => new Animated.Value(0));
  const hidden = useRef(onHidden);
  useEffect(() => { hidden.current = onHidden; }, [onHidden]);
  useEffect(() => {
    if (!shown) return;
    const animation = Animated.timing(progress, { toValue: closing ? 0 : 1, duration: motion === 'dialog' ? closing ? 180 : 220 : closing ? 240 : 320, easing: closing ? Easing.in(Easing.cubic) : Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' });
    animation.start(({ finished }) => { if (finished && closing) hidden.current?.(); });
    return () => animation.stop();
  }, [shown, closing, progress, motion]);
  return <View pointerEvents={closing ? 'none' : 'box-none'} style={{ flex: 1 }}>
    <Animated.View testID={motion === 'dialog' ? 'dialog-backdrop' : 'sheet-backdrop'} style={[StyleSheet.absoluteFill, { opacity: motion === 'dialog' ? progress : progress.interpolate({ inputRange: [0, .6, 1], outputRange: [0, 1, 1] }) }]}>{backdrop}</Animated.View>
    <Animated.View testID={motion === 'dialog' ? 'dialog-content' : 'sheet-content'} pointerEvents="box-none" style={[StyleSheet.absoluteFill, motion === 'dialog' ? { opacity: progress } : { transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }) }] }]}>{children}</Animated.View>
    {overlay != null && overlay !== false && <Animated.View testID="sheet-overlay" pointerEvents="box-none" style={[StyleSheet.absoluteFill, { opacity: progress }]}>{overlay}</Animated.View>}
  </View>;
}
export function SheetModal({ backdrop, children, onClose, visible = true, onShown, animateClose = false, overlay, motion = 'sheet' }: { backdrop: Backdrop; children: SheetContent; overlay?: ReactNode; onClose: () => void; visible?: boolean; onShown?: () => void; animateClose?: boolean; motion?: SheetMotion }) {
  return visible ? <PresentedSheet backdrop={backdrop} onClose={onClose} onShown={onShown} animateClose={animateClose} overlay={overlay} motion={motion}>{children}</PresentedSheet> : null;
}
function PresentedSheet({ backdrop, children, onClose, onShown, animateClose, overlay, motion }: { backdrop: Backdrop; children: SheetContent; overlay?: ReactNode; onClose: () => void; onShown?: () => void; animateClose: boolean; motion: SheetMotion }) {
  const [shown, setShown] = useState(false);
  const [presented, setPresented] = useState(true);
  const finished = useRef(false);
  const [closing, setClosing] = useState(false);
  const [completion, setCompletion] = useState<(() => void) | null>(null);
  const requestClose: SheetClose = useCallback(afterClose => {
    if (closing) return;
    Keyboard.dismiss();
    const action = typeof afterClose === 'function' ? afterClose : onClose;
    if (animateClose) { setCompletion(previous => previous ?? action); setClosing(true); } else action();
  }, [animateClose, onClose, closing]);
  const complete = useCallback(() => { if (finished.current) return; finished.current = true; setCompletion(null); completion?.(); }, [completion]);
  const hide = useCallback(() => { setPresented(false); if (Platform.OS !== 'ios') complete(); }, [complete]);
  return <Modal visible={presented} transparent animationType="none" onDismiss={complete} onShow={() => { setShown(true); onShown?.(); }} onRequestClose={() => requestClose()}>
    <SheetTransition backdrop={typeof backdrop === 'function' ? backdrop(requestClose) : backdrop} shown={shown} closing={closing} onHidden={hide} motion={motion} overlay={overlay}>{typeof children === 'function' ? children(requestClose) : children}</SheetTransition>
  </Modal>;
}
