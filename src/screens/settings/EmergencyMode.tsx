import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlainSettingsSheet } from '@/components/PlainSettingsSheet';
import { CopyCodeScreen, EmergencyRoundButton, PasscodeScreen } from '@/components/EmergencyInputs';
import { DarkButtonSurface } from '@/components/DarkButtonSurface';
import { FlowSwitch } from '@/components/SessionPrimitives';
import { SheetModal, SheetScrollView } from '@/components/SheetModal';
import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/motion';
import { emergencyChallenge } from '@/data/emergency';
import { rulesVariants, type RuleDetailChanges } from '@/data/rules';
import { useAppState } from '@/state/app';
import { colors, emergencyTheme as c, modalTheme } from '@/theme/tokens';
import { T } from '@/theme/typography';

type StrictRule = { id: string; title: string; strictSettings: RuleDetailChanges['strictSettings'] };
export function EmergencyMode({ onClose }: { onClose: () => void }) {
  const app = useAppState();
  const [child, setChild] = useState<'settings' | 'passcode' | 'random' | 'rules' | null>(null);
  const [challenge, setChallenge] = useState('');
  const continueToRules = () => { if (app.emergencySettings.method === 'passcode') setChild('passcode'); else { setChallenge(emergencyChallenge(app.emergencySettings.length, app.interfaceSettings.special)); setChild('random'); } };
  return <PlainSettingsSheet title="" onClose={onClose} surface={c.surface}>
    <PressScale accessibilityRole="button" accessibilityLabel="Настройки экстренного режима" onPress={() => setChild('settings')} style={styles.settingsButton}><Icon name="emergency-settings" width={24} height={24} color={c.ink} /></PressScale>
    <View style={styles.intro}><Image source={require('../../../assets/art/emergency-shirt.png')} contentFit="contain" style={{ width: 110, height: 170 }} /><T size={24} ls={0} center style={{ marginTop: 7, lineHeight: 29 }}>Экстренный режим</T><T size={15} weight={400} ls={0} center style={{ marginTop: 8, lineHeight: 18 }}>Экстренный случай? Ошибка? Бывает. Отключите строгий режим, если это действительно нужно.</T></View>
    <BottomButton label="Продолжить в экстренный режим" onPress={continueToRules}>Продолжить</BottomButton>
    {child === 'settings' && <EmergencySettings onClose={() => setChild(null)} />}
    {child === 'passcode' && <PasscodeScreen title={'Код-пароль для разблокировки\nэкстренного режима'} confirm={app.emergencySettings.passcode ?? undefined} onCancel={() => setChild(null)} onComplete={() => setChild('rules')} />}
    {child === 'random' && <CopyCodeScreen code={challenge} changing={false} onCancel={() => setChild(null)} onComplete={() => setChild('rules')} />}
    {child === 'rules' && <EmergencyRules onClose={() => setChild(null)} />}
  </PlainSettingsSheet>;
}
function BottomButton({ label, children, onPress, disabled = false }: { label: string; children: string; onPress: () => void; disabled?: boolean }) {
  const insets = useSafeAreaInsets();
  return <PressScale accessibilityRole="button" accessibilityLabel={label} disabled={disabled} accessibilityState={{ disabled }} onPress={onPress} style={[styles.bottomButton, { bottom: Math.max(39, insets.bottom + 5), backgroundColor: disabled ? c.disabled : c.ink }]}>{!disabled && <DarkButtonSurface />}<T size={17} ls={0} color={colors.white}>{children}</T></PressScale>;
}
function Toast({ text, compact = false }: { text: string; compact?: boolean }) { return <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.toast, compact && { minHeight: 50, backgroundColor: c.ruleToast }]}><Icon name="checkmark" width={15} height={15} color={colors.white} /><T size={15} weight={600} color={colors.white} ls={0} style={{ flex: 1, lineHeight: 19 }}>{text}</T></View>; }

