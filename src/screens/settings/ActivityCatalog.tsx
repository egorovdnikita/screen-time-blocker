import { DarkButtonSurface } from '@/components/DarkButtonSurface';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SheetModal } from '@/components/SheetModal';
import { PressScale } from '@/components/motion';
import { Icon } from '@/components/Icon';
import { art } from '@/data/art';
import { activityCatalog, type ActivityDefinition } from '@/data/reflection';
import { sessionIcon, type SessionIconId } from '@/data/sessionIcons';
import { useAppState } from '@/state/app';
import { T } from '@/theme/typography';
import { colors, settingsTheme as c } from '@/theme/tokens';
import { SessionIconPicker } from '../session/SessionIconPicker';
import { SettingsStack } from './SettingsStack';

export function ActivityCatalog({ onClose }: { onClose: () => void }) {
  const app = useAppState();
  const catalog = activityCatalog(app.customActivities);
  const [editing, setEditing] = useState<ActivityDefinition | 'new' | null>(null);
  const insets = useSafeAreaInsets();
  return <SettingsStack onClose={onClose}><T size={20} color={c.title} center ls={0} style={{ position: 'absolute', top: 44, left: 20, right: 20, lineHeight: 25 }}>Занятия</T><T size={14} weight={600} color={c.description} ls={0} style={{ position: 'absolute', top: 101, left: 20, right: 20, lineHeight: 18 }}>{'Создайте занятия: зачем вам нужны приложения\nи сайты? Отмечайте их как теги на Главной.'}</T>
    <ScrollView accessibilityLabel="Список занятий" showsVerticalScrollIndicator={false} style={{ position: 'absolute', top: 167, left: 20, right: 20, bottom: 112 }} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>{catalog.filter(item => item.id !== 'care').map(item => <PressScale key={item.id} accessibilityRole="button" accessibilityLabel={`Изменить занятие ${item.title}`} onPress={() => setEditing(item)} style={styles.row}>{item.image ? <Image source={item.image} contentFit="contain" style={styles.emoji} /> : <T size={24} style={styles.emoji}>🧘</T>}<T size={14.25} color={colors.black} ls={0} numberOfLines={1} style={{ flex: 1, paddingRight: 16 }}>{item.title}</T><Icon name="activity-row-chevron" width={13} height={20} style={{ position: 'absolute', right: 16 }} /></PressScale>)}</ScrollView>
    <PressScale accessibilityRole="button" accessibilityLabel="Добавить занятие" onPress={() => setEditing('new')} style={[styles.add, { bottom: Math.max(37, insets.bottom + 3) }]}><DarkButtonSurface /><Icon name="plus" width={18} height={18} color={colors.white} /><T size={17} color={colors.white} ls={0}>Добавить</T></PressScale>
    {editing && <ActivityForm value={editing === 'new' ? undefined : editing} catalog={catalog} onCancel={() => { Keyboard.dismiss(); setEditing(null); }} onSave={activity => { app.upsertActivity(activity); setEditing(null); }} />}
  </SettingsStack>;
}
function ActivityForm({ value, catalog, onCancel, onSave }: { value?: ActivityDefinition; catalog: ActivityDefinition[]; onCancel: () => void; onSave: (activity: ActivityDefinition) => void }) {
  const [title, setTitle] = useState(value?.title ?? '');
  const [image, setImage] = useState(value?.image ?? art.activityNew);
  const [picker, setPicker] = useState(false);
  const [iconId, setIconId] = useState<SessionIconId>('magnifier');
  const valid = !!title.trim() && !catalog.some(item => item.id !== value?.id && item.title.trim().toLocaleLowerCase() === title.trim().toLocaleLowerCase());
  return <SheetModal animateClose onClose={onCancel} backdrop={close => <Pressable accessibilityLabel="Отменить занятие" onPress={() => close()} style={[StyleSheet.absoluteFill, { top: 69, backgroundColor: c.dim }]} />}>
    {close => <><KeyboardAvoidingView pointerEvents="box-none" behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}><View pointerEvents="none" style={{ flex: 1 }} /><View accessibilityViewIsModal style={styles.form}><View pointerEvents="none" style={styles.handle} /><PressScale accessibilityRole="button" accessibilityLabel="Сохранить занятие" disabled={!valid} accessibilityState={{ disabled: !valid }} onPress={() => { Keyboard.dismiss(); close(() => onSave({ id: value?.id ?? `activity-${Date.now()}`, title: title.trim(), image })); }} style={[styles.confirm, { backgroundColor: valid ? c.blue : c.formDisabled }]}><Icon name={value ? "reflection-confirm" : "plus"} width={18} height={18} color={valid ? colors.white : c.formDisabledInk} /></PressScale>
      <View style={styles.field}><PressScale accessibilityRole="button" accessibilityLabel="Выбрать иконку занятия" onPress={() => { Keyboard.dismiss(); setPicker(true); }}><Image source={image} contentFit="contain" style={{ width: 29, height: 31 }} /></PressScale><TextInput accessibilityLabel="Название занятия" value={title} onChangeText={setTitle} maxLength={80} returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()} style={{ flex: 1, height: 52, padding: 0, fontSize: 14, color: colors.black, outlineWidth: 0 }} /><Icon name="pencil" width={16} height={16} color={c.pencil} /></View>
    </View></KeyboardAvoidingView>
    {picker && <SessionIconPicker selected={iconId} onClose={() => setPicker(false)} onSelect={id => { setIconId(id); setImage(sessionIcon(id).image); setPicker(false); }} />}
  </>}</SheetModal>;
}
const styles = StyleSheet.create({
  row: { height: 56, borderRadius: 24, backgroundColor: colors.white, paddingLeft: 14, paddingRight: 20, flexDirection: 'row', alignItems: 'center', gap: 12 }, emoji: { width: 24, height: 26 },
  add: { position: 'absolute', left: 20, right: 20, height: 60, borderRadius: 32, backgroundColor: c.dark, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 },
  form: { height: 212, marginHorizontal: 8, marginBottom: 8, borderRadius: c.formRadius, backgroundColor: c.front }, handle: { position: 'absolute', top: 11, width: 63, height: 5, borderRadius: 3, alignSelf: 'center', backgroundColor: c.handle }, confirm: { position: 'absolute', right: 20, top: 43.333, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' }, field: { position: 'absolute', left: 20, right: 20, top: 117.333, height: 54, borderWidth: 1, borderColor: c.field, borderRadius: 28, paddingHorizontal: 18, flexDirection: 'row', gap: 12, alignItems: 'center' },
});
