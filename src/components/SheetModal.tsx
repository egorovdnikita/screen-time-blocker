import { createContext, useContext, useMemo, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, Keyboard, Modal, PanResponder, Platform, StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';

export type SheetClose = (afterClose?: () => void) => void;
export type SheetContent = ReactNode | ((close: SheetClose) => ReactNode);
type SheetMotion = 'sheet' | 'dialog';
type DragContext = { drag: Animated.Value; close: () => void; enabled: boolean };
const SheetDragContext = createContext<DragContext | null>(null);
type Backdrop = ReactNode | ((requestClose: SheetClose) => ReactNode);
// Подложка неподвижна; перемещается только содержимое, в том числе при закрытии.
export function SheetTransition({ backdrop, children, shown = true, closing = false, onHidden, motion = 'sheet', overlay, onSwipeClose, swipeEnabled = true }: { backdrop: ReactNode; children: ReactNode; shown?: boolean; closing?: boolean; onHidden?: () => void; motion?: SheetMotion; overlay?: ReactNode; onSwipeClose?: () => void; swipeEnabled?: boolean }) {
  const { height } = useWindowDimensions();
  const [progress] = useState(() => new Animated.Value(0));
  const [drag] = useState(() => new Animated.Value(0));
  const hidden = useRef(onHidden);
  useEffect(() => { hidden.current = onHidden; }, [onHidden]);
  useEffect(() => {
    if (!shown) return;
    const animation = Animated.timing(progress, { toValue: closing ? 0 : 1, duration: motion === 'dialog' ? closing ? 180 : 220 : closing ? 240 : 320, easing: closing ? Easing.in(Easing.cubic) : Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' });
    animation.start(({ finished }) => { if (finished && closing) hidden.current?.(); });
    return () => animation.stop();
  }, [shown, closing, progress, motion]);
  return <SheetDragContext.Provider value={{ drag, close: onSwipeClose ?? (() => {}), enabled: swipeEnabled && !!onSwipeClose && motion === 'sheet' && shown && !closing }}><View pointerEvents={closing ? 'none' : 'box-none'} style={{ flex: 1 }}>
    <Animated.View testID={motion === 'dialog' ? 'dialog-backdrop' : 'sheet-backdrop'} style={[StyleSheet.absoluteFill, { opacity: motion === 'dialog' ? progress : progress.interpolate({ inputRange: [0, .6, 1], outputRange: [0, 1, 1] }) }]}>{backdrop}</Animated.View>
    <Animated.View testID={motion === 'dialog' ? 'dialog-content' : 'sheet-content'} pointerEvents="box-none" style={[StyleSheet.absoluteFill, motion === 'dialog' ? { opacity: progress } : { transform: [{ translateY: Animated.add(progress.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }), drag) }] }]}>{children}</Animated.View>
    {overlay != null && overlay !== false && <Animated.View testID="sheet-overlay" pointerEvents="box-none" style={[StyleSheet.absoluteFill, { opacity: progress }]}>{overlay}</Animated.View>}
  </View></SheetDragContext.Provider>;
}
export function SheetModal({ backdrop, children, onClose, visible = true, onShown, animateClose = false, overlay, motion = 'sheet', swipeEnabled = true }: { backdrop: Backdrop; children: SheetContent; overlay?: ReactNode; onClose: () => void; visible?: boolean; onShown?: () => void; animateClose?: boolean; motion?: SheetMotion; swipeEnabled?: boolean }) {
  return visible ? <PresentedSheet backdrop={backdrop} onClose={onClose} onShown={onShown} animateClose={animateClose} overlay={overlay} motion={motion} swipeEnabled={swipeEnabled}>{children}</PresentedSheet> : null;
}
function PresentedSheet({ backdrop, children, onClose, onShown, animateClose, overlay, motion, swipeEnabled }: { backdrop: Backdrop; children: SheetContent; overlay?: ReactNode; onClose: () => void; onShown?: () => void; animateClose: boolean; motion: SheetMotion; swipeEnabled: boolean }) {
  const [shown, setShown] = useState(false);
  const [presented, setPresented] = useState(true);
  const finished = useRef(false);
  const [closing, setClosing] = useState(false);
  const [completion, setCompletion] = useState<(() => void) | null>(null);
  const requestClose = useCallback((afterClose?: () => void, forceAnimation = false) => {
    if (closing) return;
    Keyboard.dismiss();
    const action = typeof afterClose === 'function' ? afterClose : onClose;
    if (animateClose || forceAnimation) { setCompletion(previous => previous ?? action); setClosing(true); } else action();
  }, [animateClose, onClose, closing]);
  const complete = useCallback(() => { if (finished.current) return; finished.current = true; setCompletion(null); completion?.(); }, [completion]);
  const hide = useCallback(() => { setPresented(false); if (Platform.OS !== 'ios') complete(); }, [complete]);
  return <Modal visible={presented} transparent animationType="none" onDismiss={complete} onShow={() => { setShown(true); onShown?.(); }} onRequestClose={() => requestClose()}>
    <SheetTransition backdrop={typeof backdrop === 'function' ? backdrop(requestClose) : backdrop} shown={shown} closing={closing} onHidden={hide} motion={motion} overlay={overlay} swipeEnabled={swipeEnabled} onSwipeClose={() => requestClose(undefined, true)}>{typeof children === 'function' ? children(requestClose) : children}</SheetTransition>
  </Modal>;
}

// Визуальная ручка сохраняет размер макета; область жеста занимает верхние40pt листа.
export function SheetGrabber({ style }: { style: StyleProp<ViewStyle> }) {
  const context = useContext(SheetDragContext);
  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !!context?.enabled,
    onMoveShouldSetPanResponder: (_, gesture) => !!context?.enabled && gesture.dy > 4 && gesture.dy > Math.abs(gesture.dx) * 1.3,
    onPanResponderGrant: () => { context?.drag.stopAnimation(); Keyboard.dismiss(); },
    onPanResponderMove: (_, gesture) => { if (context?.enabled) context.drag.setValue(Math.max(0, gesture.dy)); },
    onPanResponderRelease: (_, gesture) => {
      if (!context?.enabled) return;
      if (gesture.dy > 72 || (gesture.dy > 18 && gesture.vy > .65)) context.close();
      else Animated.spring(context.drag, { toValue: 0, damping: 24, stiffness: 260, mass: 1, useNativeDriver: Platform.OS !== 'web' }).start();
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderTerminate: () => { if (context) Animated.spring(context.drag, { toValue: 0, useNativeDriver: Platform.OS !== 'web' }).start(); },
  }), [context]);
  if (!context) return <View pointerEvents="none" style={style} />;
  const visual = StyleSheet.flatten(style);
  return <View testID="sheet-grabber" {...pan.panHandlers} accessible={context.enabled} accessibilityRole="button" accessibilityLabel="Закрыть лист свайпом вниз" accessibilityHint="Потяните верхний край вниз" onAccessibilityTap={() => { if (context.enabled) context.close(); }} onAccessibilityEscape={() => { if (context.enabled) context.close(); }} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 40, zIndex: 30, ...(Platform.OS === 'web' ? { touchAction: 'none' } : {}) }}><View pointerEvents="none" style={[visual, { position: 'absolute', top: visual?.top ?? 12, alignSelf: 'center' }]} /></View>;
}
