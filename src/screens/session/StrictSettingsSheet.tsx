import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { animateLayout, PressScale } from '@/components/motion';
import type { StrictSettings } from '@/data/session';
import { colors, strictTheme as c } from '@/theme/tokens';
import { T } from '@/theme/typography';

export const strictDaysLabel = (days: number) => `${days} ${days === 1 || days === 21 ? 'день' : days % 10 >= 2 && days % 10 <= 4 && (days < 12 || days > 14) ? 'дня' : 'дней'}`;
export function StrictSettingsSheet({ value, onCancel, onActivate }: { value: StrictSettings; onCancel: () => void; onActivate: (settings: StrictSettings) => void }) {
  const [draft, setDraft] = useState<StrictSettings>(() => ({ strictScope: value.strictScope, strictDays: value.strictDays }));
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const session = draft.strictScope === 'session';
  return <Modal transparent animationType="slide" onRequestClose={onCancel}>
    <View style={{ flex: 1 }}><Pressable accessibilityLabel="Отменить строгий режим" onPress={onCancel} style={[StyleSheet.absoluteFill, { backgroundColor: c.backdrop }]} />
      <View style={[styles.sheet, { top: Math.max(insets.top + 20, height - 579) }]} accessibilityViewIsModal>
        <View style={styles.handle} /><View style={styles.title}><Icon name="session-shield" width={22} height={24} /><T size={20} ls={0}>Строгий режим</T></View>
        <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 97 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}>
          <View style={[styles.card, { height: session ? 194 : draft.strictDays === 1 ? 315 : 292 }]}>
            <View style={styles.section}><Icon name="chevron-down-section" width={10} height={8} color={c.handle} style={{ transform: [{ rotate: '180deg' }] }} /><T size={20} ls={0}>Активность…</T></View>
            <View style={[styles.tabs, session && { left: -49 }]}>
              {(['days', 'session'] as const).map(scope => <PressScale key={scope} accessibilityRole="radio" accessibilityLabel={scope === 'days' ? 'Строгий режим на срок' : 'Строгий режим на время сессии'} accessibilityState={{ checked: draft.strictScope === scope }} onPress={() => { animateLayout(); setDraft(d => ({ ...d, strictScope: scope })); }} style={[styles.tab, { width: scope === 'days' ? session ? 123 : 143 : session ? 180 : 161 }, draft.strictScope === scope && styles.tabOn]}><T size={session ? 14 : 13.5} color={draft.strictScope === scope ? colors.white : c.secondary} ls={0}>{draft.strictScope === scope ? '✓ ' : ''}{scope === 'days' ? session ? 'На срок' : 'На заданный срок' : 'На время сессии'}</T></PressScale>)}
              {session && <View style={[styles.tab, { width: 80 }]} accessibilityState={{ disabled: true }}><T size={14} color={c.secondary} ls={0}>Всегда</T></View>}
            </View>
            <View style={styles.description}>{session ? <T size={18} center ls={0} style={{ lineHeight: 23 }}>Запретить изменения <T size={18} color={c.red} ls={0}>во время </T><T size={18} color={c.orange} ls={0}>сессии.</T></T> : <><T size={18} center ls={0} style={{ lineHeight: 23 }}>Запретить изменения</T>{draft.strictDays === 1 ? <><T size={18} center ls={0} color={c.red} style={{ lineHeight: 23 }}>на 24 часа после</T><T size={18} center ls={0} color={c.orange} style={{ lineHeight: 23 }}>начала правила.</T></> : <T size={18} center ls={0} color={c.red} style={{ lineHeight: 23 }}>на {strictDaysLabel(draft.strictDays)} после начала правила.</T>}</>}</View>
            {!session && <><View style={styles.days}><PressScale accessibilityRole="button" accessibilityLabel="Уменьшить срок строгого режима" disabled={draft.strictDays <= 1} accessibilityState={{ disabled: draft.strictDays <= 1 }} onPress={() => setDraft(d => ({ ...d, strictDays: d.strictDays - 1 }))} style={[styles.countButton, draft.strictDays <= 1 && { opacity: .4 }]}><T size={25} weight={500} ls={0}>−</T></PressScale><T size={36} ls={0}>{strictDaysLabel(draft.strictDays)}</T><PressScale accessibilityRole="button" accessibilityLabel="Увеличить срок строгого режима" disabled={draft.strictDays >= 30} accessibilityState={{ disabled: draft.strictDays >= 30 }} onPress={() => setDraft(d => ({ ...d, strictDays: d.strictDays + 1 }))} style={styles.countButton}><Icon name="plus" width={15} height={15} color={colors.black} /></PressScale></View><T size={11} weight={400} color={c.note} center ls={0} style={styles.note}>При необходимости срок можно продлить.</T></>}
          </View>
          <View style={styles.prevent}><Icon name="chevron-down-section" width={10} height={8} color={c.handle} /><T size={14} weight={600} color={c.secondary} ls={0}>Запретить…</T><T size={14} weight={400} ls={0} style={{ marginLeft: 'auto' }}>3</T></View>
        </ScrollView>
        <LinearGradient pointerEvents="none" colors={[c.surfaceFade, c.surface]} style={styles.fade} />
        <PressScale accessibilityRole="button" accessibilityLabel="Включить строгий режим" onPress={() => onActivate(draft)} style={[styles.activate, { bottom: Math.max(45, insets.bottom + 10) }]}><LinearGradient colors={c.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} /><Icon name="shield-check-white" width={17} height={19} color={colors.white} /><T size={16} color={colors.white} ls={0}>Включить строгий режим</T></PressScale>
      </View>
    </View>
  </Modal>;
}
export function StrictConfirmation({ onCancel, onContinue }: { onCancel: () => void; onContinue: () => void }) {
  const { height } = useWindowDimensions();
  return <Modal transparent animationType="fade" onRequestClose={onCancel}><View style={{ flex: 1 }}><Pressable accessibilityLabel="Закрыть подтверждение строгого режима" onPress={onCancel} style={[StyleSheet.absoluteFill, { backgroundColor: c.alertBackdrop }]} />
    <View style={[styles.alert, { top: height * .515 - 96 }]} accessibilityViewIsModal accessibilityRole="alert">
      <BlurView intensity={16} tint="light" style={StyleSheet.absoluteFill} /><LinearGradient colors={c.alertGradient} style={StyleSheet.absoluteFill} />
      <T size={17} weight={600} ls={0} variant="display" style={styles.alertTitle}>✋ Включить строгий режим?</T><T size={15} weight={400} color={c.alertCopy} ls={0} variant="display" style={styles.alertCopy}>Нельзя менять правило и удалять приложения с iPhone/iPad, пока включён строгий режим.</T>
      <View style={styles.alertActions}><PressScale accessibilityRole="button" onPress={onCancel} style={[styles.alertButton, { backgroundColor: c.alertCancel }]}><T size={17} weight={400} variant="display" ls={0}>Отмена</T></PressScale><PressScale accessibilityRole="button" onPress={onContinue} style={[styles.alertButton, { backgroundColor: c.alertPrimary }]}><T size={17} weight={500} variant="display" color={colors.white} ls={0}>Продолжить</T></PressScale></View>
    </View>
  </View></Modal>;
}
const styles = StyleSheet.create({
  sheet: { position: 'absolute', left: 8, right: 8, bottom: 8, borderRadius: c.radius, backgroundColor: c.surface, overflow: 'hidden' }, handle: { position: 'absolute', top: 11, width: 60, height: 5, alignSelf: 'center', backgroundColor: c.handle, borderRadius: 5 }, title: { position: 'absolute', top: 42, left: 0, right: 0, flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.white, borderRadius: c.cardRadius, overflow: 'hidden' }, section: { position: 'absolute', left: 16, top: 15, flexDirection: 'row', alignItems: 'center', gap: 8 }, tabs: { position: 'absolute', top: 52, left: 15, flexDirection: 'row', gap: 4 }, tab: { height: 40, borderRadius: c.tabRadius, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }, tabOn: { backgroundColor: c.blue, borderColor: c.blue }, description: { position: 'absolute', top: 119, left: 28, right: 28 },
  days: { position: 'absolute', left: 40, right: 40, bottom: 52, height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, countButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: c.countFill, alignItems: 'center', justifyContent: 'center' }, note: { position: 'absolute', bottom: 24, left: 0, right: 0 }, prevent: { marginTop: 12, height: 60, borderRadius: c.cardRadius, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8 },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 117 }, activate: { position: 'absolute', left: 20, right: 20, height: 57, borderRadius: 32, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  alert: { position: 'absolute', left: 37, right: 37, height: 192, borderRadius: c.radius, overflow: 'hidden', boxShadow: c.alertShadow }, alertTitle: { position: 'absolute', top: 21, left: 30, right: 20, lineHeight: 22 }, alertCopy: { position: 'absolute', top: 49, left: 30, right: 30, lineHeight: 20 }, alertActions: { position: 'absolute', left: 16, right: 16, bottom: 16, height: 48, flexDirection: 'row', gap: 8 }, alertButton: { flex: 1, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
});
