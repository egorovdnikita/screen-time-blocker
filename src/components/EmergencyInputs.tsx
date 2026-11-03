import { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { SheetModal, type SheetClose } from './SheetModal';
import { Icon } from './Icon';
import { PressScale } from './motion';
import { T, rounded } from '@/theme/typography';
import { colors, emergencyTheme as c } from '@/theme/tokens';

export function EmergencyRoundButton({ label, onPress, back = false }: { label: string; onPress: () => void; back?: boolean }) {
  return <PressScale accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.round}><Icon name={back ? 'lock-back' : 'reflection-close'} width={back ? 22 : 13} height={back ? 18 : 13} color={c.ink} style={back ? { transform: [{ rotate: '180deg' }] } : undefined} /></PressScale>;
}

type PasscodeProps = { title: string; subtitle?: string; onCancel: () => void; onBack?: () => void; onComplete: (pin: string) => void; confirm?: string };
export function PasscodeScreen(props: PasscodeProps) {
  return <SheetModal animateClose swipeEnabled={false} onClose={props.onCancel} backdrop={null}>{close => <PasscodeContent {...props} close={close} />}</SheetModal>;
}
function PasscodeContent({ title, subtitle, onBack, onComplete, confirm, close }: PasscodeProps & { close: SheetClose }) {
  const [pin, setPin] = useState(''), [error, setError] = useState(false);
  const { height } = useWindowDimensions(); const insets = useSafeAreaInsets();
  const complete = useRef(onComplete); useEffect(() => { complete.current = pin => close(() => onComplete(pin)); }, [onComplete, close]);
  useEffect(() => {
    if (pin.length !== 4) return;
    const timer = setTimeout(() => { if (confirm && pin !== confirm) { setError(true); setPin(''); } else complete.current(pin); }, 650);
    return () => clearTimeout(timer);
  }, [pin, confirm]);
  return <View style={styles.full} accessibilityViewIsModal><StatusBar style="dark" />
    <View style={[styles.close, { top: Math.max(79, insets.top + 20) }]}><EmergencyRoundButton label="Закрыть код-пароль" onPress={() => close()} /></View>
    {onBack && <View style={[styles.back, { top: Math.max(79, insets.top + 20) }]}><EmergencyRoundButton label="Назад к созданию код-пароля" back onPress={() => close(onBack)} /></View>}
    <View style={{ marginTop: 160, marginHorizontal: 20 }}><T size={20} ls={0} style={{ lineHeight: 24 }}>{title}</T>{subtitle && <T size={13} weight={400} ls={0} style={{ marginTop: 4, lineHeight: 17 }}>{subtitle}</T>}</View>
    <View accessibilityLabel={`Введено цифр: ${pin.length}`} style={[styles.dots, { top: Math.min(315, height * .37) }]}>{[0, 1, 2, 3].map(i => <View key={i} style={[styles.dot, i < pin.length && { backgroundColor: colors.black }]} />)}</View>
    {error && <T accessibilityRole="alert" size={13} color={c.actionOrangeInk} ls={0} center style={{ position: 'absolute', top: 355, left: 20, right: 20 }}>Код-пароли не совпадают. Попробуйте ещё раз.</T>}
    <View style={[styles.keys, { top: Math.min(450, height - 365) }]}>{['1','2','3','4','5','6','7','8','9','','0','delete'].map(key => key ? <PressScale key={key} accessibilityRole="button" accessibilityLabel={key === 'delete' ? 'Удалить цифру' : `Цифра ${key}`} onPress={() => { setError(false); setPin(previous => key === 'delete' ? previous.slice(0, -1) : (previous + key).slice(0, 4)); }} style={styles.key}>{key === 'delete' ? <Icon name="backspace" width={32} height={27} color={c.ink} /> : <T size={29} weight={600} ls={0}>{key}</T>}</PressScale> : <View key="spacer" style={{ width: 64, height: 64 }} />)}</View>
  </View>;
}

