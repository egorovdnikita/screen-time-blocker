import { SheetGrabber, SheetModal } from '@/components/SheetModal';
import { useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { animateLayout, PressScale } from '@/components/motion';
import { WheelColumn, type WheelItem } from '@/components/WheelColumn';
import { UnlockMethodSheet } from './UnlockMethodSheet';
import { durationLabel, unlockMethodLabel, type UnlockSettings, type SessionDraft } from '@/data/session';
import { colors, sessionTheme as c, sessionPickerTheme as p, sessionUnlockTheme as u } from '@/theme/tokens';
import { T } from '@/theme/typography';

type UnlockDraft = UnlockSettings & Pick<SessionDraft, 'unlocks' | 'unlockMinutes'>;
type Props = { draft: UnlockDraft; patch: (update: Partial<UnlockDraft>) => void; waitLabel?: string; entryLabel?: string };
export const unlockCountLabel = (count: number) => `${count} ${count % 10 === 1 && count % 100 !== 11 ? 'раз' : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? 'раза' : 'раз'}`;

export function SessionUnlocks({ draft, patch, waitLabel, entryLabel = 'перед входом' }: Props) {
  const [lastCount, setLastCount] = useState(draft.unlocks || 2);
  const [durationOpen, setDurationOpen] = useState(false);
  const [methodOpen, setMethodOpen] = useState(false);
  const enabled = draft.unlocks > 0;
  const toggle = (on: boolean) => {
    animateLayout();
    if (!on && enabled) setLastCount(draft.unlocks);
    patch({ unlocks: on ? lastCount : 0 });
  };
  return <View style={{ height: enabled ? 320 : 59 }}>
    <View style={styles.choices}>{[true, false].map(on => <PressScale key={String(on)} accessibilityRole="radio" accessibilityLabel={`Разблокировки: ${on ? 'Да' : 'Нет'}`} accessibilityState={{ checked: enabled === on }} onPress={() => toggle(on)}
      style={[styles.choice, !enabled && { minWidth: 57 }, enabled === on && styles.choiceOn]}><T size={15} color={enabled === on ? colors.white : c.secondary} ls={0}>{enabled === on ? '✓ ' : ''}{on ? 'Да' : 'Нет'}</T></PressScale>)}</View>
    {enabled && <>
      <View style={styles.count}>
        <PressScale accessibilityRole="button" accessibilityLabel="Уменьшить число разблокировок" accessibilityState={{ disabled: draft.unlocks <= 1 }} disabled={draft.unlocks <= 1} onPress={() => patch({ unlocks: draft.unlocks - 1 })} style={[styles.countButton, draft.unlocks <= 1 && { opacity: .35 }]}><T size={25} weight={400} ls={0}>−</T></PressScale>
        <T size={u.countSize} ls={-.8} accessibilityLiveRegion="polite">{unlockCountLabel(draft.unlocks)}</T>
        <PressScale accessibilityRole="button" accessibilityLabel="Увеличить число разблокировок" accessibilityState={{ disabled: draft.unlocks >= 99 }} disabled={draft.unlocks >= 99} onPress={() => patch({ unlocks: draft.unlocks + 1 })} style={[styles.countButton, draft.unlocks >= 99 && { opacity: .35 }]}><Icon name="plus" width={17} height={17} color={c.ink} /></PressScale>
      </View>
      <View style={styles.settings}>
        <View style={styles.setting}><T size={15} weight={600} color={u.muted} ls={0}>На</T><PressScale accessibilityRole="button" accessibilityLabel="Длительность разблокировки" onPress={() => setDurationOpen(true)} style={styles.setting}><T size={15} weight={600} color={c.unlockInk} ls={0}>{durationLabel(draft.unlockMinutes)}</T><Icon name="session-up-down" width={12} height={16} color={u.muted} /></PressScale><T size={15} weight={600} color={u.muted} ls={0}>каждый раз</T></View>
        <View style={styles.setting}><PressScale accessibilityRole="button" accessibilityLabel="Способ перед входом" onPress={() => setMethodOpen(true)} style={styles.setting}><T size={15} weight={600} color={c.unlockInk} ls={0}>{draft.unlockMethod === 'wait' && waitLabel ? waitLabel : unlockMethodLabel[draft.unlockMethod]}</T><Icon name="session-up-down" width={12} height={16} color={u.muted} /></PressScale><T size={15} weight={600} color={u.muted} ls={0}>{entryLabel}</T></View>
        <View style={styles.setting}><T size={15} weight={600} color={c.unlockInk} ls={0}>Без задержки</T><Icon name="session-up-down" width={12} height={16} color={u.muted} /><T size={15} weight={600} color={u.muted} ls={0}>между входами</T></View>
      </View>
      <View style={styles.maximum}><T size={17} color={u.maxInk} ls={0}>= {durationLabel(draft.unlocks * draft.unlockMinutes)} макс.</T></View>
    </>}
    {methodOpen && <UnlockMethodSheet value={draft} onCancel={() => setMethodOpen(false)} onSave={settings => { patch(settings); setMethodOpen(false); }} />}
    {durationOpen && <UnlockDuration value={draft.unlockMinutes} onCancel={() => setDurationOpen(false)} onConfirm={unlockMinutes => { patch({ unlockMinutes }); setDurationOpen(false); }} />}
  </View>;
}
const minutes: WheelItem[] = Array.from({ length: 60 }, (_, value) => ({ value, label: String(value) }));
export function UnlockDuration({ value, onCancel, onConfirm, maxHours = 2 }: { value: number; onCancel: () => void; onConfirm: (minutes: number) => void; maxHours?: number }) {
  const [selected, setSelected] = useState(value);
  const hours: WheelItem[] = Array.from({ length: maxHours + 1 }, (_, value) => ({ value, label: String(value) }));
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const hour = Math.floor(selected / 60), minute = selected % 60;
  const setTime = (h: number, m: number) => setSelected(Math.max(1, Math.min(maxHours * 60, h * 60 + m)));
  return <SheetModal animateClose onClose={onCancel} backdrop={close => <Pressable accessibilityLabel="Отменить длительность разблокировки" onPress={() => close()} style={[StyleSheet.absoluteFill, { backgroundColor: u.durationBackdrop }]} />}>{close => <><View pointerEvents="box-none" style={StyleSheet.absoluteFill}>

    <View style={[styles.durationSheet, { top: Math.max(100, height - 462), bottom: 8 }]} accessibilityViewIsModal>
      <SheetGrabber style={styles.handle} /><T size={22} center ls={0} style={{ marginTop: 38 }}>Длительность</T>
      <View style={styles.wheel}>
        <View pointerEvents="none" style={styles.wheelHighlight} />
        <View style={{ position: 'absolute', left: maxHours === 24 ? 120 : 105 }}><WheelColumn label="Часы разблокировки" items={hours} value={hour} onChange={h => setTime(h, minute)} width={48} height={200} center={100} rowHeight={26} surface={u.durationSurface} fade={u.durationFade} /></View>
        <T size={17} weight={400} ls={0} style={{ position: 'absolute', left: maxHours === 24 ? 159 : 144, top: 87 }}>ч</T>
        <View style={{ position: 'absolute', left: 179 }}><WheelColumn label="Минуты разблокировки" items={hour === maxHours ? minutes.slice(0, 1) : hour === 0 ? minutes.slice(1) : minutes} value={minute} onChange={m => setTime(hour, m)} width={48} height={200} center={100} rowHeight={26} surface={u.durationSurface} fade={u.durationFade} /></View>
        <T size={17} weight={400} ls={0} style={{ position: 'absolute', left: 218, top: 87 }}>мин</T>
      </View>
      <T size={13} weight={400} color={u.durationHelp} center ls={0} style={{ position: 'absolute', bottom: 128, left: 12, right: 12 }}>От 1 минуты до {maxHours} часов.</T>
      <PressScale accessibilityRole="button" onPress={() => close(() => onConfirm(selected))} style={[styles.confirm, { bottom: Math.max(40, insets.bottom + 6) }]}><T size={17} color={colors.white} ls={0}>Подтвердить</T></PressScale>
    </View>
  </View></>}</SheetModal>;
}
const styles = StyleSheet.create({
  choices: { flexDirection: 'row', gap: 7, paddingHorizontal: 17 },
  choice: { height: 40, minWidth: 61, paddingHorizontal: 14, borderWidth: 1, borderColor: p.segmentBorder, borderRadius: u.choiceRadius, alignItems: 'center', justifyContent: 'center' },
  choiceOn: { backgroundColor: p.switchOn, borderColor: p.switchOn },
  count: { position: 'absolute', top: 70, left: 42, right: 42, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countButton: { width: u.countButton, height: u.countButton, borderRadius: u.countRadius, backgroundColor: colors.white, boxShadow: u.countShadow, alignItems: 'center', justifyContent: 'center' },
  settings: { position: 'absolute', top: 150, left: 0, right: 0, alignItems: 'center', gap: 12 }, setting: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  maximum: { position: 'absolute', alignSelf: 'center', bottom: 27, height: 27, paddingHorizontal: 13, borderRadius: u.choiceRadius, backgroundColor: u.maxBackground, justifyContent: 'center' },
  durationSheet: { position: 'absolute', left: 8, right: 8, borderRadius: u.durationRadius, backgroundColor: u.durationSurface, overflow: 'hidden' },
  handle: { position: 'absolute', top: 12, alignSelf: 'center', width: 61, height: 5, borderRadius: 4, backgroundColor: c.handle },
  wheel: { position: 'absolute', top: 94, width: 377, height: 200, alignSelf: 'center' },
  wheelHighlight: { position: 'absolute', top: 84, left: 44, right: 44, height: 32, borderRadius: 18, backgroundColor: u.durationHighlight },
  confirm: { position: 'absolute', left: 19, right: 19, height: 58, borderRadius: 30, backgroundColor: u.durationButton, alignItems: 'center', justifyContent: 'center' },
});
