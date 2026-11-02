import { Image } from 'expo-image';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/motion';
import { SheetModal } from '@/components/SheetModal';
import { art } from '@/data/art';
import { countLabel } from '@/data/appGroup';
import { habits, type HabitId } from '@/data/routine';
import { T } from '@/theme/typography';
import { colors, routineTheme as c, lockTheme as l } from '@/theme/tokens';
export function HabitPicker({ value, onCancel, onSave }: { value: HabitId[]; onCancel: () => void; onSave: (ids: HabitId[]) => void }) {
  const [selected, setSelected] = useState(() => [...value]);
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();
  const needle = query.trim().toLocaleLowerCase();
  const visible = habits.filter(habit => habit.label.toLocaleLowerCase().includes(needle));
  return <SheetModal onClose={onCancel} backdrop={<Pressable accessibilityLabel="Отменить выбор привычек" onPress={onCancel} style={[StyleSheet.absoluteFill, { backgroundColor: l.backdrop }]} />}>
    <View pointerEvents="none" style={[styles.back, { top: Math.max(59, insets.top) }]} />
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} pointerEvents="box-none" style={{ flex: 1, paddingTop: Math.max(69, insets.top + 10) }}>
      <View style={styles.sheet} accessibilityViewIsModal><View style={styles.handle} /><T size={20} center ls={0} style={styles.title}>Все привычки</T>
        <View style={styles.search}><Icon name="session-search" width={19} height={19} color={c.placeholder} /><TextInput accessibilityLabel="Поиск привычек" value={query} onChangeText={setQuery} placeholder="Поиск или новая привычка" placeholderTextColor={c.placeholder} autoCorrect={false} autoCapitalize="none" style={styles.input} /></View>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={styles.list}>
          {!needle && <><T size={20} color={c.group} ls={0} style={{ lineHeight: 24 }}>Полезные приложения</T><T size={14} color={c.note} ls={0} style={styles.example}>Например, «Читать 15 минут»</T><View accessibilityState={{ disabled: true }} style={[styles.row, { height: 65, marginTop: 10 }]}><Image source={art.habitPhone} style={styles.emoji} /><View style={{ flex: 1 }}><T size={15} weight={400} variant="display" ls={0}>Полезное приложение</T><View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}><T size={14} weight={400} color={c.muted} ls={0}>Проверка</T><Icon name="habit-block" width={14} height={14} /></View></View><View style={styles.circle} /></View></>}
          <View style={{ marginTop: needle ? 0 : 48 }}><T size={20} color={c.group} ls={0} style={{ lineHeight: 24 }}>Проверка по фото (ИИ)</T><T size={14} color={c.note} ls={0} style={styles.example}>Напр., «Выпить воды» — подтвердить фото</T>
          {visible.map((habit, i) => <PressScale key={habit.id} accessibilityRole="checkbox" accessibilityLabel={`Привычка ${habit.label}`} accessibilityState={{ checked: selected.includes(habit.id) }} onPress={() => setSelected(ids => ids.includes(habit.id) ? ids.filter(id => id !== habit.id) : [...ids, habit.id])} style={[styles.row, { marginTop: i ? 12 : 9 }]}><Image source={habit.image} style={styles.emoji} /><T size={15} weight={400} variant="display" ls={0} style={{ flex: 1 }}>{habit.label}</T><Icon name="pencil" width={15} height={17} color={c.edit} style={{ marginRight: 16 }} /><View style={[styles.circle, selected.includes(habit.id) && { backgroundColor: c.blue, borderColor: c.blue }]}>{selected.includes(habit.id) && <Icon name="period-check" width={18} height={20} color={colors.white} />}</View></PressScale>)}
          {!visible.length && <T size={14} weight={400} color={c.note} center style={{ marginTop: 20 }}>Ничего не найдено</T>}</View>
        </ScrollView>
        <PressScale accessibilityRole="button" accessibilityLabel="Добавить выбранные привычки" disabled={!selected.length} accessibilityState={{ disabled: !selected.length }} onPress={() => onSave([...selected])} style={[styles.save, { bottom: Math.max(39, insets.bottom + 5), backgroundColor: selected.length ? l.dark : l.disabled }]}><T size={17} color={selected.length ? colors.white : l.disabledInk} ls={0}>Добавить {countLabel(selected.length, 'привычку', 'привычки', 'привычек')}</T></PressScale>
      </View>
    </KeyboardAvoidingView>
  </SheetModal>;
}
const styles = StyleSheet.create({
  back: { position: 'absolute', left: 16, right: 16, bottom: 14, borderRadius: c.pickerRadius, backgroundColor: l.backSheet }, sheet: { flex: 1, backgroundColor: l.surface, borderRadius: c.pickerRadius, overflow: 'hidden' }, handle: { position: 'absolute', top: 12, width: 64, height: 5, borderRadius: 5, alignSelf: 'center', backgroundColor: l.handle }, title: { position: 'absolute', top: 44, left: 0, right: 0, lineHeight: 24 }, search: { position: 'absolute', top: 97, left: 20, right: 20, height: 54, paddingHorizontal: 20, gap: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: l.searchBorder, borderRadius: l.searchRadius }, input: { flex: 1, height: 52, padding: 0, outlineWidth: 0, color: l.ink, fontSize: 15, fontWeight: '400' },
  list: { position: 'absolute', top: 175, left: 20, right: 20, bottom: 114 }, example: { marginTop: 8, lineHeight: 17 }, row: { height: 55, borderRadius: c.cardRadius, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }, emoji: { width: 24, height: 24, marginRight: 10 }, circle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: c.border, justifyContent: 'center', alignItems: 'center' }, save: { position: 'absolute', left: 20, right: 20, height: 60, borderRadius: l.buttonRadius, alignItems: 'center', justifyContent: 'center' },
});
