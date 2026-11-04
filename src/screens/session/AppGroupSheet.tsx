import { SheetScrollView as ScrollView, SheetGrabber, SheetModal } from '@/components/SheetModal';
import { NamedAppGroups } from '../rules/NamedAppGroups';
import { namedGroupSummary } from '@/data/namedGroups';
import { MaterialBlur } from '@/components/MaterialBlur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Fragment, useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GroupExtraGlyphs } from '@/components/AppGroupSummary';
import { Icon } from '@/components/Icon';
import { animateLayout, PressScale } from '@/components/motion';
import { cloneAppGroup, groupApps, groupCategories, groupSummary, hasGroupExtras, hasGroupSelection, countLabel, type AppGroupDraft, type AppCategoryId } from '@/data/appGroup';
import { art } from '@/data/art';
import { colors, modalTheme, appGroupTheme as c, lockTheme, routineTheme, namedGroupTheme } from '@/theme/tokens';
import { T, TextInk } from '@/theme/typography';
import { AppGroupCheck } from './AppGroupCheck';
import { AppGroupOptions } from './AppGroupOptions';

type Props = { purpose?: 'group' | 'routine' | 'named'; name?: string; onRename?: () => void; value: AppGroupDraft; onCancel: () => void; onConfirm: (group: AppGroupDraft) => void };
export function AppGroupSheet(props: Props) {
  return <TextInk.Provider value={c.rowInk}><AppGroupSheetBody {...props} /></TextInk.Provider>;
}