function EmergencySettings({ onClose }: { onClose: () => void }) {
  const app = useAppState(), settings = app.emergencySettings;
  const [length, setLength] = useState(settings.length), [child, setChild] = useState<'challenge' | 'create' | 'confirm' | null>(null);
  const [code, setCode] = useState(''), [pin, setPin] = useState(''), [toast, setToast] = useState(false);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(false), 2800); return () => clearTimeout(timer); }, [toast]);
  const requestPasscode = () => { setCode(emergencyChallenge(settings.length, app.interfaceSettings.special)); setChild('challenge'); };
  return <PlainSettingsSheet title="" surface={c.surface} onClose={onClose}>{close => <>
    <T size={20} center ls={0} style={{ position: 'absolute', top: 51, left: 70, right: 70, lineHeight: 24 }}>Настройки</T>
    <View style={styles.back}><EmergencyRoundButton label="Назад из настроек экстренного режима" back onPress={() => close()} /></View>
    <View style={styles.segment}>{(['random', 'passcode'] as const).map(method => <PressScale key={method} accessibilityRole="radio" accessibilityLabel={method === 'random' ? 'Экстренный режим: случайный код' : 'Экстренный режим: код-пароль'} accessibilityState={{ checked: settings.method === method }} onPress={() => { if (settings.method === method) return; if (method === 'passcode') requestPasscode(); else { setCode(emergencyChallenge(settings.length, app.interfaceSettings.special)); setChild('challenge'); } }} style={[styles.segmentItem, settings.method === method && { backgroundColor: colors.white, boxShadow: c.keyShadow }]}><T size={15} weight={settings.method === method ? 700 : 400} ls={0}>{method === 'random' ? 'Случайный код' : 'Код-пароль'}</T></PressScale>)}</View>
    <View style={styles.setting}>{settings.method === 'random' ? <><T size={16} weight={400} ls={0}>Длина кода</T><View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 16 }}><T size={16} color={c.muted} ls={0}>{length}</T><PressScale accessibilityRole="button" accessibilityLabel="Увеличить длину случайного кода" disabled={length >= 200} onPress={() => setLength(x => Math.min(200, x + 10))} style={styles.increment}><Icon name="plus" width={16} height={16} color={c.ink} /></PressScale></View></> : <PressScale accessibilityRole="button" accessibilityLabel="Изменить код-пароль" onPress={requestPasscode} style={{ flex: 1, height: 62, flexDirection: 'row', alignItems: 'center' }}><T size={16} weight={400} ls={0}>Код-пароль</T><T size={18} color={c.muted} ls={0} style={{ marginLeft: 'auto', marginRight: 16 }}>••••</T><Icon name="chevron-right" width={6} height={9} color={c.muted} /></PressScale>}</View>
    <T size={14} weight={400} ls={0} color={c.muted} style={styles.detail}>{settings.method === 'random' ? `Вам нужно будет ввести ${length}-значный случайный текст, чтобы получить доступ к экстренному режиму.` : 'Введите пароль, чтобы получить доступ к экстренному режиму.'}</T>
    <BottomButton label="Сохранить настройки экстренного режима" disabled={length === settings.length} onPress={() => close(() => app.saveEmergencySettings({ ...settings, length }))}>Сохранить</BottomButton>
    {toast && <Toast text="Экстренный режим теперь открывается по коду-паролю." />}
    {child === 'challenge' && <CopyCodeScreen code={code} onCancel={() => setChild(null)} onComplete={() => { if (settings.method === 'passcode') { app.saveEmergencySettings({ method: 'random', length, passcode: null }); setChild(null); } else setChild('create'); }} />}
    {child === 'create' && <PasscodeScreen title="Создайте код-пароль" subtitle="Надёжный человек сможет задать код за вас." onCancel={() => setChild(null)} onComplete={value => { setPin(value); setChild('confirm'); }} />}
    {child === 'confirm' && <PasscodeScreen title="Подтвердите код-пароль" subtitle="Надёжный человек сможет задать код за вас." confirm={pin} onBack={() => setChild('create')} onCancel={() => setChild(null)} onComplete={() => { app.saveEmergencySettings({ method: 'passcode', length, passcode: pin }); setChild(null); setToast(true); }} />}
  </>}</PlainSettingsSheet>;
}
function EmergencyRules({ onClose }: { onClose: () => void }) {
  const app = useAppState(); const base = rulesVariants[app.rulesVariant];
  const [selected, setSelected] = useState<StrictRule | null>(null), [toast, setToast] = useState('');
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 2800); return () => clearTimeout(timer); }, [toast]);
  const candidates = [...base.locks, ...app.createdLocks].map(x => ({ id: x.id, title: x.name, strict: x.strict, strictSettings: x.strictSettings })).concat([...base.sessions, ...app.createdSessions].map(x => ({ id: x.id, title: x.title, strict: x.strict, strictSettings: x.strictSettings })), [...base.limits, ...app.createdLimits, ...base.routines, ...app.createdRoutines].map(x => ({ id: x.id, title: x.title, strict: x.configuration?.strict, strictSettings: x.configuration })));
  const strict = candidates.filter(x => !app.deletedRuleIds.includes(x.id) && (app.ruleChanges[x.id]?.strict ?? x.strict));
  return <PlainSettingsSheet title="" surface={c.surface} onClose={onClose}>{close => <>
    <View style={styles.ruleHeader}><EmergencyRoundButton label="Назад из строгих правил" back onPress={() => close()} /><T size={18} ls={0}>{selected || toast ? 'Правила строгого режима' : 'Правила со строгим режимом'}</T></View>
    <View style={styles.info}><T size={14} weight={400} color={c.infoInk} ls={0} style={{ lineHeight: 18 }}>{selected || toast ? 'Для этих правил можно отключить строгий режим или удалить их.' : 'Вы можете отключить строгий режим для этого правила или удалить его.'}</T></View>
    <SheetScrollView accessibilityLabel="Строгие правила" style={{ marginTop: 211 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 12 }}>{strict.map(x => <View key={x.id} style={styles.rule}><T size={16} ls={0}>🔒</T><T size={16} weight={400} ls={0} style={{ flex: 1 }}>{app.ruleChanges[x.id]?.title ?? x.title}</T><FlowSwitch label={`Строгий режим: ${x.title}`} value={app.ruleChanges[x.id]?.strict ?? x.strict ?? false} disabled={!(app.ruleChanges[x.id]?.strict ?? x.strict)} onChange={() => setSelected({ ...x, title: app.ruleChanges[x.id]?.title ?? x.title, strictSettings: app.ruleChanges[x.id]?.strictSettings ?? x.strictSettings ?? { strictScope: 'session', strictDays: 1 } })} /></View>)}</SheetScrollView>
    {!!toast && <Toast text={toast} compact />}
    {selected && <SheetModal animateClose onClose={() => setSelected(null)} backdrop={dismiss => <Pressable accessibilityLabel="Отменить действие со строгим правилом" onPress={() => dismiss()} style={[StyleSheet.absoluteFill, { backgroundColor: modalTheme.dim }]} />}>{dismiss => <View style={styles.actions}><T size={16} weight={400} ls={0} center style={{ lineHeight: 24, marginBottom: 12 }}>Что вы хотите сделать?</T>{[{ title: 'Отключить строгий режим', color: c.actionBlue, ink: c.actionBlueInk, run: () => { app.saveRuleDetails(selected.id, { title: selected.title, strict: false, strictSettings: selected.strictSettings }); setSelected(null); setToast(`Строгий режим ${selected.title} выключен`); } }, { title: 'Удалить правило', color: c.actionOrange, ink: c.actionOrangeInk, run: () => { app.deleteRule(selected.id); setSelected(null); setToast('Правило удалено'); } }, { title: 'Отмена', color: c.actionCancel, ink: c.ink, run: () => setSelected(null) }].map(action => <PressScale key={action.title} accessibilityRole="button" accessibilityLabel={action.title} onPress={() => dismiss(action.run)} style={[styles.action, { backgroundColor: action.color }]}><T size={16} color={action.ink} ls={0}>{action.title}</T></PressScale>)}</View>}</SheetModal>}
  </>}</PlainSettingsSheet>;
}
const styles = StyleSheet.create({
  settingsButton: { position: 'absolute', right: 20, top: 44, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  intro: { marginTop: 266, marginHorizontal: 20, alignItems: 'center' }, bottomButton: { position: 'absolute', left: 20, right: 20, height: 58, borderRadius: 30, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  back: { position: 'absolute', top: 44, left: 20 }, segment: { marginTop: 121, marginHorizontal: 20, height: 32, padding: 3, borderRadius: 18, backgroundColor: c.segment, flexDirection: 'row' }, segmentItem: { flex: 1, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  setting: { marginTop: 25, marginHorizontal: 20, height: 62, borderRadius: 17, paddingHorizontal: 16, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center' }, increment: { width: 32, height: 32, borderRadius: 16, backgroundColor: c.dot, justifyContent: 'center', alignItems: 'center' }, detail: { marginTop: 11, marginHorizontal: 20, lineHeight: 18 },
  ruleHeader: { position: 'absolute', left: 20, right: 20, top: 44, height: 44, flexDirection: 'row', alignItems: 'center', gap: 16 }, info: { position: 'absolute', top: 121, left: 0, right: 0, height: 66, backgroundColor: c.info, paddingVertical: 17, paddingHorizontal: 20 }, rule: { height: 60, borderRadius: 16, backgroundColor: colors.white, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 10 },
  actions: { position: 'absolute', left: 8, right: 8, bottom: 8, height: 281, padding: 20, borderRadius: 40, backgroundColor: c.actionSurface }, action: { height: 57, borderRadius: 32, marginBottom: 10, justifyContent: 'center', alignItems: 'center' },
  toast: { position: 'absolute', left: 16, right: 15, top: 12, minHeight: 69, borderRadius: 16, backgroundColor: c.toast, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8, boxShadow: c.successShadow },
});
