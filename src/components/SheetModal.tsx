import { colors } from '@/theme/tokens';
import { createContext, useContext, useMemo, useCallback, useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { Animated, Easing, Keyboard, Modal, PanResponder, Platform, ScrollView, StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';

export type SheetClose = (afterClose?: () => void) => void;
export type SheetContent = ReactNode | ((close: SheetClose) => ReactNode);
type SheetMotion = 'sheet' | 'dialog';
const sheetGestureStack: object[] = [];
function useSheetPriority(enabled = true) {
  const [identity] = useState(() => ({}));
  useEffect(() => { if (!enabled) return; sheetGestureStack.push(identity); return () => { const index = sheetGestureStack.indexOf(identity); if (index >= 0) sheetGestureStack.splice(index, 1); }; }, [enabled, identity]);
  return identity;
}
class SheetScrollTracker {
  private offset = 0;
  private owner: object | null = null;
  reset() { this.offset = 0; this.owner = null; }
  claim(owner: object, value: number) { if (this.owner === null) { this.owner = owner; this.offset = value; } }
  update(owner: object, value: number) { if (this.owner === owner) this.offset = value; }
  block() { this.owner = this; this.offset = Infinity; }
  set(value: number) { this.offset = value; }
  get() { return this.offset; }
}
type DragContext = { drag: Animated.Value; close: () => void; enabled: boolean; scroll: SheetScrollTracker };
const SheetDragContext = createContext<DragContext | null>(null);
type Backdrop = ReactNode | ((requestClose: SheetClose) => ReactNode);
// Подложка неподвижна; перемещается только содержимое, в том числе при закрытии.
export function SheetTransition({ backdrop, children, shown = true, closing = false, onHidden, motion = 'sheet', overlay, onSwipeClose, swipeEnabled = true }: { backdrop: ReactNode; children: ReactNode; shown?: boolean; closing?: boolean; onHidden?: () => void; motion?: SheetMotion; overlay?: ReactNode; onSwipeClose?: () => void; swipeEnabled?: boolean }) {
  const { height } = useWindowDimensions();
  const priority = useSheetPriority();
  const [progress] = useState(() => new Animated.Value(0));
  const [drag] = useState(() => new Animated.Value(0));
  const [scroll] = useState(() => new SheetScrollTracker());
  const bodyPan = useMemo(() => {
    const start = new SheetScrollTracker();
    return PanResponder.create({
      onStartShouldSetPanResponderCapture: () => { scroll.reset(); return false; },
      onMoveShouldSetPanResponderCapture: (_, g) => sheetGestureStack.at(-1) === priority && swipeEnabled && !!onSwipeClose && motion === 'sheet' && shown && !closing && scroll.get() <= 0 && g.dy > 6 && g.dy > Math.abs(g.dx) * 1.3,
      onPanResponderGrant: (_, g) => { start.set(g.dy); drag.stopAnimation(); Keyboard.dismiss(); },
      onPanResponderMove: (_, g) => drag.setValue(Math.max(0, g.dy - start.get())),
      onPanResponderRelease: (_, g) => { const distance = g.dy - start.get(); if (distance > 72 || (distance > 18 && g.vy > .65)) onSwipeClose?.(); else Animated.spring(drag, { toValue: 0, damping: 24, stiffness: 260, mass: 1, useNativeDriver: Platform.OS !== 'web' }).start(); },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: () => Animated.spring(drag, { toValue: 0, useNativeDriver: Platform.OS !== 'web' }).start(),
    });
  }, [swipeEnabled, onSwipeClose, motion, shown, closing, drag, scroll, priority]);
  const hidden = useRef(onHidden);
  useEffect(() => { hidden.current = onHidden; }, [onHidden]);
  useEffect(() => {
    if (!shown) return;
    const animation = Animated.timing(progress, { toValue: closing ? 0 : 1, duration: motion === 'dialog' ? closing ? 180 : 220 : closing ? 240 : 320, easing: closing ? Easing.in(Easing.cubic) : Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' });
    animation.start(({ finished }) => { if (finished && closing) hidden.current?.(); });
    return () => animation.stop();
  }, [shown, closing, progress, motion]);
  return <SheetDragContext.Provider value={{ drag, scroll, close: onSwipeClose ?? (() => {}), enabled: swipeEnabled && !!onSwipeClose && motion === 'sheet' && shown && !closing }}><View pointerEvents={closing ? 'none' : 'box-none'} style={{ flex: 1 }}>
    <Animated.View testID={motion === 'dialog' ? 'dialog-backdrop' : 'sheet-backdrop'} style={[StyleSheet.absoluteFill, { opacity: motion === 'dialog' ? progress : progress.interpolate({ inputRange: [0, .6, 1], outputRange: [0, 1, 1] }) }]}>{backdrop}</Animated.View>
    <Animated.View {...bodyPan.panHandlers} testID={motion === 'dialog' ? 'dialog-content' : 'sheet-content'} pointerEvents="box-none" style={[StyleSheet.absoluteFill, motion === 'dialog' ? { opacity: progress } : { transform: [{ translateY: Animated.add(progress.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }), drag) }] }]}>{children}</Animated.View>
    {overlay != null && overlay !== false && <Animated.View testID="sheet-overlay" pointerEvents="box-none" style={[StyleSheet.absoluteFill, { opacity: progress }]}>{overlay}</Animated.View>}
  </View></SheetDragContext.Provider>;
}
export function SheetModal({ backdrop, children, onClose, visible = true, onShown, animateClose = false, overlay, motion = 'sheet', swipeEnabled = true, nativeOffset, nativeSurface = colors.bg }: { backdrop: Backdrop; children: SheetContent; overlay?: ReactNode; onClose: () => void; visible?: boolean; onShown?: () => void; animateClose?: boolean; motion?: SheetMotion; swipeEnabled?: boolean; nativeOffset?: number; nativeSurface?: string }) {
  return visible ? <PresentedSheet backdrop={backdrop} onClose={onClose} onShown={onShown} animateClose={animateClose} overlay={overlay} motion={motion} swipeEnabled={swipeEnabled} nativeOffset={nativeOffset} nativeSurface={nativeSurface}>{children}</PresentedSheet> : null;
}
function PresentedSheet({ backdrop, children, onClose, onShown, animateClose, overlay, motion, swipeEnabled, nativeOffset, nativeSurface }: { backdrop: Backdrop; children: SheetContent; overlay?: ReactNode; onClose: () => void; onShown?: () => void; animateClose: boolean; motion: SheetMotion; swipeEnabled: boolean; nativeOffset?: number; nativeSurface: string }) {
  const nativePage = Platform.OS === 'ios' && nativeOffset != null && motion === 'sheet';
  useSheetPriority(nativePage);
  const [shown, setShown] = useState(false);
  const [presented, setPresented] = useState(true);
  const finished = useRef(false);
  const [closing, setClosing] = useState(false);
  const [completion, setCompletion] = useState<(() => void) | null>(null);
  const requestClose = useCallback((afterClose?: () => void, forceAnimation = false) => {
    if (closing) return;
    Keyboard.dismiss();
    const action = typeof afterClose === 'function' ? afterClose : onClose;
    if (nativePage) { setCompletion(previous => previous ?? action); setPresented(false); }
    else if (animateClose || forceAnimation) { setCompletion(previous => previous ?? action); setClosing(true); } else action();
  }, [animateClose, onClose, closing, nativePage]);
  const complete = useCallback(() => { if (finished.current) return; finished.current = true; setCompletion(null); completion?.(); }, [completion]);
  const hide = useCallback(() => { setPresented(false); if (Platform.OS !== 'ios') complete(); }, [complete]);
  if (nativePage) return <Modal visible={presented} transparent={false} presentationStyle="pageSheet" animationType="slide" allowSwipeDismissal={swipeEnabled} backdropColor={nativeSurface} onShow={onShown} onDismiss={complete} onRequestClose={() => { if (!swipeEnabled || finished.current) return; finished.current = true; Keyboard.dismiss(); onClose(); }}><SheetDragContext.Provider value={null}><View style={{ flex: 1, backgroundColor: nativeSurface }}><View style={{ position: 'absolute', left: 0, right: 0, top: -nativeOffset!, bottom: 0 }}>{typeof children === 'function' ? children(requestClose) : children}</View>{overlay}</View></SheetDragContext.Provider></Modal>;
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
    onPanResponderGrant: () => { context?.scroll.block(); context?.drag.stopAnimation(); Keyboard.dismiss(); },
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
  const inFlow = visual?.position !== 'absolute';
  const grabber = <View testID="sheet-grabber" {...pan.panHandlers} accessible={context.enabled} accessibilityRole="button" accessibilityLabel="Закрыть лист свайпом вниз" accessibilityHint="Потяните верхний край вниз" onAccessibilityTap={() => { if (context.enabled) context.close(); }} onAccessibilityEscape={() => { if (context.enabled) context.close(); }} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 40, zIndex: 30, ...(Platform.OS === 'web' ? { touchAction: 'none' } : {}) }}><View pointerEvents="none" style={[visual, { position: 'absolute', top: visual?.top ?? visual?.marginTop ?? 12, marginTop: 0, alignSelf: 'center' }]} /></View>;
  return inFlow ? <View pointerEvents="box-none" style={{ height: Number(visual?.height ?? 5) + Number(visual?.marginTop ?? 0) }}>{grabber}</View> : grabber;
}

// Отслеживаем прокрутку именно того списка, с которого начался жест.
export function SheetScrollView({ onScroll, onTouchStart, scrollEventThrottle = 16, ...props }: ComponentProps<typeof ScrollView>) {
  const context = useContext(SheetDragContext);
  const offset = useRef(props.contentOffset?.y ?? 0);
  const [source] = useState(() => ({}));
  return <ScrollView {...props} scrollEventThrottle={scrollEventThrottle} onTouchStart={event => { if (context) context.scroll.claim(source, offset.current); onTouchStart?.(event); }} onScroll={event => { offset.current = event.nativeEvent.contentOffset.y; if (context) context.scroll.update(source, offset.current); onScroll?.(event); }} />;
}
export function useSheetGestureBlocker() {
  const context = useContext(SheetDragContext);
  return () => { if (context) context.scroll.block(); };
}
