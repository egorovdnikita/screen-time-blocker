import { Image } from 'expo-image';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from './Icon';
import { PressScale } from './motion';
import { T, rounded } from '@/theme/typography';
import { colors, timeLimitTheme as c } from '@/theme/tokens';

export function RuleEditorHeader({ title, fallback, subtitle, subtitleColor, image, width, height, top, onTitleChange, editLabel, inputLabel }: { title: string; fallback: string; subtitle: string; subtitleColor?: string; image: number; width: number; height: number; top: number; onTitleChange: (title: string) => void; editLabel: string; inputLabel: string }) {
  const [editing, setEditing] = useState(false);
  return <View style={styles.header}><Image source={image} style={{ width, height, marginTop: top }} />{editing ? <TextInput accessibilityLabel={inputLabel} autoFocus value={title} onChangeText={onTitleChange} onBlur={() => { onTitleChange(title.trim() || fallback); setEditing(false); }} maxLength={80} style={styles.titleInput} /> : <PressScale accessibilityLabel={editLabel} accessibilityRole="button" onPress={() => setEditing(true)} style={styles.title}><T size={27} ls={0} numberOfLines={1} style={{ flexShrink: 1 }}>{title}</T><Icon name="pencil" width={18} height={18} color={colors.chevronCompact} /></PressScale>}<T size={14} weight={400} color={subtitleColor ?? c.subtitle} center ls={0} style={styles.subtitle}>{subtitle}</T></View>;
}
export type EditorSuggestion = { title: string; caption: string; image: number; onPress?: () => void };
export function RuleSuggestions({ items, style }: { items: EditorSuggestion[]; style?: StyleProp<ViewStyle> }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} style={style} contentContainerStyle={styles.suggestions}>{items.map(item => <PressScale key={item.title} accessibilityRole="button" accessibilityLabel={`Рекомендация ${item.title}`} accessibilityState={{ disabled: !item.onPress }} disabled={!item.onPress} onPress={item.onPress} style={styles.suggestion}><Image source={item.image} style={StyleSheet.absoluteFill} /><T size={12} weight={400} color={colors.white} ls={0} style={{ marginLeft: 22, marginTop: 21 }}>{item.caption}</T><T size={15} color={colors.white} ls={0} style={{ marginLeft: 8, marginTop: 7 }}>{item.title}</T></PressScale>)}</ScrollView>;
}
const styles = StyleSheet.create({
  header: { height: 234, alignItems: 'center', backgroundColor: colors.white }, title: { marginTop: 18, height: 33, flexDirection: 'row', alignItems: 'center', gap: 3, maxWidth: '90%' }, titleInput: { marginTop: 18, height: 33, width: '90%', textAlign: 'center', fontSize: 27, fontWeight: '700', fontFamily: rounded, color: c.ink }, subtitle: { marginTop: 9, marginHorizontal: 24, lineHeight: 18 }, suggestions: { paddingHorizontal: 20, gap: 8 }, suggestion: { width: 160, height: 80, borderRadius: 20, overflow: 'hidden' },
});

// Неподвижная область ручки: содержимое остаётся частью настоящего списка под ней.
export function RuleEditorScrollCap({ active }: { active: boolean }) {
  return active ? <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 64, backgroundColor: colors.white }} /> : null;
}
