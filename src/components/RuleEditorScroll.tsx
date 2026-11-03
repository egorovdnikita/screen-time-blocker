import { createContext, useContext, useEffect, useRef, useState, type ComponentProps, type ComponentRef } from 'react';
import { View, type LayoutChangeEvent, type ViewProps } from 'react-native';
import { SheetScrollView } from './SheetModal';

const AnchorContext = createContext<(event: LayoutChangeEvent) => void>(() => {});

// Шапка остаётся в одном списке; раскрытый раздел достигается настоящей прокруткой.
export function RuleEditorScrollView({ focus, children, ...props }: ComponentProps<typeof SheetScrollView> & { focus: string | null }) {
  const list = useRef<ComponentRef<typeof SheetScrollView>>(null);
  const [anchor, setAnchor] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => list.current?.scrollTo({ y: focus ? Math.max(0, anchor - 90) : 0, animated: true }), 220);
    return () => clearTimeout(timer);
  }, [focus, anchor]);
  return <AnchorContext.Provider value={event => setAnchor(event.nativeEvent.layout.y)}><SheetScrollView {...props} ref={list}>{children}</SheetScrollView></AnchorContext.Provider>;
}

export function RuleEditorScrollAnchor({ onLayout, ...props }: ViewProps) {
  const measure = useContext(AnchorContext);
  return <View {...props} onLayout={event => { measure(event); onLayout?.(event); }} />;
}
