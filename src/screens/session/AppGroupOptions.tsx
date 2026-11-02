import { SheetModal } from '@/components/SheetModal';
import { useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/motion';
import { websiteHost, type AppGroupDraft } from '@/data/appGroup';
import { colors, appGroupTheme as c } from '@/theme/tokens';
import { T } from '@/theme/typography';
import { CheckMark } from './AppGroupCheck';

type Props = { group: AppGroupDraft; onChange: (update: Partial<AppGroupDraft>) => void; onClose: () => void };
const flags = [
  { key: 'adultContent', title: 'Контент для взрослых', subtitle: 'Во всех браузерах.' },
  { key: 'purchases', title: 'Покупки в App Store и iTunes' },
  { key: 'installation', title: 'Установка приложений' },
] as const;
export function AppGroupOptions({ group, onChange, onClose }: Props) {
  const [entry, setEntry] = useState('');
  const [error, setError] = useState('');
  const { height } = useWindowDimensions();
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const host = websiteHost(entry);
  const duplicate = !!host && group.websites.some(site => site.host === host && site.selected);
  const add = () => {
    if (!host) { if (entry.trim()) setError('Введите адрес сайта, например example.com'); return; }
    if (duplicate) { setError('Этот сайт уже добавлен'); return; }
    onChange({ websites: group.websites.some(site => site.host === host) ? group.websites.map(site => site.host === host ? { ...site, selected: true } : site) : [...group.websites, { host, selected: true }] });
    setEntry(''); setError(''); input.current?.blur();
  };
  return <SheetModal onClose={onClose} backdrop={<Pressable accessibilityLabel="Вернуться к группе приложений" onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: c.dim }]} />}>
    <View pointerEvents="box-none" style={{ flex: 1 }}>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} pointerEvents="box-none" style={{ flex: 1 }}>
        <View pointerEvents="none" style={{ height: Math.min(220, height * .3) }} />
        <View style={styles.sheet} accessibilityViewIsModal>
          <View style={styles.handle} /><T size={19} ls={0} center style={styles.title}>Другие параметры</T>
          <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: 527, paddingBottom: 32 }}>
            <SectionLabel title="Разное" />
            <View style={styles.options}>
              {flags.map((option, i) => <PressScale key={option.key} accessibilityRole="checkbox" accessibilityLabel={option.title} accessibilityState={{ checked: group[option.key] }} onPress={() => onChange({ [option.key]: !group[option.key] })} style={[styles.option, { height: i === 0 ? 64 : i === 1 ? 56 : 54 }, i < 2 && styles.divider]}>
                <CheckMark checked={group[option.key]} /><View><T size={14} weight={400} ls={0}>{option.title}</T>{'subtitle' in option && <T size={13} weight={400} color={c.secondary} ls={0} style={{ marginTop: 2 }}>{option.subtitle}</T>}</View>
              </PressScale>)}
            </View>
            <View style={{ marginTop: 28 }}><SectionLabel title="Сайты" /></View>
            <T size={11} weight={400} color={c.note} ls={-.1} style={styles.note}>Блокировать выбранные сайты во всех браузерах. ↗</T>
            <View style={styles.entryRow}>
              <View style={styles.entry}>
                <TextInput ref={input} accessibilityLabel="Адрес сайта" value={entry} onChangeText={value => { setEntry(value); setError(''); }} onFocus={() => { if (Platform.OS !== 'web') scroll.current?.scrollTo({ y: 200, animated: true }); }} onSubmitEditing={add} placeholder="facebook.com" placeholderTextColor={c.placeholder} autoCapitalize="none" autoCorrect={false} keyboardType="url" returnKeyType="done" maxLength={2048} style={styles.input} />
                <PressScale accessibilityRole="button" accessibilityLabel={entry ? 'Очистить адрес сайта' : 'Ввести адрес сайта'} onPress={() => { setEntry(''); setError(''); input.current?.focus(); }} style={styles.clear}>{entry ? <Icon name="session-clear" width={12} height={12} color={c.placeholder} /> : <T size={18} weight={400} color={c.placeholder} ls={0}>✎</T>}</PressScale>
              </View>
              <PressScale accessibilityRole="button" accessibilityLabel="Добавить сайт" accessibilityState={{ disabled: !host || duplicate }} disabled={!host || duplicate} onPress={add} style={[styles.add, (!host || duplicate) && { backgroundColor: c.addDisabled }]}><T size={26} weight={400} color={colors.white} ls={0}>＋</T></PressScale>
            </View>
            {!!error && <T accessibilityLiveRegion="polite" size={12} weight={400} color={c.error} ls={0} style={{ marginTop: 8, marginHorizontal: 19 }}>{error}</T>}
            <View style={{ marginTop: 18, marginHorizontal: 19, gap: 8 }}>
              {group.websites.map(site => <PressScale key={site.host} accessibilityRole="checkbox" accessibilityLabel={`Сайт ${site.host}`} accessibilityState={{ checked: site.selected }} onPress={() => onChange({ websites: group.websites.map(item => item.host === site.host ? { ...item, selected: !item.selected } : item) })} style={styles.saved}><CheckMark checked={site.selected} markSize={18} /><Icon name="group-website" width={22} height={20} color={colors.black} style={{ transform: [{ translateX: -1 }, { translateY: -2 }] }} /><T size={14} weight={400} ls={0} numberOfLines={1} style={{ flexShrink: 1 }}>{site.host}</T></PressScale>)}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  </SheetModal>;
}
function SectionLabel({ title }: { title: string }) { return <View style={styles.section}><Icon name="group-section" width={12} height={8} color={c.section} /><T size={19} color={c.section} ls={0}>{title}</T></View>; }
const styles = StyleSheet.create({
  sheet: { flex: 1, marginHorizontal: 8, marginBottom: 8, backgroundColor: c.optionsSurface, borderTopLeftRadius: c.optionsTopRadius, borderTopRightRadius: c.optionsTopRadius, borderBottomLeftRadius: c.optionsBottomRadius, borderBottomRightRadius: c.optionsBottomRadius, overflow: 'hidden' },
  handle: { position: 'absolute', top: 11, alignSelf: 'center', width: 60, height: 5, borderRadius: 4, backgroundColor: c.handle }, title: { marginTop: 43, height: 24, marginBottom: 30, lineHeight: 24 },
  section: { marginLeft: 18, height: 23, flexDirection: 'row', alignItems: 'center', gap: 7 },
  options: { marginTop: 10, marginHorizontal: 19, height: 174, backgroundColor: colors.white, borderRadius: c.extraRadius, overflow: 'hidden' }, option: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 15 }, divider: { borderBottomWidth: 1, borderColor: c.optionDivider },
  note: { marginTop: 16, height: 14, lineHeight: 14, marginLeft: 19, marginRight: 12 }, entryRow: { marginTop: 11, marginLeft: 19, marginRight: 18, height: 52, flexDirection: 'row', gap: 9, alignItems: 'center' },
  entry: { flex: 1, height: 52, borderWidth: 1, borderColor: c.inputBorder, borderRadius: c.inputRadius, flexDirection: 'row', alignItems: 'center', paddingLeft: 19, paddingRight: 14 }, input: { flex: 1, minWidth: 0, height: 50, padding: 0, fontSize: 14, fontWeight: '400', color: colors.black, outlineWidth: 0, outlineStyle: 'solid', outlineColor: c.focusOutline }, clear: { width: 20, height: 40, alignItems: 'center', justifyContent: 'center' },
  add: { position: 'relative', top: -2, width: 46, height: 46, borderRadius: 23, backgroundColor: c.blue, alignItems: 'center', justifyContent: 'center' }, saved: { height: 52, borderRadius: c.websiteRadius, backgroundColor: colors.white, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
});
