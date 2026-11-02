import { useAppState } from '@/state/app';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SheetModal } from '@/components/SheetModal';
import { FlowSwitch } from '@/components/SessionPrimitives';
import { FadeIn, PressScale } from '@/components/motion';
import { Icon } from '@/components/Icon';
import { art } from '@/data/art';
import type { AppRow } from '@/data/home';
import { newReflection, activityCatalog, reflectionMoods, type Reflection } from '@/data/reflection';
import { colors, reflectionTheme as c } from '@/theme/tokens';
import { T } from '@/theme/typography';
import { AppIcon } from './AppIcon';

export function ReflectionSheet({ app, value, onCancel, onSave, onExclude, onDelete }: { app: AppRow; value?: Reflection; onCancel: () => void; onSave: (value: Reflection) => void; onExclude: () => void; onDelete?: () => void }) {
  const appState = useAppState();
  const catalog = activityCatalog(appState.customActivities);
  let nextTop = 65;
  const activityItems = catalog.map(item => { if (item.id === 'care') nextTop += 60; const top = nextTop; nextTop += item.menu?.includes('\n') ? 62 : 42; return { ...item, top }; });
  const [draft, setDraft] = useState<Reflection>(() => ({ ...(value ?? newReflection()) }));
  const [menu, setMenu] = useState<'activity' | 'mood' | null>(null);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const top = Math.max(insets.top + 12, Math.min(172.667, height - insets.bottom - 437));
  const activity = catalog.find(a => a.id === draft.activity);
  const mood = reflectionMoods.find(m => m.id === draft.mood)!;
  const menuTop = Math.max(insets.top + 8, Math.min(top + (menu === 'activity' ? 77 : 196.666), height - insets.bottom - (menu === 'activity' ? 519.667 : 258.667)));
  return <SheetModal onClose={() => menu ? setMenu(null) : onCancel()} backdrop={<Pressable accessibilityLabel="Отменить оценку времени" onPress={onCancel} style={[StyleSheet.absoluteFill, { backgroundColor: c.backdrop }]} />}>
    <View accessibilityViewIsModal style={[styles.panel, { top }]}>
      <View style={styles.controls}><PressScale accessibilityRole="button" accessibilityLabel={onDelete ? "Удалить оценку времени" : "Закрыть оценку времени"} onPress={onDelete ?? onCancel} style={styles.round}><Icon name={onDelete ? "reflection-trash" : "reflection-close"} width={18} height={onDelete ? 22 : 18} /></PressScale><PressScale accessibilityRole="button" accessibilityLabel="Сохранить оценку времени" onPress={() => onSave({ ...draft })} style={[styles.round, { backgroundColor: c.blue, boxShadow: c.confirmRim }]}><Icon name="reflection-confirm" width={21} height={23} color={colors.white} /></PressScale></View>
      <View style={styles.copy}>
        <View style={styles.line}><T size={26} color={c.muted} ls={-.3}>Я был в</T><View style={styles.app}><View style={{ width: 20, height: 20, overflow: 'hidden' }}><AppIcon icon={app.icon} size={20} /></View><T size={22} color={colors.black} ls={-.3} numberOfLines={1}>{app.name}</T></View><T size={26} color={c.muted} ls={-.3}>и</T></View>
        <Selection label="Выбрать занятие оценки" title={activity?.title ?? 'Выбрать занятие'} image={activity ? activity.image : art.reflectionPhone} emoji={activity?.id === 'care' ? '🧘' : undefined} onPress={() => setMenu('activity')} />
        <View style={styles.line}><T size={26} color={c.muted} ls={-.3} numberOfLines={1} adjustsFontSizeToFit>{app.time} — и мне было</T></View>
        <Selection label="Выбрать оценку пользы" title={mood.title} image={mood.image} onPress={() => setMenu('mood')} />
      </View>
      <View style={styles.switchRow}><T size={14} weight={400} variant="display" ls={0}>Всегда для приложения</T><View style={{ marginLeft: 'auto' }}><FlowSwitch label="Всегда применять оценку" value={draft.always} onChange={always => setDraft(d => ({ ...d, always }))} /></View></View>
      <PressScale accessibilityRole="button" accessibilityLabel="Исключить приложение сегодня" onPress={onExclude} style={styles.exclude}><Icon name="reflection-exclude" width={17} height={20} color={c.blue} /><T size={17} color={c.blue} ls={0}>Исключить сегодня</T></PressScale>
    </View>
    {menu && <><Pressable accessibilityLabel="Закрыть меню оценки" style={StyleSheet.absoluteFill} onPress={() => setMenu(null)} /><FadeIn from={0} style={[styles.context, { top: menuTop, height: menu === 'activity' ? 519.667 : 258.667 }]}><BlurView pointerEvents="none" intensity={14} tint="default" style={StyleSheet.absoluteFill} /><LinearGradient pointerEvents="none" colors={[c.menuTop, c.menuBottom]} style={StyleSheet.absoluteFill} /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ height: menu === 'activity' ? Math.max(553, nextTop + 10) : 258.667 }}><T size={13.5} weight={400} variant="display" color={c.header} ls={0} style={styles.menuHeader}>{menu === 'activity' ? 'Изменить занятия: Главная →\n… → Занятия' : `Время в ${app.name} — это…`}</T>
      {menu === 'activity' ? activityItems.map(a => <PressScale key={a.id} accessibilityRole="button" accessibilityLabel={`Занятие ${a.title}`} onPress={() => { setDraft(d => ({ ...d, activity: a.id })); setMenu(null); }} style={[styles.menuRow, { top: a.top, alignItems: 'flex-start', minHeight: 42 }]}>{a.image ? <Image source={a.image} style={{ width: 22, height: 24 }} /> : <T size={20} ls={0}>🧘</T>}<T size={17} weight={400} variant="display" ls={0} style={{ paddingTop: 2, lineHeight: 20 }}>{'menu' in a ? a.menu : a.title}</T></PressScale>) : reflectionMoods.map((m, i) => <PressScale key={m.id} accessibilityRole="radio" accessibilityLabel={`Оценка ${m.title}`} aria-checked={draft.mood === m.id} accessibilityState={{ checked: draft.mood === m.id }} onPress={() => { setDraft(d => ({ ...d, mood: m.id })); setMenu(null); }} style={[styles.menuRow, { top: 40 + i * 42, height: 42 }]}>{draft.mood === m.id && <Icon name="checkmark" width={18} height={19} style={{ position: 'absolute', left: -34, top: 13 }} />}<Image source={m.menuImage} style={{ width: 24, height: 25 }} /><T size={17} weight={400} variant="display" ls={0}>{m.title}</T></PressScale>)}
    </ScrollView></FadeIn></>}
  </SheetModal>;
}
function Selection({ label, title, image, emoji, onPress }: { label: string; title: string; image: number | null; emoji?: string; onPress: () => void }) {
  return <PressScale accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={[styles.line, { gap: 4 }]}>{image ? <Image source={image} style={{ width: 22, height: 24 }} /> : <T size={22}>{emoji}</T>}<T size={26} color={colors.black} ls={-.3} numberOfLines={1} adjustsFontSizeToFit style={{ flexShrink: 1 }}>{title}</T><Icon name="settings-chevron-pair" width={12} height={17} color={c.pair} /></PressScale>;
}
const styles = StyleSheet.create({
  panel: { position: 'absolute', left: 20, right: 20, height: 425, borderRadius: c.radius, backgroundColor: c.panel, boxShadow: `inset 0 0 0 1px ${c.rim}` },
  controls: { position: 'absolute', top: 18.667, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }, round: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.close, boxShadow: c.roundShadow, alignItems: 'center', justifyContent: 'center' },
  copy: { position: 'absolute', top: 86, left: 10, right: 10 }, line: { height: 36.333, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }, app: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 34, paddingHorizontal: 7, backgroundColor: colors.white, borderRadius: 20, maxWidth: '55%' },
  switchRow: { position: 'absolute', top: 269.333, left: 20, right: 20, height: 60, borderRadius: 28, backgroundColor: colors.white, paddingHorizontal: 16, gap: 8, flexDirection: 'row', alignItems: 'center' }, exclude: { position: 'absolute', top: 342.667, left: 20, right: 20, height: 59, borderRadius: 32, backgroundColor: c.exclude, boxShadow: 'inset 0 0 0 1px white', gap: 4, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  context: { position: 'absolute', left: '50%', marginLeft: -124.8335, width: 249.667, borderRadius: c.radius, boxShadow: c.menuShadow, overflow: 'hidden' }, menuHeader: { position: 'absolute', left: 28, right: 10, top: 11, lineHeight: 18 }, menuRow: { position: 'absolute', left: 64, right: 10, flexDirection: 'row', alignItems: 'center', gap: 5 },
});
