import { SheetScrollView as ScrollView, SheetGrabber, SheetModal } from '@/components/SheetModal';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressScale } from '@/components/motion';
import { Icon } from '@/components/Icon';
import { AppCatalog } from '../locks/SingleAppPicker';
import type { LockAppId } from '@/data/lockRule';
import { colors, lockTheme as c, timeLimitTheme as l } from '@/theme/tokens';
import { T } from '@/theme/typography';

export function LimitAppPicker({ value, categories, onCancel, onSave }: { value: LockAppId[]; categories: string[]; onCancel: () => void; onSave: (apps: LockAppId[], categories: string[]) => void }) {
  const [selected, setSelected] = useState(() => [...value]);
  const [selectedCategories, setSelectedCategories] = useState(() => [...categories]);
  const count = selected.length + selectedCategories.length;
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();
  return <SheetModal nativeOffset={Math.max(69, insets.top + 10)} onClose={onCancel} backdrop={<Pressable accessibilityLabel="Отменить приложения лимита" onPress={onCancel} style={[StyleSheet.absoluteFill, { backgroundColor: c.backdrop }]} />}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} pointerEvents="box-none" style={{ flex: 1, paddingTop: Math.max(69, insets.top + 10) }}>
      <View style={styles.sheet} accessibilityViewIsModal>
        <SheetGrabber style={styles.handle} />
        <PressScale accessibilityRole="button" accessibilityLabel="Закрыть приложения лимита" onPress={onCancel} style={[styles.round, { left: 20, backgroundColor: colors.white }]}><Icon name="session-clear" width={22} height={22} color={colors.black} /></PressScale>
        <PressScale accessibilityRole="button" accessibilityLabel="Сохранить приложения лимита" disabled={!count} accessibilityState={{ disabled: !count }} onPress={() => onSave([...selected], [...selectedCategories])} style={[styles.round, { right: 20, backgroundColor: l.blue, opacity: count ? 1 : .5 }]}><Icon name="group-check" width={24} height={26} color={colors.white} /></PressScale>
        <View style={styles.summary}><T size={14} weight={600} color={l.blue} ls={0}>Будет закрыто:</T><T size={14} weight={400} color={l.blue} ls={0}>{selected.length || !selectedCategories.length ? `${selected.length} ${selected.length === 1 ? 'приложение' : selected.length > 1 && selected.length < 5 ? 'приложения' : 'приложений'}` : ''}{selected.length && selectedCategories.length ? ', ' : ''}{selectedCategories.length ? `${selectedCategories.length} ${selectedCategories.length === 1 ? 'категория' : selectedCategories.length < 5 ? 'категории' : 'категорий'}` : ''}</T></View>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={styles.list}><AppCatalog query={query} selected={selected} multiple categories={selectedCategories} onCategory={id => setSelectedCategories(ids => ids.includes(id) ? ids.filter(category => category !== id) : [...ids, id])} onSelect={id => setSelected(ids => ids.includes(id) ? ids.filter(app => app !== id) : [...ids, id])} /></ScrollView>
        <LinearGradient pointerEvents="none" colors={[c.pickerFade, c.pickerFadeMid, c.picker]} locations={[0, .4, 1]} style={styles.fade} />
        <View style={styles.search}><BlurView pointerEvents="none" intensity={32} tint="light" style={[StyleSheet.absoluteFill, { borderRadius: c.searchRadius }]} /><Icon name="session-search" width={20} height={20} color={colors.black} /><TextInput accessibilityLabel="Поиск приложений лимита" value={query} onChangeText={setQuery} placeholder="Поиск" autoCorrect={false} autoCapitalize="none" placeholderTextColor={c.note} style={styles.input} /><Icon name="group-microphone" width={20} height={23} color={c.note} /></View>
      </View>
    </KeyboardAvoidingView>
  </SheetModal>;
}
const styles = StyleSheet.create({
  sheet: { flex: 1, borderRadius: c.panelRadius, overflow: 'hidden', backgroundColor: c.picker }, handle: { position: 'absolute', top: 12, width: 64, height: 5, alignSelf: 'center', borderRadius: 5, backgroundColor: c.handle },
  round: { position: 'absolute', top: 45, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' }, summary: { position: 'absolute', top: 117, left: 0, right: 0, height: 49, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: l.summary },
  list: { position: 'absolute', top: 217, left: 16, right: 16, bottom: 8, borderRadius: c.categoryRadius, backgroundColor: colors.white }, fade: { position: 'absolute', top: 635, bottom: 0, left: 0, right: 0 },
  search: { position: 'absolute', left: 28, right: 28, bottom: 61, height: 48, borderRadius: c.searchRadius, backgroundColor: c.searchFill, paddingHorizontal: 18, flexDirection: 'row', gap: 8, alignItems: 'center', boxShadow: c.searchShadow, overflow: 'hidden' }, input: { position: 'relative', zIndex: 1, flex: 1, height: 48, fontSize: 17, color: c.ink, padding: 0, outlineWidth: 0 },
});
