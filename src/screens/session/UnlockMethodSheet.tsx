import { SheetScrollView as ScrollView, SheetGrabber, SheetModal } from '@/components/SheetModal';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { FlowSwitch } from '@/components/SessionPrimitives';
import { animateLayout, PressScale } from '@/components/motion';
import { art } from '@/data/art';
import { copyTextIdeas, copyPreviewQuote, type UnlockSettings } from '@/data/session';
import { colors, sessionTheme as c, sessionPickerTheme as p, unlockMethodTheme as m } from '@/theme/tokens';
import { T } from '@/theme/typography';
import { unlockMethods } from '@/data/unlockMethods';
import { ScanMethodSettings } from './ScanMethodSettings';

type Props = { value: UnlockSettings; onCancel: () => void; onSave: (value: UnlockSettings) => void };
export function UnlockMethodSheet({ value, onCancel, onSave }: Props) {
  const [draft, setDraft] = useState<UnlockSettings>(() => ({ unlockMethod: value.unlockMethod, waitAutomatic: value.waitAutomatic, waitSeconds: value.waitSeconds, copyText: value.copyText, scanType: value.scanType }));
  const insets = useSafeAreaInsets();
  const [scrolled, setScrolled] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const patch = (update: Partial<UnlockSettings>) => { animateLayout(); setDraft(d => ({ ...d, ...update })); };
  const isReason = draft.unlockMethod === 'reason';
  const isText = draft.unlockMethod === 'text';
  const isScan = draft.unlockMethod === 'scan';
  const scanNfc = isScan && draft.scanType === 'nfc';
  const scrollY = isText ? 210 : isScan ? scanNfc ? 445 : 415 : 0;
  const valid = (!isText || !!draft.copyText.trim()) && !scanNfc;
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  useEffect(() => {
    // RN Web не применяет начальный contentOffset после смены выбранного метода.
    const timer = setTimeout(() => scroll.current?.scrollTo({ y: scrollY, animated: false }), 300);
    return () => clearTimeout(timer);
  }, [scrollY, draft.unlockMethod]);
  return <SheetModal animateClose nativeOffset={Math.max(69, insets.top + 10)} onClose={onCancel} backdrop={close => <Pressable accessibilityLabel="Отменить способ открытия" onPress={() => close()} style={[StyleSheet.absoluteFill, { backgroundColor: m.backdrop }]} />}>{close => <>
    <View pointerEvents="box-none" style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} pointerEvents="box-none" style={{ flex: 1 }}>
      <View style={[styles.panel, { marginTop: Math.max(69, insets.top + 10) }]} accessibilityViewIsModal>
        <View style={styles.heading}><SheetGrabber style={styles.handle} /><T size={20} ls={0} center style={{ marginTop: 44 }}>{isScan ? 'Перед каждой разблокировкой…' : 'Перед открытием…'}</T></View>
        <ScrollView onScroll={e => setScrolled(e.nativeEvent.contentOffset.y > 100)} scrollEventThrottle={32} ref={scroll} contentOffset={{ x: 0, y: scrollY }} keyboardShouldPersistTaps="handled" key={draft.unlockMethod + (isScan ? draft.scanType : '')} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 180 }}>
          {unlockMethods.map(option => {
            const selected = draft.unlockMethod === option.id;
            const expanded = selected && option.id !== 'none';
            return <View key={option.id} style={{ marginBottom: isScan && option.id === 'password' ? 8 : isReason && option.id === 'none' ? 11 : isReason && option.id === 'wait' ? 14 : option.id === 'wait' && selected && !draft.waitAutomatic ? 27 : 12 }}>
              <View style={[styles.card, isReason && option.id === 'none' && { height: 51 }, expanded && { height: option.id === 'scan' ? scanNfc ? 425 : 399 : option.id === 'text' ? 455 : option.id === 'reason' ? 296 : draft.waitAutomatic ? 391 : 418 }]}>
                <PressScale accessibilityRole="radio" accessibilityLabel={option.label} accessibilityState={{ checked: selected, disabled: !option.method }} disabled={!option.method} onPress={() => { if (option.method) patch({ unlockMethod: option.method }); }} style={styles.option}>
                  <Image source={option.image} style={{ width: 22, height: 22 }} /><T size={expanded ? isScan ? 21 : 20 : 15} weight={expanded ? 700 : 400} ls={0} style={{ flex: 1 }}>{option.label}</T>
                  <View style={[styles.radio, selected && styles.radioOn]}>{selected && <Icon name="period-check" width={24} height={24} color={colors.white} />}</View>
                </PressScale>
                {expanded && option.id === 'scan' && <ScanMethodSettings type={draft.scanType} onChange={scanType => patch({ scanType })} />}
                {expanded && option.id !== 'scan' && <>
                  <View style={styles.illustration}><Image source={isText ? art.unlockRecopyDevice : isReason ? art.unlockReasonDevice : art.unlockWaitDevice} contentFit="contain" style={{ width: 243, height: 220 }} />{!isText && <T size={14} weight={600} ls={0} color={m.deviceLabel} center style={styles.deviceLabel}>Время подумать</T>}{isText && <><T size={9.2} color={colors.white} ls={0} center style={styles.quote}>{copyPreviewQuote}</T><T size={9.2} weight={600} color={m.copyPlaceholder} ls={0} style={styles.devicePlaceholder}>Введите текст здесь</T></>}{isReason && <T size={8.5} weight={500} ls={0} color={m.deviceIntent} center style={styles.intent}>Введите причину</T>}</View>
                  {option.id === 'text' && <>
                    <TextInput accessibilityLabel="Текст для перепечатывания" onFocus={() => setEditingText(true)} onBlur={() => setEditingText(false)} multiline value={draft.copyText} onChangeText={copyText => setDraft(d => ({ ...d, copyText }))} maxLength={2000} placeholder="Введите текст" placeholderTextColor={m.copyPlaceholder} textAlignVertical="top" style={styles.copyBox} />
                    {!editingText && <LinearGradient pointerEvents="none" colors={[m.copyFade, colors.white]} locations={[0, .7]} style={styles.copyFade} />}
                    <PressScale accessibilityRole="button" accessibilityLabel="Идея текста" onPress={() => patch({ copyText: draft.copyText === copyTextIdeas[1] ? copyTextIdeas[0] : copyTextIdeas[1] })} style={styles.inspire}><Icon name="session-wand" width={20} height={20} color={m.copyAction} /><T size={15} color={m.copyAction} ls={0}>Идея текста</T></PressScale>
                  </>}
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

        </ScrollView>
        {scrolled && !isText && !isReason && !scanNfc && <View pointerEvents="none" style={{ position: 'absolute', top: 101, left: 0, right: 0, height: isScan ? 17 : 13, backgroundColor: m.surface }} />}
        <View style={[styles.footer, { paddingBottom: Math.max(39, insets.bottom + 5) }]}><PressScale accessibilityRole="button" disabled={!valid} accessibilityState={{ disabled: !valid }} onPress={() => close(() => onSave({ ...draft, copyText: draft.copyText.trim() }))} style={[styles.save, !valid && (scanNfc ? { backgroundColor: m.scanDisabled } : { opacity: .4 })]}><T size={17} color={scanNfc ? m.scanDisabledInk : colors.white} ls={0}>Сохранить</T></PressScale></View>
      </View>
      </KeyboardAvoidingView>
    </View>
  </>}</SheetModal>;
}
const styles = StyleSheet.create({

  panel: { flex: 1, borderTopLeftRadius: m.panelRadius, borderTopRightRadius: m.panelRadius, backgroundColor: m.surface, overflow: 'hidden' },
  heading: { height: 101 }, handle: { position: 'absolute', top: 12, width: 64, height: 5, alignSelf: 'center', borderRadius: 4, backgroundColor: m.handle },
  card: { height: 60, borderRadius: m.cardRadius, backgroundColor: colors.white, overflow: 'hidden' },
  option: { height: 60, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: m.radioBorder, alignItems: 'center', justifyContent: 'center' }, radioOn: { backgroundColor: p.switchOn, borderWidth: 0 },
  illustration: { position: 'absolute', top: 58, alignSelf: 'center', width: 243, height: 220 }, deviceLabel: { position: 'absolute', top: 31, left: 0, right: 0 }, intent: { position: 'absolute', top: 107, left: 40, right: 40, lineHeight: 12 },
  settings: { position: 'absolute', top: 293, left: 16, right: 16, borderRadius: m.gridRadius, backgroundColor: m.grid, overflow: 'hidden' }, setting: { height: 60, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 }, fixed: { height: 65, borderTopWidth: 1, borderColor: m.line },
  stepper: { width: 94, height: 32, flexDirection: 'row', backgroundColor: m.stepper, borderRadius: m.stepperRadius }, step: { width: 47, height: 32, alignItems: 'center', justifyContent: 'center' }, stepperLine: { position: 'absolute', left: 47, top: 4, bottom: 4, width: 1, backgroundColor: m.stepperLine },
  note: { position: 'absolute', top: 362, left: 16, right: 16, lineHeight: 16 },
  quote: { position: 'absolute', left: 44, right: 44, top: 19, lineHeight: 14.8 }, devicePlaceholder: { position: 'absolute', left: 40, top: 124, lineHeight: 12 },
  copyBox: { position: 'absolute', left: 16, right: 16, top: 291, height: 100, borderWidth: 1, borderColor: m.copyBorder, borderRadius: m.copyRadius, padding: 16, fontSize: 15, lineHeight: 18, fontWeight: '400', color: colors.black, outlineWidth: 0 },
  copyFade: { position: 'absolute', left: 17, right: 17, top: 337, height: 53, borderBottomLeftRadius: m.copyRadius, borderBottomRightRadius: m.copyRadius },
  inspire: { position: 'absolute', top: 411, left: 0, right: 0, height: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, backgroundColor: m.surface }, save: { height: 60, borderRadius: 32, backgroundColor: c.dark, boxShadow: c.buttonShadow, alignItems: 'center', justifyContent: 'center' },
});