type CopyCodeProps = { code: string; changing?: boolean; onCancel: () => void; onComplete: () => void };
export function CopyCodeScreen(props: CopyCodeProps) {
  return <SheetModal animateClose swipeEnabled={false} onClose={props.onCancel} backdrop={null}>{close => <CopyCodeContent {...props} close={close} />}</SheetModal>;
}
function CopyCodeContent({ code, changing = true, onComplete, close }: CopyCodeProps & { close: SheetClose }) {
  const [text, setText] = useState(''), [focused, setFocused] = useState(false), [done, setDone] = useState(false);
  const complete = useRef(onComplete); useEffect(() => { complete.current = () => close(onComplete); }, [onComplete, close]);
  useEffect(() => { if (!done) return; const timer = setTimeout(() => complete.current(), 950); return () => clearTimeout(timer); }, [done]);
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.full} accessibilityViewIsModal><StatusBar style="dark" />
    <View style={styles.close}><EmergencyRoundButton label="Отменить перепечатывание кода" onPress={() => close()} /></View>
    {(!focused || done) && <View style={{ marginTop: 160, marginHorizontal: 20 }}><T size={20} ls={0} style={{ lineHeight: 24 }}>{changing ? 'Перепишите текст для смены кода' : 'Перепишите текст для экстренного режима'}</T><T size={13} weight={400} ls={0} style={{ marginTop: 6, lineHeight: 17 }}>{changing ? 'Вы или близкий человек сможете задать 4-значный код для экстренного режима.' : 'Отключите строгий режим, если это действительно нужно.'}</T></View>}
    {done ? <View accessibilityLabel="Код переписан верно" style={styles.success}><View style={styles.successCheck}><Icon name="checkmark" width={24} height={24} color={colors.white} /></View></View> : <View style={{ marginTop: focused ? 182 : 76, marginHorizontal: 20 }}><View style={[styles.code, { height: focused ? 150 : 200 }]}><LinearGradient colors={c.blue} style={StyleSheet.absoluteFill} /><T selectable accessibilityLabel="Случайный код" size={22} ls={0} center color={c.codeDim} style={{ lineHeight: 26 }}><T size={22} ls={0} color={colors.white}>{code.startsWith(text) ? text : ''}</T>{code.startsWith(text) ? code.slice(text.length) : code}</T></View><TextInput accessibilityLabel="Перепишите случайный код" multiline value={text} onChangeText={next => { setText(next); if (next === code) { setDone(true); setFocused(false); Keyboard.dismiss(); } }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder="Введите текст заново…" placeholderTextColor={c.inputText} autoCorrect={false} autoCapitalize="none" spellCheck={false} style={[styles.input, { marginTop: focused ? 8 : 3, height: focused ? 150 : 200, paddingVertical: text ? 20 : (focused ? 150 : 200) / 2 - 13 }]} />{text.length > 0 && !code.startsWith(text) && <T accessibilityRole="alert" size={12} color={c.actionOrangeInk} ls={0} center style={{ marginTop: 8 }}>Текст не совпадает с кодом</T>}</View>}
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({
  full: { flex: 1, backgroundColor: c.surface }, round: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, boxShadow: c.keyShadow, alignItems: 'center', justifyContent: 'center' }, close: { position: 'absolute', right: 20, top: 79, zIndex: 2 }, back: { position: 'absolute', left: 20, zIndex: 2 },
  dots: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', gap: 12 }, dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: c.dot },
  keys: { position: 'absolute', width: 233, alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 20.5 }, key: { width: 64, height: 64, borderRadius: 32, backgroundColor: c.key, boxShadow: c.keyShadow, justifyContent: 'center', alignItems: 'center' },
  code: { borderRadius: 44, overflow: 'hidden', justifyContent: 'center', paddingHorizontal: 16, borderWidth: 2, borderColor: c.border, boxShadow: c.codeShadow }, input: { borderWidth: 0, marginTop: 3, borderRadius: 44, backgroundColor: c.input, textAlign: 'center', paddingHorizontal: 16, paddingVertical: 20, fontFamily: rounded, fontSize: 22, fontWeight: '700', color: c.ink, ...(Platform.OS === 'web' ? { outlineStyle: 'solid' as const, outlineWidth: 0 } : {}) },
  success: { marginTop: 155, marginHorizontal: 20, height: 238, borderRadius: 44, backgroundColor: c.success, boxShadow: c.successShadow, justifyContent: 'center', alignItems: 'center' }, successCheck: { width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderColor: c.border, backgroundColor: c.successCheck, alignItems: 'center', justifyContent: 'center' },
});
