import { createContext, useContext, useEffect, useRef, useState, type ComponentProps, type ComponentRef } from 'react';
import { View, type LayoutChangeEvent, type ViewProps } from 'react-native';
import { SheetScrollView } from './SheetModal';

const AnchorContext = createContext<(event: LayoutChangeEvent) => void>(() => {});

// Шапка остаётся в одном списке; раскрытый раздел достигается настоящей прокруткой.
export function RuleEditorScrollView({ focus, focusOffset = 0, children, onLayout, onContentSizeChange, ...props }: ComponentProps<typeof SheetScrollView> & { focus: string | null; focusOffset?: number }) {
  const list = useRef<ComponentRef<typeof SheetScrollView>>(null);
  const [viewport, setViewport] = useState(0);
  const [content, setContent] = useState(0);
  const [anchor, setAnchor] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => list.current?.scrollTo({ y: focus ? Math.max(0, Math.min(Math.max(0, anchor - 90), Math.max(0,content-viewport)) - focusOffset) : 0, animated: true }), 220);
    return () => clearTimeout(timer);
  }, [focus, anchor, focusOffset, content, viewport]);
  return <AnchorContext.Provider value={event => setAnchor(event.nativeEvent.layout.y)}><SheetScrollView {...props} ref={list} onLayout={e=>{setViewport(e.nativeEvent.layout.height);onLayout?.(e);}} onContentSizeChange={(w,h)=>{setContent(h);onContentSizeChange?.(w,h);}}>{children}</SheetScrollView></AnchorContext.Provider>;
}

export function RuleEditorScrollAnchor({ onLayout, ...props }: ViewProps) {
  const measure = useContext(AnchorContext);
  return <View {...props} onLayout={event => { measure(event); onLayout?.(event); }} />;
}
