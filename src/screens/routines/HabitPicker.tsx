import { SheetScrollView as ScrollView, SheetGrabber, SheetModal } from '@/components/SheetModal';
import { useAppState } from '@/state/app';
import { HabitForm } from './HabitForm';
import { Image } from 'expo-image';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/motion';
import { art } from '@/data/art';
import { countLabel } from '@/data/appGroup';
import { habitCatalog, type Habit, type HabitId } from '@/data/routine';
import { T } from '@/theme/typography';
import { colors, routineTheme as c, lockTheme as l, habitFormTheme as f } from '@/theme/tokens';
export function HabitPicker({ value, onCancel, onSave, library = false }: { library?: boolean; value: HabitId[]; onCancel: () => void; onSave: (ids: HabitId[], definitions: Habit[]) => void }) {
  const app = useAppState();
  const catalog = habitCatalog(app.customHabits);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const [editor, setEditor] = useState<Habit | 'new' | null>(null);
  useEffect(() => { if (!library) return; const timer = setTimeout(() => scroll.current?.scrollTo({ y: 165, animated: false }), 350); return () => clearTimeout(timer); }, [library]);
  const [selected, setSelected] = useState(() => [...value]);
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();
  const needle = query.trim().toLocaleLowerCase();
  const visible = catalog.filter(h => h.kind !== 'manual').filter(habit => habit.label.toLocaleLowerCase().includes(needle));
  return <SheetModal animateClose nativeOffset={Math.max(69, insets.top + 10)} onClose={onCancel} backdrop={close => <Pressable accessibilityLabel="Отменить выбор привычек" onPress={() => close()} style={[StyleSheet.absoluteFill, { backgroundColor: f.backdrop }]} />}>{close => <>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} pointerEvents="box-none" style={{ flex: 1, paddingTop: Math.max(69, insets.top + 10) }}>
      <View style={styles.sheet} accessibilityViewIsModal><SheetGrabber style={styles.handle} /><T size={20} center ls={0} style={styles.title}>Все привычки</T>
        <View style={styles.search}><Icon name="session-search" width={19} height={19} color={c.placeholder} /><TextInput accessibilityLabel="Поиск привычек" value={query} onChangeText={setQuery} placeholder="Поиск или новая привычка" placeholderTextColor={c.placeholder} autoCorrect={false} autoCapitalize="none" style={styles.input} /></View>
        <ScrollView ref={scroll} contentContainerStyle={{ paddingBottom: 40 }} contentOffset={{ x: 0, y: library ? 165 : 0 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={styles.list}>
          {!needle && <><T size={20} color={c.group} ls={0} style={{ lineHeight: 24 }}>Полезные приложения</T><T size={14} color={c.note} ls={0} style={styles.example}>Например, «Читать 15 минут»</T><View accessibilityState={{ disabled: true }} style={[styles.row, { height: 65, marginTop: 10 }]}><Image source={art.habitPhone} style={styles.emoji} /><View style={{ flex: 1 }}><T size={15} weight={400} variant="display" ls={0}>Полезное приложение</T><View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}><T size={14} weight={400} color={c.muted} ls={0}>Проверка</T><Icon name="habit-block" width={14} height={14} /></View></View><View style={styles.circle} /></View></>}
          <View style={{ marginTop: needle ? 0 : 48 }}><T size={20} color={c.group} ls={0} style={{ lineHeight: 24 }}>Проверка по фото (ИИ)</T><T size={14} color={c.note} ls={0} style={styles.example}>Напр., «Выпить воды» — подтвердить фото</T>
          {visible.map((habit, i) => <PressScale key={habit.id} accessibilityRole="checkbox" accessibilityLabel={`Привычка ${habit.label}`} accessibilityState={{ checked: selected.includes(habit.id) }} onPress={() => setSelected(ids => ids.includes(habit.id) ? ids.filter(id => id !== habit.id) : [...ids, habit.id])} style={[styles.row, { marginTop: i ? 12 : 9 }]}><Image source={habit.image} style={styles.emoji} /><T size={15} weight={400} variant="display" ls={0} style={{ flex: 1 }}>{habit.label}</T><PressScale accessibilityRole="button" accessibilityLabel={`Редактировать ${habit.label}`} onPress={event => { event.stopPropagation(); setEditor(habit); }} style={{ marginRight: 16 }} hitSlop={8}><Icon name="pencil" width={15} height={17} color={c.edit} /></PressScale><View style={[styles.circle, selected.includes(habit.id) && { backgroundColor: c.blue, borderColor: c.blue }]}>{selected.includes(habit.id) && <Icon name="period-check" width={18} height={20} color={colors.white} />}</View></PressScale>)}
          {!visible.length && <T size={14} weight={400} color={c.note} center style={{ marginTop: 20 }}>Ничего не найдено</T>}</View>
          <PressScale accessibilityRole="button" accessibilityLabel="Создать привычку" onPress={() => setEditor('new')} style={styles.create}><View style={styles.createPlus}><Icon name="plus" width={11} height={13} color={f.createInk} /></View><T size={15} color={f.createInk} ls={0}>Создать привычку</T></PressScale>
          {!needle && <View style={{ marginTop: 42 }}><T size={20} color={c.group} ls={0}>Выполнить задачу</T><T size={14} color={c.note} ls={0} style={styles.example}>Напр., «Маникюр» — отметить вручную</T><View accessibilityState={{ disabled: true }} style={[styles.row, { marginTop: 9 }]}><Image source={art.habitShower} style={styles.emoji} /><T size={15} weight={400} variant="display" ls={0} style={{ flex: 1 }}>Принять холодный душ</T><Icon name="pencil" width={15} height={17} color={c.edit} style={{ marginRight: 16 }} /><View style={styles.circle} /></View></View>}
        </ScrollView>
        <PressScale accessibilityRole="button" accessibilityLabel="Добавить выбранные привычки" disabled={!selected.length} accessibilityState={{ disabled: !selected.length }} onPress={() => close(() => onSave([...selected], catalog.filter(habit => selected.includes(habit.id)).map(habit => ({ ...habit }))))} style={[styles.save, { bottom: Math.max(39, insets.bottom + 5), backgroundColor: selected.length ? l.dark : l.disabled }]}><T size={17} color={selected.length ? colors.white : l.disabledInk} ls={0}>Добавить {countLabel(selected.length, 'привычку', 'привычки', 'привычек')}</T></PressScale>
      </View>
    </KeyboardAvoidingView>
    {editor && <HabitForm value={editor === 'new' ? undefined : editor} onCancel={() => setEditor(null)} onSave={habit => { const created = editor === 'new'; app.upsertHabit(habit); setSelected(ids => ids.includes(habit.id) ? ids : [...ids, habit.id]); setQuery(''); setEditor(null); if (created) setTimeout(() => scroll.current?.scrollTo({ y: 282, animated: false }), 350); }} />}
  </>}</SheetModal>;
}
const styles = StyleSheet.create({
 sheet: { flex: 1, backgroundColor: l.surface, borderRadius: c.pickerRadius, overflow: 'hidden' }, handle: { position: 'absolute', top: 12, width: 64, height: 5, borderRadius: 5, alignSelf: 'center', backgroundColor: l.handle }, title: { position: 'absolute', top: 44, left: 0, right: 0, lineHeight: 24 }, search: { position: 'absolute', top: 97, left: 20, right: 20, height: 54, paddingHorizontal: 20, gap: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: l.searchBorder, borderRadius: l.searchRadius }, input: { flex: 1, height: 52, padding: 0, outlineWidth: 0, color: l.ink, fontSize: 15, fontWeight: '400' },
  create: { marginTop: 12, height: 42, borderWidth: 1.3, borderStyle: 'dashed', borderColor: f.createBorder, borderRadius: 24, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }, createPlus: { width: 24, height: 24, borderRadius: 12, backgroundColor: f.createFill, alignItems: 'center', justifyContent: 'center' },
  list: { position: 'absolute', top: 175, left: 20, right: 20, bottom: 114 }, example: { marginTop: 8, lineHeight: 17 }, row: { height: 55, borderRadius: c.cardRadius, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }, emoji: { width: 24, height: 24, marginRight: 10 }, circle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: c.border, justifyContent: 'center', alignItems: 'center' }, save: { position: 'absolute', left: 20, right: 20, height: 60, borderRadius: l.buttonRadius, alignItems: 'center', justifyContent: 'center' },
});