function AppGroupSheetBody({ value, onCancel, onConfirm, purpose = 'group', name, onRename }: Props) {
  const [draft, setDraft] = useState(() => cloneAppGroup(value));
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [expanded, setExpanded] = useState<AppCategoryId | null>(null);
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const groupTop = Math.max(69, insets.top + 10);
  const [sheetHeight, setSheetHeight] = useState(height - groupTop);
  const search = useRef<ComponentRef<typeof TextInput>>(null);
  const routine = purpose === 'routine';
  const named = purpose === 'named';
  const extra = hasGroupExtras(routine || named ? { ...draft, categories: [] } : draft);
  const summary = named ? namedGroupSummary(draft) : routine ? `Будет закрыто: ${draft.categories.length ? countLabel(draft.categories.length, 'категория', 'категории', 'категорий') : countLabel(draft.selectedApps.filter(Boolean).length, 'приложение', 'приложения', 'приложений')}` : groupSummary(draft);
  const compact = Platform.OS !== 'web' && searchFocused;
  const needle = query.trim().toLocaleLowerCase();
  const apps = groupApps.map((app, index) => ({ ...app, index })).filter(app => app.name.toLocaleLowerCase().includes(needle));
  const categories = groupCategories.filter(category => !needle || category.title.toLocaleLowerCase().includes(needle));
  const all = groupCategories.every(category => draft.categories.includes(category.id)) && draft.selectedApps.every(Boolean);
  const patch = (update: Partial<AppGroupDraft>) => setDraft(group => ({ ...group, ...update }));
  const toggleCategory = (id: AppCategoryId) => {
    const selected = draft.categories.includes(id);
    patch({ categories: selected ? draft.categories.filter(category => category !== id) : [...draft.categories, id], ...(!routine && !named && id === 'social' ? { selectedApps: groupApps.map(() => !selected) } : {}) });
  };
  const toggleApp = (index: number) => patch({ selectedApps: draft.selectedApps.map((selected, i) => i === index ? !selected : selected), categories: draft.categories.filter(category => category !== 'social') });
  const toggleAll = () => patch({ selectedApps: groupApps.map(() => !all), categories: all ? [] : groupCategories.map(category => category.id) });
  const searchTop = Math.min(extra ? 594 : 612, Math.max(140, sheetHeight - (compact ? 64 : 171)));
  return <SheetModal nativeOffset={groupTop} animateClose onClose={onCancel} backdrop={close => <Pressable accessibilityLabel="Отменить выбор группы" onPress={() => close()} style={[StyleSheet.absoluteFill, { backgroundColor: modalTheme.dim }]} />}>
    {close => <View pointerEvents="box-none" style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} pointerEvents="box-none" style={{ flex: 1 }}>
        <View pointerEvents="none" style={{ height: groupTop }} />
        <View style={[styles.sheet, (routine || named) && { borderRadius: 44 }]} onLayout={event => setSheetHeight(event.nativeEvent.layout.height)} accessibilityViewIsModal>
          <SheetGrabber style={[styles.handle, named && { width: 63, top: 12 }]} />
          <View style={[styles.header, compact && { marginTop: 20 }]}>
            <PressScale accessibilityRole="button" accessibilityLabel="Отменить группу приложений" onPress={() => close()} style={styles.close}><Icon name="session-clear" width={19} height={19} color={colors.black} /></PressScale>
            <PressScale accessibilityRole="button" accessibilityLabel={named ? "Переименовать группу" : "Выбрать сохранённую группу"} onPress={() => named ? onRename?.() : setCatalogOpen(true)} style={[styles.title, named && { paddingTop: 2 }]}>{named ? <Image source={art.namedGroupForbidden} style={{ width: 22, height: 22 }} /> : <Icon name={routine ? "lock-up-down" : "plus"} width={routine ? 12 : 17} height={routine ? 16 : 17} color={routine ? lockTheme.note : c.title} />}<T size={20} color={named ? colors.black : routine ? lockTheme.note : c.title} ls={0} numberOfLines={1} style={{ lineHeight: 28 }}>{named ? name : routine ? 'Связать группу' : 'Группа приложений'}</T>{named && <Icon name="pencil" width={16} height={18} style={{ opacity: .22 }} />}</PressScale>
            <PressScale accessibilityRole="button" accessibilityLabel="Сохранить группу приложений" disabled={(routine || named) && !hasGroupSelection(draft)} accessibilityState={{ disabled: (routine || named) && !hasGroupSelection(draft) }} onPress={() => close(() => onConfirm(cloneAppGroup(draft)))} style={[styles.confirm, routine && !hasGroupSelection(draft) && { opacity: .5 }, named && !hasGroupSelection(draft) && { backgroundColor: namedGroupTheme.disabled }]}><Icon name="group-check" width={named ? 21 : 26} height={named ? 23 : 26} color={colors.white} /></PressScale>
          </View>
          {!compact && <>
            <View style={styles.modes}>{(['only', 'except'] as const).map(mode => <PressScale key={mode} accessibilityRole="radio" accessibilityLabel={mode === 'only' ? 'Только эти' : 'Все, кроме'} accessibilityState={{ checked: draft.mode === mode }} onPress={() => { animateLayout(); patch({ mode }); }} style={[styles.mode, draft.mode === mode && styles.modeOn]}><T color={colors.black} size={14} ls={0}>{mode === 'only' ? named ? 'Только' : 'Только эти' : 'Все, кроме'}</T></PressScale>)}</View>
            <View style={[styles.summary, { height: extra ? 66 : named ? 49.333 : 49, paddingTop: extra ? 14 : 0, justifyContent: extra ? 'flex-start' : 'center' }]}><T size={named ? 13 : 14} weight={400} color={c.summaryInk} ls={0} style={extra ? { lineHeight: 17 } : named ? { lineHeight: 18 } : undefined}>{summary}</T></View>
          </>}
          <View style={[styles.listClip, { marginTop: compact ? 20 : extra ? 52 : 53, height: Math.max(140, Math.min(430, sheetHeight - (compact ? 150 : 353))) }]}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 80 }}>
              {!needle && <View style={styles.row}><View style={{ marginLeft: 6 }}><AppGroupCheck tint={routine ? routineTheme.radioOn : undefined} checked={all} label="Выбрать все приложения и категории" onPress={toggleAll} category /></View><Image source={art.groupAll} style={styles.categoryIcon} /><PressScale accessibilityRole="button" accessibilityLabel="Приложения и категории" onPress={toggleAll} style={styles.rowName}><T size={17} weight={400} variant="display" ls={0} numberOfLines={1} style={{ lineHeight: 21 }}>Приложения и категории</T></PressScale></View>}
              {categories.map(category => <Fragment key={category.id}>
                <View style={styles.row}><View style={styles.separator} /><View style={{ marginLeft: 6 }}><AppGroupCheck tint={routine ? routineTheme.radioOn : undefined} checked={draft.categories.includes(category.id)} label={`Категория ${category.title}`} onPress={() => toggleCategory(category.id)} category /></View><Image source={category.image} style={styles.categoryIcon} />
                  <PressScale accessibilityRole="button" accessibilityLabel={category.title} accessibilityState={{ expanded: expanded === category.id }} onPress={() => { animateLayout(); setExpanded(current => current === category.id ? null : category.id); }} style={styles.rowName}><T size={17} weight={400} variant="display" ls={0} numberOfLines={1} style={{ lineHeight: 21 }}>{category.title}</T></PressScale>
                  {(named || (routine && category.id === 'social')) && draft.categories.includes(category.id) && <T size={named ? 17 : 18} weight={400} variant={named ? "display" : "rounded"} color={c.count} ls={0}>Все</T>}{category.id === 'social' && draft.selectedApps.some(Boolean) && <T size={18} weight={400} color={c.count} ls={0}>{draft.selectedApps.filter(Boolean).length}</T>}
                  <Icon name="group-chevron" width={12} height={16} color={c.chevron} style={{ marginRight: 4, marginLeft: 6, transform: [{ rotate: expanded === category.id ? '90deg' : '0deg' }] }} />
                </View>
                {expanded === category.id && (category.id === 'social' ? groupApps.map((app, index) => <View key={app.id} style={styles.appRow}><AppGroupCheck tint={routine ? routineTheme.radioOn : undefined} checked={draft.selectedApps[index]} label={app.name} onPress={() => toggleApp(index)} /><Image source={app.image} style={styles.categoryIcon} /><T size={16} weight={400} ls={0}>{app.name}</T></View>) : <T size={14} weight={400} color={c.secondary} ls={0} style={{ padding: 16 }}>Нет приложений</T>)}
              </Fragment>)}
              {!!needle && apps.map(app => <View key={app.id} style={styles.row}><View style={{ marginLeft: 6 }}><AppGroupCheck tint={routine ? routineTheme.radioOn : undefined} checked={draft.selectedApps[app.index]} label={app.name} onPress={() => toggleApp(app.index)} /></View><Image source={app.image} style={styles.categoryIcon} /><T size={17} weight={400} variant="display" ls={0}>{app.name}</T></View>)}
              {!!needle && !apps.length && !categories.length && <T size={14} weight={400} color={c.secondary} center style={{ paddingVertical: 24 }}>Ничего не найдено</T>}
            </ScrollView>
            {!needle && <LinearGradient pointerEvents="none" colors={[c.surfaceFade, c.surface, c.surface]} locations={[0, .9, 1]} style={styles.listFade} />}
          </View>
          <View style={[styles.search, { top: searchTop }]}>
            <MaterialBlur blurPx={14} nativeIntensity={14} tint="light" style={StyleSheet.absoluteFill} /><View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: c.searchFill }]} />
            <Icon name="session-search" width={22} height={22} color={colors.black} />
            <TextInput ref={search} accessibilityLabel="Поиск приложений и категорий" value={query} onChangeText={setQuery} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} onSubmitEditing={() => search.current?.blur()} placeholder="Поиск" placeholderTextColor={c.secondary} autoCorrect={false} autoCapitalize="none" returnKeyType="done" style={styles.input} />
            {query ? <PressScale accessibilityRole="button" accessibilityLabel="Очистить поиск приложений" onPress={() => setQuery('')} style={{ width: 20, height: 40, justifyContent: 'center' }}><Icon name="session-clear" width={14} height={14} color={c.secondary} /></PressScale> : <Icon name="group-microphone" width={20} height={23} color={colors.black} />}
          </View>
          {!compact && <PressScale accessibilityRole="button" accessibilityLabel="Дополнительные параметры и сайты" onPress={() => setOptionsOpen(true)} style={[styles.extra, { height: extra ? 68 : 50, bottom: Math.max(extra ? 37 : 38, insets.bottom + 4) }]}>
            {extra ? <><T size={14} weight={400} variant="display" ls={0} style={{ width: 172, lineHeight: 18 }}>Другие параметры{'\n'}и сайты</T><GroupExtraGlyphs group={draft} /></> : <T size={14} weight={400} variant="display" ls={0}>{named ? 'Другие настройки и сайты' : 'Дополнительные параметры и сайты'}</T>}
            <Icon name="group-chevron" width={12} height={16} color={c.chevron} style={{ position: 'absolute', right: 16 }} />
          </PressScale>}
        </View>
      </KeyboardAvoidingView>
      {catalogOpen && <NamedAppGroups renderEditor={props => <AppGroupSheet {...props} purpose="named" />} onClose={() => setCatalogOpen(false)} onSelect={group => { setDraft(cloneAppGroup(group)); setCatalogOpen(false); }} />}
      {optionsOpen && <AppGroupOptions group={draft} onChange={patch} onClose={() => setOptionsOpen(false)} />}
    </View>
  }</SheetModal>;
}
const styles = StyleSheet.create({
  root: { flex: 1 }, sheet: { flex: 1, backgroundColor: c.surface, borderTopLeftRadius: c.sheetRadius, borderTopRightRadius: c.sheetRadius, borderBottomLeftRadius: c.sheetBottomRadius, borderBottomRightRadius: c.sheetBottomRadius, overflow: 'hidden' },
  handle: { position: 'absolute', top: 11, alignSelf: 'center', width: 60, height: 5, borderRadius: 4, backgroundColor: c.handle }, header: { marginTop: 45, height: 44, marginHorizontal: 20, flexDirection: 'row', alignItems: 'center' }, close: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white }, confirm: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: c.blue }, title: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 8, gap: 6 },
  modes: { marginTop: 28, height: 33, marginHorizontal: 20, borderRadius: c.segmentRadius, padding: 3, backgroundColor: c.segment, flexDirection: 'row' }, mode: { flex: 1, borderRadius: c.segmentInnerRadius, alignItems: 'center', justifyContent: 'center' }, modeOn: { backgroundColor: colors.white, boxShadow: c.segmentShadow },
  summary: { marginTop: 15, paddingLeft: 20, paddingRight: 18, backgroundColor: c.summary }, listClip: { marginHorizontal: 16, borderRadius: c.listRadius, backgroundColor: colors.white, overflow: 'hidden' }, listFade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },
  row: { height: 56.333, flexDirection: 'row', alignItems: 'center', gap: 8 }, separator: { position: 'absolute', left: 76, right: 0, top: 0, height: 1, backgroundColor: c.divider }, categoryIcon: { width: 30, height: 30 }, rowName: { flex: 1, height: 56.333, justifyContent: 'center' }, appRow: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 42 },
  search: { position: 'absolute', left: 28, right: 28, height: 48, borderRadius: c.searchRadius, boxShadow: c.searchShadow, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16 }, input: { position: 'relative', zIndex: 1, flex: 1, minWidth: 0, height: 46, padding: 0, fontSize: 16, fontWeight: '400', color: colors.black, outlineWidth: 0, outlineStyle: 'solid', outlineColor: c.focusOutline },
  extra: { position: 'absolute', left: 16, right: 16, borderRadius: c.extraRadius, backgroundColor: colors.white, boxShadow: c.extraShadow, paddingLeft: 16, paddingRight: 50, flexDirection: 'row', alignItems: 'center' },
});
