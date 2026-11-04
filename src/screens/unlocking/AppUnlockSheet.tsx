import { SheetScrollView as ScrollView, SheetGrabber, SheetModal } from '@/components/SheetModal';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkButtonSurface } from '@/components/DarkButtonSurface';
import { UnlockCard } from '@/components/UnlockCard';
import { PressScale } from '@/components/motion';
import { Icon } from '@/components/Icon';
import { art } from '@/data/art';
import { lockApp } from '@/data/lockRule';
import type { LockRule } from '@/data/rules';
import { matchesCopyText } from '@/data/session';
import { T, rounded, TextInk } from '@/theme/typography';
import { settingsTheme, colors, appUnlockTheme as c } from '@/theme/tokens';

export function AppUnlockSheet(props: Parameters<typeof AppUnlockSheetBody>[0]) {
  return <TextInk.Provider value={settingsTheme.title}><AppUnlockSheetBody {...props} /></TextInk.Provider>;
}

function AppUnlockSheetBody({ rule, onCancel, onConfirm }: { rule: LockRule; onCancel: () => void; onConfirm: (minutes: number, reason: string) => void }) {
  const method = rule.unlockSettings?.unlockMethod ?? 'wait';
  const waitSeconds = method === 'wait' ? rule.unlockSettings?.waitAutomatic === false ? rule.unlockSettings.waitSeconds : 3 : 0;
  const [remaining, setRemaining] = useState(waitSeconds);
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const maxMinutes = rule.minutes ?? 5;
  const [minutes, setMinutes] = useState(Math.min(5, maxMinutes));
  const sent = useRef(false);
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (!waitSeconds) return;
    const end = Date.now() + waitSeconds * 1000;
    const timer = setInterval(() => { const seconds = Math.max(0, Math.ceil((end - Date.now()) / 1000)); setRemaining(seconds); if (!seconds) clearInterval(timer); }, 200);
    return () => clearInterval(timer);
  }, [waitSeconds]);
  const target = rule.unlockSettings?.copyText ?? '';
  const ready = method === 'none' || method === 'wait' && remaining === 0 || (method === 'reason' || method === 'text') && submitted;
  const typeText = (value: string) => { setReason(value); if (matchesCopyText(value, target)) { Keyboard.dismiss(); setSubmitted(true); } };
  const choices = [...new Set([1, 2, 5, 10, 15, maxMinutes])].sort((a, b) => a - b);
  const confirm = () => { if (sent.current || !ready) return; sent.current = true; Keyboard.dismiss(); onConfirm(minutes, reason.trim()); };
  const cancel = () => { Keyboard.dismiss(); onCancel(); };
  return <SheetModal nativeOffset={Math.max(59, insets.top)} onClose={cancel} backdrop={<Pressable accessibilityLabel="Отменить открытие приложения" onPress={cancel} style={[StyleSheet.absoluteFill, { backgroundColor: c.backdrop }]} />}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, paddingTop: Math.max(59, insets.top) }} pointerEvents="box-none"><View accessibilityViewIsModal style={styles.sheet}><SheetGrabber style={styles.handle} />
      <View style={styles.badge}><Image source={lockApp(rule.app)?.image ?? art.appAppleMusic} contentFit="contain" style={{ width: 18, height: 18 }} /><Icon name="app-unlock-lock" width={15} height={18} /><T size={14.25} ls={0}>от «{rule.name}»</T></View>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ height: 610 }}>
        {!ready && <T size={14.25} center ls={0} style={{ position: 'absolute', top: 216, left: 20, right: 20, lineHeight: 18 }}>Точно хотите разблокировать?</T>}
        <T size={28} center ls={-.3} style={{ position: 'absolute', top: ready ? 201 : 235, left: 15, right: 15, lineHeight: 34 }}>{ready ? 'Выберите время доступа' : method === 'reason' ? 'Укажите причину' : method === 'text' ? 'Перепечатайте текст' : 'Сделайте паузу'}</T>
        <View style={{ position: 'absolute', left: '50%', marginLeft: -166.6665, top: ready ? 267 : 300 }}><UnlockCard ready={ready}>{ready ? method === 'reason' ? <T size={23} color={colors.white} center ls={0} numberOfLines={2} style={{ paddingHorizontal: 30, lineHeight: 30 }}>{reason.trim()}</T> : <View style={styles.success}><Icon name="reflection-confirm" width={30} height={32} color={colors.white} /></View> : method === 'reason' ? <TextInput accessibilityLabel="Причина открытия приложения" value={reason} onChangeText={setReason} placeholder="Введите намерение…" placeholderTextColor={c.placeholder} maxLength={500} returnKeyType="done" onSubmitEditing={() => { if (!reason.trim()) return; Keyboard.dismiss(); setSubmitted(true); }} style={styles.reason} /> : method === 'text' ? <View style={{ width: '100%', paddingHorizontal: 20, gap: 8 }}><T size={15} color={colors.white} center ls={0} numberOfLines={4} style={{ lineHeight: 19 }}>{target}</T><TextInput accessibilityLabel="Перепечатайте текст" value={reason} onChangeText={typeText} placeholder="Введите этот текст…" placeholderTextColor={c.placeholder} autoCorrect={false} autoCapitalize="none" contextMenuHidden multiline style={[styles.reason, { fontSize: 15, lineHeight: 19, height: 44 }]} /></View> : <T size={56} color={colors.white} center ls={0} style={{ lineHeight: 68 }}>{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</T>}</UnlockCard></View>
      </ScrollView>
      {ready && <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.choices} contentContainerStyle={{ paddingHorizontal: minutes === 2 ? 20 : 10, gap: 4.667 }}>{choices.map(value => { const selected = value === minutes, disabled = value > maxMinutes; return <PressScale key={value} accessibilityRole="radio" accessibilityLabel={`Время доступа ${value} мин`} aria-checked={selected} accessibilityState={{ checked: selected, disabled }} disabled={disabled} onPress={() => setMinutes(value)} style={[styles.choice, { width: selected ? 86 : value === 1 ? 66.667 : value === 2 ? 68 : value === 5 ? 68.667 : 75, backgroundColor: selected ? colors.black : c.action, opacity: disabled ? .35 : 1 }]}>{selected && <Icon name="reflection-confirm" width={14} height={15} color={colors.white} />}<T size={14.25} color={selected ? colors.white : c.choiceInk} ls={0}>{value}мин</T></PressScale>; })}</ScrollView>}
      <View style={[styles.actions, { bottom: Math.max(41.667, insets.bottom + 7) }]}><PressScale accessibilityRole="button" accessibilityLabel="Не открывать приложение" onPress={cancel} style={styles.action}><T size={17} ls={0}>Не сейчас</T></PressScale>{ready && <PressScale accessibilityRole="button" accessibilityLabel="Подтвердить открытие приложения" onPress={confirm} style={styles.action}><DarkButtonSurface /><T size={method === 'reason' ? 14.25 : 16} color={colors.white} ls={0}>{method === 'reason' ? `Открыть на ${minutes}мин` : 'Открыть'}</T></PressScale>}</View>
    </View></KeyboardAvoidingView>
  </SheetModal>;
}
const styles = StyleSheet.create({ sheet: { flex: 1, borderRadius: 44, backgroundColor: c.surface, overflow: 'hidden' }, handle: { position: 'absolute', top: 11, alignSelf: 'center', width: 63, height: 5, borderRadius: 3, backgroundColor: c.handle }, badge: { position: 'absolute', zIndex: 1, top: 38, alignSelf: 'center', height: 39, borderRadius: 24, paddingHorizontal: 14, backgroundColor: c.badge, boxShadow: c.badgeShadow, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, success: { width: 60, height: 60, borderRadius: 30, backgroundColor: c.success, boxShadow: c.successRim, alignItems: 'center', justifyContent: 'center' }, reason: { width: 293, height: 50, padding: 0, fontFamily: rounded, fontWeight: '700', fontSize: 23, lineHeight: 30, color: colors.white, textAlign: 'center', outlineWidth: 0 }, choices: { position: 'absolute', top: 624.667, left: 0, right: 0, height: 42 }, choice: { height: 42, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 }, actions: { position: 'absolute', left: 20, right: 20, height: 60, flexDirection: 'row', gap: 8 }, action: { flex: 1, height: 60, borderRadius: 32, backgroundColor: c.action, boxShadow: c.actionShadow, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' } });
