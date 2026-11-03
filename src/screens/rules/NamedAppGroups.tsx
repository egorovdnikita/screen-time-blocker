import { SheetScrollView as ScrollView, SheetModal, SheetGrabber } from '@/components/SheetModal';
import { useEffect, useRef, useState, type ReactNode, type ComponentRef } from 'react';
import { Image } from 'expo-image';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlainSettingsSheet } from '@/components/PlainSettingsSheet';
import { DarkButtonSurface } from '@/components/DarkButtonSurface';
import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/motion';
import { AppsCount } from '@/components/Rule';
import { cloneAppGroup, type AppGroupDraft } from '@/data/appGroup';
import { newNamedGroup, type NamedAppGroup } from '@/data/namedGroups';
import { art } from '@/data/art';
import { useAppState } from '@/state/app';
import { T } from '@/theme/typography';
import { colors, namedGroupTheme as c } from '@/theme/tokens';
type GroupEditorProps = { value: AppGroupDraft; name: string; onRename: () => void; onCancel: () => void; onConfirm: (group: AppGroupDraft) => void };
type Props = { onClose: () => void; onSelect?: (group: AppGroupDraft) => void; renderEditor: (props: GroupEditorProps) => ReactNode };

export function NamedAppGroups({ onClose, onSelect, renderEditor }: Props) {
  const app = useAppState();
  const [editing, setEditing] = useState<NamedAppGroup | null>(null);
  const [name, setName] = useState('Группа');
  const [rename, setRename] = useState(false);
  const [notice, setNotice] = useState(false);
  const insets = useSafeAreaInsets();
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(false), 3600); return () => clearTimeout(timer); }, [notice]);
  const edit = (item?: NamedAppGroup) => { setName(item?.title ?? 'Группа'); setEditing(item ?? newNamedGroup()); };
  return <PlainSettingsSheet title="Группы приложений" top={69} onClose={onClose}>{close => <>
    {!app.namedGroups.length ? <><View pointerEvents="none" style={{ position: 'absolute', left: '50%', marginLeft: -87.5, top: 297, width: 175, height: 112 }}><Image source={art.namedGroupGrass} contentFit="contain" style={StyleSheet.absoluteFill} /><View style={{ position: 'absolute', top: 4, left: 34 }}><Icon name="ogonek-resting" width={110} height={110} /></View></View><T size={20} center color={c.title} ls={0} style={{ position: 'absolute', top: 429, left: 20, right: 20, lineHeight: 25 }}>Пока пусто</T><T size={11.75} weight={500} center color={c.caption} ls={0} style={{ position: 'absolute', top: 457, left: 20, right: 20, lineHeight: 14 }}>{'Нажмите «Добавить», чтобы собрать приложения\nи сайты в список блокировки.'}</T></> : <ScrollView accessibilityLabel="Сохранённые группы" style={{ position: 'absolute', top: 101.333, left: 20, right: 20, bottom: 112 }} contentContainerStyle={{ gap: 8 }} showsVerticalScrollIndicator={false}>{app.namedGroups.map(item => <PressScale key={item.id} accessibilityRole="button" accessibilityLabel={`${onSelect ? 'Выбрать' : 'Изменить'} группу ${item.title}`} onPress={() => onSelect ? close(() => onSelect(cloneAppGroup(item.group))) : edit(item)} style={styles.row}><Image source={art.namedGroupForbidden} style={{ width: 22, height: 22 }} /><T size={14.25} ls={0} numberOfLines={1} style={{ flex: 1 }}>{item.title}</T><AppsCount count={item.group.categories.length + item.group.selectedApps.filter(Boolean).length} /><Icon name="activity-row-chevron" width={10} height={14} /></PressScale>)}</ScrollView>}
    <PressScale accessibilityRole="button" accessibilityLabel="Добавить сохранённую группу" onPress={() => edit()} style={[styles.add, { bottom: Math.max(37, insets.bottom + 3) }]}><DarkButtonSurface /><Icon name="plus" width={15} height={16} color={colors.white} /><T size={17} color={colors.white} ls={0}>Добавить</T></PressScale>
    {notice && <View accessibilityRole="alert" style={styles.notice}><Icon name="reflection-confirm" width={17} height={20} color={colors.white} /><T size={14} color={colors.white} ls={0} style={{ flex: 1, lineHeight: 18.333 }}>{'Группа добавлена! Теперь её можно\nиспользовать в правилах блокировки.'}</T></View>}
    {editing && renderEditor({ name, value: editing.group, onRename: () => setRename(true), onCancel: () => setEditing(null), onConfirm: group => { app.saveNamedGroup({ ...editing, title: name.trim(), group }); setNotice(!app.namedGroups.some(x => x.id === editing.id)); setEditing(null); } })}
    {rename && <RenameGroup value={name} taken={app.namedGroups.filter(x => x.id !== editing?.id).map(x => x.title)} onCancel={() => { Keyboard.dismiss(); setRename(false); }} onSave={title => { Keyboard.dismiss(); setName(title); setRename(false); }} />}
  </>}</PlainSettingsSheet>;
}
function RenameGroup({ value, taken, onCancel, onSave }: { value: string; taken: string[]; onCancel: () => void; onSave: (title: string) => void }) {
  const [title, setTitle] = useState(value);
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const valid = !!title.trim() && !taken.some(x => x.trim().toLocaleLowerCase() === title.trim().toLocaleLowerCase());
  return <SheetModal animateClose onClose={onCancel} onShown={() => requestAnimationFrame(() => input.current?.focus())} backdrop={close => <Pressable accessibilityLabel="Отменить имя группы" onPress={() => close()} style={[StyleSheet.absoluteFill, { top: 69, backgroundColor: c.dim }]} />}>{close => <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} pointerEvents="box-none" style={{ flex: 1 }}><View pointerEvents="none" style={{ height: 291.333 }} /><View accessibilityViewIsModal style={{ flex: 1, marginHorizontal: 8, borderRadius: c.formRadius, backgroundColor: c.surface }}><SheetGrabber style={{ position: 'absolute', top: 12, width: 63, height: 5, borderRadius: 3, alignSelf: 'center', backgroundColor: c.handle }} /><T size={19} center ls={0} style={{ position: 'absolute', top: 43.333, left: 20, right: 20, lineHeight: 25 }}>Переименовать группу</T><View style={styles.field}><Image source={art.namedGroupForbidden} style={{ width: 27, height: 27 }} /><TextInput ref={input} accessibilityLabel="Название сохранённой группы" value={title} onChangeText={setTitle} maxLength={60} returnKeyType="done" onSubmitEditing={() => { if (valid) close(() => onSave(title.trim())); }} style={{ flex: 1, height: 52, padding: 0, fontSize: 14, color: colors.black, outlineWidth: 0 }} /><Icon name="pencil" width={16} height={18} style={{ opacity: .22 }} /></View><PressScale accessibilityRole="button" accessibilityLabel="Сохранить имя группы" disabled={!valid} accessibilityState={{ disabled: !valid }} onPress={() => close(() => onSave(title.trim()))} style={[styles.save, !valid && { opacity: .4 }]}><DarkButtonSurface /><T size={16} color={colors.white} ls={0}>Сохранить</T></PressScale></View></KeyboardAvoidingView>}</SheetModal>;
}
const styles = StyleSheet.create({ row: { height: 60, borderRadius: 20, backgroundColor: colors.white, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }, add: { position: 'absolute', left: 20, right: 20, height: 60, borderRadius: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }, field: { position: 'absolute', top: 101.333, left: 20, right: 20, height: 54.667, borderWidth: 1, borderColor: c.field, borderRadius: 30, paddingHorizontal: 19, gap: 12, flexDirection: 'row', alignItems: 'center' }, save: { position: 'absolute', left: 20, right: 20, top: 191.333, height: 57, borderRadius: 32, alignItems: 'center', justifyContent: 'center' }, notice: { position: 'absolute', left: 16, right: 16, top: 3, height: 85.333, borderRadius: 25, backgroundColor: c.toast, boxShadow: c.toastShadow, flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 18 } });
