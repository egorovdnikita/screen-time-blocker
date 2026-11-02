import { SheetScrollView as ScrollView, SheetGrabber, SheetModal } from '@/components/SheetModal';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/motion';
import { lockApps, lockApp, lockPickerImage, lockCategories, popularLockApps, suggestedLockApps, type LockAppId } from '@/data/lockRule';
import { colors, lockTheme as c } from '@/theme/tokens';
import { T } from '@/theme/typography';

export function SingleAppPicker({ value, onCancel, onConfirm }: { value: LockAppId | null; onCancel: () => void; onConfirm: (id: LockAppId) => void }) {
  const [selected, setSelected] = useState(value);
  const [confirmed, setConfirmed] = useState<LockAppId | null>(null);
  const [phase, setPhase] = useState<'select' | 'confirm'>('select');
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();
  const needle = query.trim().toLocaleLowerCase();
  const chosen = lockApp(selected);
  const matches = lockApps.filter(app => app.name.toLocaleLowerCase().includes(needle));
  const confirmApps = !needle ? popularLockApps.map(id => lockApp(id)!) : [...matches, ...suggestedLockApps.map(id => lockApp(id)!).filter(app => !matches.includes(app))];
  const isConfirm = phase === 'confirm';
  const bottom = Math.max(39, insets.bottom + 5);
  const continueStep = () => { if (!selected) return; setQuery(''); setConfirmed(null); setPhase('confirm'); };
  return <SheetModal nativeOffset={Math.max(69, insets.top + 10)} onClose={onCancel} backdrop={<Pressable accessibilityLabel="Отменить выбор одного приложения" onPress={onCancel} style={[StyleSheet.absoluteFill, { backgroundColor: c.backdrop }]} />}>
    <View pointerEvents="box-none" style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} pointerEvents="box-none" style={{ flex: 1 }}>
        <View pointerEvents="none" style={{ height: Math.max(69, insets.top + 10) }} />
        <View style={[styles.sheet, { backgroundColor: isConfirm ? c.surface : c.picker }]} accessibilityViewIsModal>
          <SheetGrabber style={styles.handle} />
          {isConfirm ? <>
            <PressScale accessibilityRole="button" accessibilityLabel="Назад к выбору приложения" onPress={() => { setPhase('select'); setQuery(''); setConfirmed(null); }} style={styles.back}><Icon name="lock-back" width={24} height={24} color={colors.black} style={{ transform: [{ rotate: '180deg' }] }} /></PressScale>
            <View style={styles.confirmTitle}><T size={19} ls={0}>Какое из них</T>{chosen && <Image source={lockPickerImage(chosen.id)} style={{ width: 24, height: 24, borderRadius: 7 }} />}<T size={19} ls={0}>?</T></View>
            <View style={styles.confirmSearch}><Icon name="session-search" width={19} height={19} color={c.placeholder} /><TextInput accessibilityLabel="Поиск для подтверждения приложения" value={query} onChangeText={text => { setQuery(text); setConfirmed(null); }} placeholder="Поиск приложения" placeholderTextColor={c.placeholder} autoCorrect={false} autoCapitalize="none" style={styles.input} />{!!query && <PressScale accessibilityLabel="Очистить поиск приложения" accessibilityRole="button" onPress={() => { setQuery(''); setConfirmed(null); }}><Icon name="session-clear" width={15} height={15} color={c.placeholder} /></PressScale>}</View>
            <T size={11} color={c.note} center ls={0} style={styles.note}>Для точного отображения подтвердите приложение,{'\n'}которое вы выбрали для блокировки.</T>
            {!needle && <T size={20} color={c.section} ls={0} style={styles.section}>Популярные приложения</T>}
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={[styles.confirmList, { top: needle ? 239 : 292, bottom: bottom + 75 }]}>
              {confirmApps.map(app => <PressScale key={app.id} accessibilityLabel={`Подтвердить ${app.name}`} accessibilityRole="radio" accessibilityState={{ checked: confirmed === app.id }} onPress={() => setConfirmed(app.id)} style={styles.confirmRow}><Image source={app.image} style={{ width: 24, height: 24, borderRadius: 6 }} /><T size={15} weight={400} ls={0}>{app.name}</T>{confirmed === app.id && <Icon name="period-check" width={18} height={20} color={c.blue} style={{ marginLeft: 'auto' }} />}</PressScale>)}
            </ScrollView>
            <LinearGradient pointerEvents="none" colors={[c.confirmFade, c.surface]} style={{ position: 'absolute', left: 20, right: 20, bottom: bottom + 75, height: 12 }} />
          </> : <>
            <T size={20} center ls={0} style={styles.title}>1 приложение</T>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={styles.categoryList} contentContainerStyle={{ paddingBottom: 70 }}>
              <AppCatalog query={query} selected={selected ? [selected] : []} onSelect={setSelected} />
            </ScrollView>
            <LinearGradient pointerEvents="none" colors={[c.pickerFade, c.pickerFadeMid, c.pickerFadeEnd, c.picker]} locations={[0, .4, .75, 1]} style={styles.fade} />
            <View style={[styles.search, { bottom: bottom + 91 }]}><Icon name="session-search" width={20} height={20} color={colors.black} /><TextInput accessibilityLabel="Поиск одного приложения" value={query} onChangeText={setQuery} autoCorrect={false} autoCapitalize="none" placeholder="Поиск" placeholderTextColor={c.note} style={[styles.input, { fontSize: 17 }]} /><Icon name="group-microphone" width={20} height={23} color={c.note} /></View>
          </>}
          <PressScale accessibilityRole="button" accessibilityLabel={isConfirm ? confirmed ? `Это ${lockApp(confirmed)!.name}` : 'Это…' : 'Продолжить выбор приложения'} disabled={isConfirm ? !confirmed : !selected} accessibilityState={{ disabled: isConfirm ? !confirmed : !selected }} onPress={() => isConfirm ? confirmed && onConfirm(confirmed) : continueStep()} style={[styles.cta, { bottom, backgroundColor: (isConfirm ? confirmed : selected) ? c.dark : c.disabled }]}><T size={17} color={(isConfirm ? confirmed : selected) ? colors.white : c.disabledInk} ls={0}>{isConfirm ? confirmed ? `Это ${lockApp(confirmed)!.name}` : 'Это…' : 'Продолжить'}</T></PressScale>
        </View>
      </KeyboardAvoidingView>
    </View>
  </SheetModal>;
}
export function AppCatalog({ query, selected, onSelect, multiple = false, categories = [], onCategory }: { query: string; selected: readonly LockAppId[]; onSelect: (id: LockAppId) => void; multiple?: boolean; categories?: string[]; onCategory?: (id: string) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const needle = query.trim().toLocaleLowerCase();
  const social = lockApps.slice(0, 4);
  const matches = lockApps.filter(app => app.name.toLocaleLowerCase().includes(needle));
  return <>{needle ? matches.map(app => <AppRow key={app.id} id={app.id} selected={selected.includes(app.id)} onPress={() => onSelect(app.id)} multiple={multiple} />) : lockCategories.map(([id, title, image]) => <View key={id}>
    <PressScale accessibilityRole="button" accessibilityLabel={`Категория ${title}`} accessibilityState={{ expanded: expanded === id }} onPress={() => setExpanded(v => v === id ? null : id)} style={styles.categoryRow}><View pointerEvents="none" style={styles.separator} />{onCategory ? <PressScale accessibilityRole="checkbox" accessibilityLabel={`Выбрать категорию ${title}`} accessibilityState={{ checked: categories.includes(id) }} onPress={event => { event.stopPropagation(); onCategory(id); }} style={[styles.radio, categories.includes(id) && styles.selected]}>{categories.includes(id) && <Icon name="period-check" width={18} height={20} color={colors.white} />}</PressScale> : <View style={styles.radio} />}<Image source={image} style={{ width: 30, height: 30 }} /><T size={17} weight={400} variant="display" ls={0} numberOfLines={1} style={{ flex: 1 }}>{title}</T>{id === 'social' && selected.length > 0 && <T size={17} weight={400} color={c.placeholder} ls={0}>{selected.filter(id => social.some(app => app.id === id)).length || ''}</T>}{id === 'social' && categories.includes(id) && <T size={17} weight={400} color={c.placeholder} ls={0}>Все</T>}{id !== 'all' && <Icon name="group-chevron" width={12} height={16} color={c.placeholder} style={{ transform: [{ rotate: expanded === id ? '90deg' : '0deg' }] }} />}</PressScale>
    {expanded === id && (id === 'social' || id === 'all' ? social.map(app => <AppRow key={app.id} id={app.id} selected={selected.includes(app.id)} onPress={() => onSelect(app.id)} child multiple={multiple} />) : <T size={14} weight={400} color={c.note} ls={0} style={{ padding: 16 }}>Нет приложений</T>)}
  </View>)}{needle && !matches.length && <T size={15} color={c.note} center style={{ padding: 20 }}>Ничего не найдено</T>}</>;
}
function AppRow({ id, selected, onPress, child, multiple }: { id: LockAppId; selected: boolean; onPress: () => void; child?: boolean; multiple?: boolean }) {
  const app = lockApp(id)!;
  return <PressScale accessibilityRole={multiple ? "checkbox" : "radio"} accessibilityLabel={`Выбрать ${app.name}`} accessibilityState={{ checked: selected }} onPress={onPress} style={[styles.categoryRow, child && { backgroundColor: c.rowChild }]}><View pointerEvents="none" style={styles.separator} /><View style={[styles.radio, selected && styles.selected]}>{selected && <Icon name="period-check" width={18} height={20} color={colors.white} />}</View><Image source={lockPickerImage(app.id)} style={{ width: 30, height: 30 }} /><T size={17} weight={400} variant="display" ls={0}>{app.name}{id === 'bereal' ? '.' : ''}</T></PressScale>;
}
const styles = StyleSheet.create({

  sheet: { flex: 1, borderRadius: c.panelRadius, overflow: 'hidden' }, handle: { position: 'absolute', top: 12, width: 64, height: 5, alignSelf: 'center', borderRadius: 5, backgroundColor: c.handle },
  title: { position: 'absolute', top: 44, left: 16, right: 16, lineHeight: 24 },
  categoryList: { position: 'absolute', top: 128, left: 16, right: 16, height: 560, backgroundColor: colors.white, borderRadius: c.categoryRadius },
  categoryRow: { height: 56.6, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 4 },
  separator: { position: 'absolute', left: 86, right: 8, bottom: 0, height: 1, backgroundColor: c.line },
  radio: { width: 24, height: 24, borderWidth: 2, borderColor: c.radio, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }, selected: { backgroundColor: c.radioOn, borderColor: c.radioOn },
  fade: { position: 'absolute', left: 0, right: 0, top: 568, height: 120 }, search: { position: 'absolute', left: 28, right: 28, height: 48, backgroundColor: c.searchFill, borderRadius: c.searchRadius, boxShadow: c.searchShadow, paddingHorizontal: 18, gap: 8, flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, height: '100%', padding: 0, color: c.ink, fontSize: 15, fontWeight: '400', outlineWidth: 0 },
  cta: { position: 'absolute', left: 20, right: 20, height: 60, borderRadius: c.buttonRadius, justifyContent: 'center', alignItems: 'center' },
  back: { position: 'absolute', left: 20, top: 45, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, boxShadow: c.backShadow, alignItems: 'center', justifyContent: 'center' },
  confirmTitle: { position: 'absolute', top: 55, left: 64, right: 64, flexDirection: 'row', gap: 3, justifyContent: 'center', alignItems: 'center' },
  confirmSearch: { position: 'absolute', top: 121, left: 20, right: 20, height: 54, borderWidth: 1, borderColor: c.searchBorder, borderRadius: c.searchRadius, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 12 },
  note: { position: 'absolute', top: 196, left: 24, right: 24, lineHeight: 14 }, section: { position: 'absolute', top: 249, left: 20, lineHeight: 26 },
  confirmList: { position: 'absolute', left: 20, right: 20, borderRadius: c.confirmRadius, backgroundColor: colors.white },
  confirmRow: { height: 57, paddingHorizontal: 16, gap: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: c.confirmLine },
});
