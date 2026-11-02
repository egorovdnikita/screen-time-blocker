import { Image } from 'expo-image';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { FlowSwitch } from '@/components/SessionPrimitives';
import { animateLayout, PressScale } from '@/components/motion';
import { art } from '@/data/art';
import type { UnlockMethod, UnlockSettings } from '@/data/session';
import { colors, sessionTheme as c, sessionPickerTheme as p, unlockMethodTheme as m } from '@/theme/tokens';
import { T } from '@/theme/typography';

type Props = { value: UnlockSettings; onCancel: () => void; onSave: (value: UnlockSettings) => void };
const options: { id: UnlockMethod; label: string; image: number }[] = [
  { id: 'none', label: 'Ничего не делать', image: art.unlockIconNothing },
  { id: 'wait', label: 'Немного подождать', image: art.unlockIconWait },
  { id: 'reason', label: 'Указать причину', image: art.unlockIconReason },
];
export function UnlockMethodSheet({ value, onCancel, onSave }: Props) {
  const [draft, setDraft] = useState<UnlockSettings>(() => ({ unlockMethod: value.unlockMethod, waitAutomatic: value.waitAutomatic, waitSeconds: value.waitSeconds }));
  const insets = useSafeAreaInsets();
  const patch = (update: Partial<UnlockSettings>) => { animateLayout(); setDraft(d => ({ ...d, ...update })); };
  const isReason = draft.unlockMethod === 'reason';
  return <Modal transparent animationType="slide" onRequestClose={onCancel}>
    <View style={{ flex: 1 }}>
      <Pressable accessibilityLabel="Отменить способ открытия" onPress={onCancel} style={[StyleSheet.absoluteFill, { backgroundColor: c.backdrop }]} />
      <View pointerEvents="none" style={[styles.backSheet, { top: Math.max(59, insets.top) }]} />
      <View style={[styles.panel, { marginTop: Math.max(69, insets.top + 10) }]} accessibilityViewIsModal>
        <View style={styles.heading}><View style={styles.handle} /><T size={20} ls={0} center style={{ marginTop: 44 }}>Перед открытием…</T></View>
        <ScrollView key={draft.unlockMethod} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 134 }}>
          {options.map(option => {
            const selected = draft.unlockMethod === option.id;
            const expanded = selected && option.id !== 'none';
            return <View key={option.id} style={{ marginBottom: isReason && option.id === 'none' ? 11 : isReason && option.id === 'wait' ? 14 : option.id === 'wait' && selected && !draft.waitAutomatic ? 27 : 12 }}>
              <View style={[styles.card, isReason && option.id === 'none' && { height: 51 }, expanded && { height: option.id === 'reason' ? 296 : draft.waitAutomatic ? 391 : 418 }]}>
                <PressScale accessibilityRole="radio" accessibilityLabel={option.label} accessibilityState={{ checked: selected }} onPress={() => patch({ unlockMethod: option.id })} style={styles.option}>
                  <Image source={option.image} style={{ width: 22, height: 22 }} /><T size={expanded ? 20 : 15} weight={expanded ? 700 : 400} ls={0} style={{ flex: 1 }}>{option.label}</T>
                  <View style={[styles.radio, selected && styles.radioOn]}>{selected && <Icon name="period-check" width={24} height={24} color={colors.white} />}</View>
                </PressScale>
                {expanded && <>
                  <View style={styles.illustration}><Image source={isReason ? art.unlockReasonDevice : art.unlockWaitDevice} contentFit="contain" style={{ width: 243, height: 220 }} /><T size={14} weight={600} ls={0} color={m.deviceLabel} center style={styles.deviceLabel}>Время подумать</T>{isReason && <T size={8.5} weight={500} ls={0} color={m.deviceIntent} center style={styles.intent}>Введите причину</T>}</View>
                  {option.id === 'wait' && <>
                    <View style={styles.settings}>
                      <View style={styles.setting}><T size={15} weight={400} ls={0}>Автоматически</T><FlowSwitch label="Автоматическая пауза" value={draft.waitAutomatic} onChange={waitAutomatic => patch({ waitAutomatic })} /></View>
                      {!draft.waitAutomatic && <View style={[styles.setting, styles.fixed]}><T size={15} weight={400} ls={0}>Задержка</T><T size={15} color={m.value} ls={0} style={{ marginLeft: 'auto' }}>{draft.waitSeconds < 60 ? `${draft.waitSeconds} с` : `${Math.floor(draft.waitSeconds / 60)} мин${draft.waitSeconds % 60 ? ' 30 с' : ''}`}</T><View style={styles.stepper}>
                        <PressScale accessibilityRole="button" accessibilityLabel="Уменьшить паузу" accessibilityState={{ disabled: draft.waitSeconds <= 30 }} disabled={draft.waitSeconds <= 30} onPress={() => patch({ waitSeconds: Math.max(30, draft.waitSeconds - 30) })} style={[styles.step, draft.waitSeconds <= 30 && { opacity: .35 }]}><T size={23} weight={400} ls={0}>−</T></PressScale><View style={styles.stepperLine} />
                        <PressScale accessibilityRole="button" accessibilityLabel="Увеличить паузу" accessibilityState={{ disabled: draft.waitSeconds >= 300 }} disabled={draft.waitSeconds >= 300} onPress={() => patch({ waitSeconds: Math.min(300, draft.waitSeconds + 30) })} style={[styles.step, draft.waitSeconds >= 300 && { opacity: .35 }]}><Icon name="plus" width={16} height={16} color={c.ink} /></PressScale>
                      </View></View>}
                    </View>
                    {draft.waitAutomatic && <T size={12} weight={400} color={m.note} ls={0} center style={styles.note}>Пауза растёт с каждым открытием приложения.</T>}
                  </>}
                </>}
              </View>
            </View>;
          })}
          {isReason && [{ title: 'Перепечатать текст', image: art.unlockIconText }, { title: 'Ввести случайный код', image: art.unlockIconCode }].map(option => <View key={option.title} style={[styles.card, { marginBottom: 12 }]} accessibilityState={{ disabled: true }}><View style={styles.option}><Image source={option.image} style={{ width: 22, height: 22 }} /><T size={15} weight={400} ls={0} style={{ flex: 1 }}>{option.title}</T><View style={styles.radio} /></View></View>)}
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: Math.max(39, insets.bottom + 5) }]}><PressScale accessibilityRole="button" onPress={() => onSave(draft)} style={styles.save}><T size={17} color={colors.white} ls={0}>Сохранить</T></PressScale></View>
      </View>
    </View>
  </Modal>;
}
const styles = StyleSheet.create({
  backSheet: { position: 'absolute', left: 16, right: 16, bottom: 14, backgroundColor: m.backSheet, borderRadius: m.panelRadius },
  panel: { flex: 1, borderTopLeftRadius: m.panelRadius, borderTopRightRadius: m.panelRadius, backgroundColor: m.surface, overflow: 'hidden' },
  heading: { height: 101 }, handle: { position: 'absolute', top: 12, width: 64, height: 5, alignSelf: 'center', borderRadius: 4, backgroundColor: m.handle },
  card: { height: 60, borderRadius: m.cardRadius, backgroundColor: colors.white, overflow: 'hidden' },
  option: { height: 60, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: m.radioBorder, alignItems: 'center', justifyContent: 'center' }, radioOn: { backgroundColor: p.switchOn, borderWidth: 0 },
  illustration: { position: 'absolute', top: 58, alignSelf: 'center', width: 243, height: 220 }, deviceLabel: { position: 'absolute', top: 31, left: 0, right: 0 }, intent: { position: 'absolute', top: 107, left: 40, right: 40, lineHeight: 12 },
  settings: { position: 'absolute', top: 293, left: 16, right: 16, borderRadius: m.gridRadius, backgroundColor: m.grid, overflow: 'hidden' }, setting: { height: 60, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 }, fixed: { height: 65, borderTopWidth: 1, borderColor: m.line },
  stepper: { width: 94, height: 32, flexDirection: 'row', backgroundColor: m.stepper, borderRadius: m.stepperRadius }, step: { width: 47, height: 32, alignItems: 'center', justifyContent: 'center' }, stepperLine: { position: 'absolute', left: 47, top: 4, bottom: 4, width: 1, backgroundColor: m.stepperLine },
  note: { position: 'absolute', top: 362, left: 16, right: 16, lineHeight: 16 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, backgroundColor: m.surface }, save: { height: 60, borderRadius: 32, backgroundColor: c.dark, boxShadow: c.buttonShadow, alignItems: 'center', justifyContent: 'center' },
});
