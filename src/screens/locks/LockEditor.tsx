import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SheetTransition } from '@/components/SheetModal';
import { StrictModeRow } from '@/components/StrictModeRow';
import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/motion';
import { art } from '@/data/art';
import { createLock, initialLock, lockApp, type LockDraft } from '@/data/lockRule';
import { durationLabel, unlockMethodLabel } from '@/data/session';
import { useAppState } from '@/state/app';
import { colors, sessionTheme, lockTheme as c } from '@/theme/tokens';
import { T } from '@/theme/typography';
import { UnlockDuration, unlockCountLabel } from '../session/SessionUnlocks';
import { UnlockMethodSheet } from '../session/UnlockMethodSheet';
import { StrictSettingsSheet, StrictConfirmation, strictDaysLabel } from '../session/StrictSettingsSheet';
import { SingleAppPicker } from './SingleAppPicker';

export function LockEditor() {
  const [draft, setDraft] = useState(initialLock);
  const [picker, setPicker] = useState<'app' | 'duration' | 'method' | 'strict' | 'confirm' | null>(null);
  const insets = useSafeAreaInsets();
  const app = useAppState();
  const selected = lockApp(draft.appId);
  const patch = (update: Partial<LockDraft>) => setDraft(d => ({ ...d, ...update }));
  const dismiss = () => router.canGoBack() ? router.back() : router.replace('/(tabs)');
  const add = () => { const rule = createLock(draft); if (!rule) return; app.addLock(rule); router.dismissAll(); router.navigate('/(tabs)/rules'); };
  return <SheetTransition backdrop={<Pressable accessibilityLabel="Закрыть лимит запусков" onPress={dismiss} style={[StyleSheet.absoluteFill, { backgroundColor: c.backdrop }]} />}>
    <View style={[styles.sheet, { marginTop: Math.max(59, insets.top + 1) }]}>
      <LinearGradient pointerEvents="none" colors={c.gradient} locations={[0, .45, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.handle} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 149, paddingBottom: 240 }}>
        <View style={styles.card}>
          <PressScale accessibilityRole="button" accessibilityLabel="Приложение для лимита запусков" onPress={() => setPicker('app')} style={styles.use}><T size={24} color={c.hint} ls={0}>Для</T>{selected ? <Image source={selected.image} style={{ width: 24, height: 24, borderRadius: 7 }} /> : <View style={styles.placeholder} />}<T size={24} ls={0}>{selected?.name ?? 'прил.'}</T><Icon name="lock-up-down" width={12} height={16} color={c.hint} /></PressScale>
          <View style={styles.count}><PressScale accessibilityRole="button" accessibilityLabel="Уменьшить лимит запусков" disabled={draft.count <= 1} accessibilityState={{ disabled: draft.count <= 1 }} onPress={() => patch({ count: draft.count - 1 })} style={[styles.counterButton, draft.count <= 1 && { opacity: .35 }]}><T size={25} weight={400} ls={0}>−</T></PressScale><T size={40} ls={0} style={{ lineHeight: 48 }} accessibilityLiveRegion="polite">{unlockCountLabel(draft.count)}</T><PressScale accessibilityRole="button" accessibilityLabel="Увеличить лимит запусков" disabled={draft.count >= 99} accessibilityState={{ disabled: draft.count >= 99 }} onPress={() => patch({ count: draft.count + 1 })} style={styles.counterButton}><Icon name="plus" width={16} height={16} color={c.ink} /></PressScale></View>
          <T size={24} color={c.max} center ls={0} style={styles.max}>макс. в день</T>
          <View style={styles.duration}><T size={14} weight={600} color={c.muted} ls={0}>На</T><PressScale accessibilityRole="button" accessibilityLabel="Длительность открытия по лимиту" onPress={() => setPicker('duration')} style={styles.inline}><T size={14} weight={600} ls={0}>{durationLabel(draft.minutes)}</T><Icon name="lock-up-down" width={12} height={16} color={c.hint} /></PressScale><T size={14} weight={600} color={c.muted} ls={0}>каждый раз</T></View>
          <View style={styles.method}><PressScale accessibilityRole="button" accessibilityLabel="Способ открытия по лимиту" onPress={() => setPicker('method')} style={styles.inline}><T size={14} weight={600} ls={0}>{unlockMethodLabel[draft.unlockMethod]}</T><Icon name="lock-up-down" width={12} height={16} color={c.hint} /></PressScale><T size={14} weight={600} color={c.muted} ls={0}>для входа</T></View>
          <View style={styles.sum}><T size={17} color={c.blue} ls={0}>= {durationLabel(draft.count * draft.minutes)}/день</T></View>
        </View>
        <View accessibilityState={{ disabled: true }} style={styles.extra}><T size={14} color={c.note} ls={0}>Дни и другие приложения</T><Icon name="chevron-right" width={9} height={13} color={c.note} /></View>
      </ScrollView>
      <Image pointerEvents="none" source={art.lockMascot} style={styles.mascot} />
      <View style={[styles.footer, { paddingBottom: Math.max(39, insets.bottom + 5) }]}>
        <StrictModeRow value={draft.strict} description={draft.strict ? draft.strictScope === 'session' ? 'Активен во время сессии' : `Активен ${strictDaysLabel(draft.strictDays)}` : 'Без изменения и удаления'} onOpen={() => setPicker('strict')} onChange={strict => strict ? setPicker('strict') : patch({ strict: false })} style={{ marginLeft: 5, marginRight: 2 }} />
        <PressScale accessibilityRole="button" accessibilityLabel="Добавить лимит запусков" disabled={!selected} accessibilityState={{ disabled: !selected }} onPress={() => draft.strict ? setPicker('confirm') : add()} style={[styles.add, { backgroundColor: selected ? c.dark : c.disabled, boxShadow: selected ? sessionTheme.buttonShadow : undefined, overflow: 'hidden' }]}>{selected && <LinearGradient pointerEvents="none" colors={c.buttonGradient} locations={[0, .65, 1]} start={{ x: .017, y: .37 }} end={{ x: .983, y: .63 }} style={StyleSheet.absoluteFill} />}<Icon name="plus" width={16} height={18} color={selected ? colors.white : c.disabledInk} /><T size={17} color={selected ? colors.white : c.disabledInk} ls={0}>Добавить</T></PressScale>
      </View>
    </View>
    {picker === 'app' && <SingleAppPicker value={draft.appId} onCancel={() => setPicker(null)} onConfirm={appId => { patch({ appId }); setPicker(null); }} />}
    {picker === 'duration' && <UnlockDuration value={draft.minutes} onCancel={() => setPicker(null)} onConfirm={minutes => { patch({ minutes }); setPicker(null); }} />}
    {picker === 'method' && <UnlockMethodSheet value={draft} onCancel={() => setPicker(null)} onSave={settings => { patch(settings); setPicker(null); }} />}
    {picker === 'strict' && <StrictSettingsSheet value={draft} onCancel={() => setPicker(null)} onActivate={settings => { patch({ ...settings, strict: true }); setPicker(null); }} />}
    {picker === 'confirm' && <StrictConfirmation onCancel={() => setPicker(null)} onContinue={add} />}
  </SheetTransition>;
}
const styles = StyleSheet.create({
  sheet: { flex: 1, borderRadius: c.radius, overflow: 'hidden', backgroundColor: c.surface }, handle: { position: 'absolute', top: 12, width: 64, height: 5, borderRadius: 5, alignSelf: 'center', backgroundColor: c.handle, zIndex: 1 },
  mascot: { position: 'absolute', top: 94, width: 60, height: 60, alignSelf: 'center' }, card: { marginHorizontal: 20, height: 368, borderRadius: c.radius, backgroundColor: colors.white },
  use: { position: 'absolute', top: 50, left: 10, right: 10, height: 29, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }, placeholder: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: c.confirmLine },
  count: { position: 'absolute', left: 42, right: 42, top: 92, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, counterButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, boxShadow: c.counterShadow, alignItems: 'center', justifyContent: 'center' },
  max: { position: 'absolute', top: 153, left: 0, right: 0, lineHeight: 29 }, inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  duration: { position: 'absolute', left: 10, right: 10, top: 212, height: 20, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' }, method: { position: 'absolute', left: 10, right: 10, top: 244, height: 20, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  sum: { position: 'absolute', top: 296, alignSelf: 'center', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20, backgroundColor: c.sumFill },
  extra: { marginTop: 23, height: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 }, footer: { paddingHorizontal: 20, backgroundColor: c.surface }, add: { height: 60, marginTop: 25, borderRadius: c.buttonRadius, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
