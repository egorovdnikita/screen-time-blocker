import { Image } from 'expo-image';
import { useRef, useState, type ComponentRef } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SheetModal } from '@/components/SheetModal';
import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/motion';
import { art } from '@/data/art';
import { newHabit, type Habit } from '@/data/routine';
import { durationLabel } from '@/data/session';
import { colors, lockTheme as l, habitFormTheme as c } from '@/theme/tokens';
import { T, rounded } from '@/theme/typography';
import { UnlockDuration } from '../session/SessionUnlocks';

export function HabitForm({ value, onCancel, onSave }: { value?: Habit; onCancel: () => void; onSave: (habit: Habit) => void }) {
  const [draft, setDraft] = useState<Habit>(() => value ? { ...value } : newHabit());
  const [nameFocused, setNameFocused] = useState(!value);
  const [duration, setDuration] = useState(false);
  const nameInput = useRef<ComponentRef<typeof TextInput>>(null);
  const focusReady = useRef(!!value);
  const onShown = () => { if (value) return; requestAnimationFrame(() => { focusReady.current = true; nameInput.current?.focus(); }); };
  const insets = useSafeAreaInsets();
  const valid = !!draft.title.trim() && (draft.kind === 'manual' || !!draft.criterion?.trim());
  const save = () => { if (!valid) return; Keyboard.dismiss(); onSave({ ...draft, label: draft.title.trim(), title: draft.title.trim(), criterion: draft.criterion?.trim() }); };
  return <SheetModal onShown={onShown} onClose={onCancel} backdrop={<Pressable accessibilityLabel="Отменить редактирование привычки" onPress={onCancel} style={[StyleSheet.absoluteFill, { backgroundColor: c.backdrop }]} />}>
    <View pointerEvents="none" style={[styles.back, { top: Math.max(59, insets.top) }]} />
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} pointerEvents="box-none" style={{ flex: 1, paddingTop: Math.max(69, insets.top + 10) }}>
      <View style={styles.sheet} accessibilityViewIsModal>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={styles.header}><View style={styles.handle} /><PressScale accessibilityRole="button" accessibilityLabel="Закрыть новую привычку" onPress={onCancel} style={[styles.round, { left: 20, backgroundColor: colors.white }]}><Icon name="session-clear" width={21} height={21} color={colors.black} /></PressScale><PressScale accessibilityRole="button" accessibilityLabel="Сохранить привычку" disabled={!valid} accessibilityState={{ disabled: !valid }} onPress={save} style={[styles.round, { right: 20, backgroundColor: l.blue, opacity: valid ? 1 : .5 }]}><Icon name="group-check" width={24} height={26} color={colors.white} /></PressScale>
            <Image source={draft.title ? draft.image : art.habitCamera} style={{ position: 'absolute', top: 114, alignSelf: 'center', width: draft.title ? 47 : 55, height: draft.title ? 53 : 51 }} />
            {nameFocused ? <TextInput ref={nameInput} accessibilityLabel="Имя привычки" autoFocus value={draft.title} onChangeText={title => setDraft(d => ({ ...d, title }))} placeholder="Имя привычки" placeholderTextColor={c.placeholder} maxLength={80} onBlur={() => { if (focusReady.current) setNameFocused(false); }} onSubmitEditing={() => Keyboard.dismiss()} returnKeyType="done" style={styles.name} /> : <PressScale accessibilityRole="button" accessibilityLabel="Изменить имя привычки" onPress={() => setNameFocused(true)} style={styles.nameRow}><T size={27} color={draft.title ? c.ink : c.placeholder} ls={0} numberOfLines={1}>{draft.title || 'Имя привычки'}</T><Icon name="pencil" width={17} height={18} color={c.edit} /></PressScale>}
          </View>
          <View style={styles.body}><T size={20} color={c.label} ls={0} style={styles.label}>Действие</T><View style={styles.action}><T size={15} weight={400} ls={0}>{draft.kind === 'manual' ? 'Отметить вручную' : 'Фото в подтверждение…'}</T></View>
            {draft.kind !== 'manual' && <><View style={styles.description}><TextInput accessibilityLabel="Описание фото для привычки" value={draft.criterion ?? ''} onChangeText={criterion => setDraft(d => ({ ...d, criterion }))} multiline maxLength={2000} placeholder="Опишите, что ИИ должен увидеть на фото: чистую раковину, стакан воды или другой результат." placeholderTextColor={c.muted} textAlignVertical="top" style={styles.descriptionInput} />{!draft.criterion && <Icon name="pencil" width={17} height={18} color={c.edit} style={{ position: 'absolute', top: 18, right: 15 }} />}</View><View style={[styles.ai, nameFocused && { opacity: .3 }]}><Icon name="habit-block" width={14} height={14} /><T size={12} weight={400} color={c.muted} ls={0}>Проверяет ИИ</T></View></>}
            {!nameFocused && <View style={{ marginTop: 39 }}><T size={20} color={c.label} ls={0} style={styles.label}>Награда</T><PressScale accessibilityRole="button" accessibilityLabel="Награда привычки" onPress={() => setDuration(true)} style={styles.action}><T size={15} weight={400} ls={0}>Длительность</T><T size={14} color={c.muted} ls={0} style={{ marginLeft: 'auto' }}>{durationLabel(draft.minutes)}</T><Icon name="chevron-right" width={9} height={13} color={c.edit} style={{ marginLeft: 12 }} /></PressScale><T size={12} weight={400} color={c.muted} center ls={0} style={{ marginTop: 14, lineHeight: 16 }}>Это время вы получите в заблокированных приложениях.</T></View>}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
    {duration && <UnlockDuration value={draft.minutes} onCancel={() => setDuration(false)} onConfirm={minutes => { setDraft(d => ({ ...d, minutes })); setDuration(false); }} />}
  </SheetModal>;
}
const styles = StyleSheet.create({
  nameRow: { position: 'absolute', top: 184, left: 18, right: 18, height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  back: { position: 'absolute', left: 16, right: 16, bottom: 14, borderRadius: l.panelRadius, backgroundColor: l.backSheet }, sheet: { flex: 1, borderRadius: l.panelRadius, backgroundColor: l.surface, overflow: 'hidden' }, header: { height: 235, backgroundColor: colors.white }, handle: { position: 'absolute', top: 12, width: 64, height: 5, borderRadius: 5, alignSelf: 'center', backgroundColor: l.handle }, round: { position: 'absolute', top: 45, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', boxShadow: c.roundShadow }, name: { position: 'absolute', top: 184, left: 18, right: 18, height: 36, padding: 0, textAlign: 'center', fontFamily: rounded, fontSize: 27, lineHeight: 33, fontWeight: '700', color: c.ink, outlineWidth: 0 }, body: { paddingTop: 22, paddingHorizontal: 20 }, label: { lineHeight: 24, marginBottom: 13 }, action: { height: 49, borderRadius: c.sectionRadius, backgroundColor: colors.white, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }, description: { marginTop: 12, height: 91, borderRadius: c.descriptionRadius, borderWidth: 1, borderColor: c.border }, descriptionInput: { flex: 1, paddingTop: 17, paddingBottom: 17, paddingLeft: 15, paddingRight: 35, fontSize: 15, lineHeight: 19, color: c.ink, outlineWidth: 0 }, ai: { marginTop: 12, height: 22, alignSelf: 'center', borderWidth: 1, borderColor: c.badgeBorder, borderRadius: 18, backgroundColor: colors.white, paddingHorizontal: 8, gap: 3, flexDirection: 'row', alignItems: 'center' },
});
