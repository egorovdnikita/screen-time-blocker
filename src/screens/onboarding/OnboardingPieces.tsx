import type { ReactNode } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/motion';
import { DarkButtonSurface } from '@/components/DarkButtonSurface';
import { T } from '@/theme/typography';
import { onboardingTheme as c } from '@/theme/tokens';
import { onboardingArt as art } from '@/data/onboarding';

export function OnboardingButton({ children, onPress, disabled = false, style, label }: { children: string; onPress?: () => void; disabled?: boolean; style?: StyleProp<ViewStyle>; label?: string }) {
  const insets = useSafeAreaInsets();
  return <PressScale accessibilityRole="button" accessibilityLabel={label ?? children} disabled={disabled} accessibilityState={{ disabled }} onPress={onPress} style={[styles.button, { bottom: Math.max(39, insets.bottom + 5), backgroundColor: disabled ? c.disabled : c.ink }, style]}>{!disabled && <DarkButtonSurface />}<T size={17} color={c.white} ls={0} style={{ lineHeight: 22 }}>{children}</T></PressScale>;
}
export function OnboardingNav({ onBack, progress, locale = false, backLeft = 20, localeSize = 15 }: { onBack: () => void; progress?: number; locale?: boolean; backLeft?: number; localeSize?: number }) {
  const insets = useSafeAreaInsets(); const top = Math.max(70, insets.top + 11);
  return <><PressScale accessibilityRole="button" accessibilityLabel="Назад в знакомстве" onPress={onBack} style={[styles.nav, { left: backLeft, top }]}><Icon name="lock-back" width={22} height={18} color={c.ink} style={{ transform: [{ rotate: '180deg' }] }} /></PressScale>{locale && <View accessibilityLabel="Язык: русский" style={[styles.nav, { right: 20, top }]}><T size={localeSize} ls={0}>🇺🇸</T></View>}{progress != null && <View accessibilityLabel={`Настройка: ${Math.round(progress * 100)}%`} style={[styles.progress, { top: top + 20 }]}><View style={{ height: 6, borderRadius: 5, backgroundColor: c.blue, width: `${progress * 100}%` }} /></View>}</>;
}
export function OnboardingTitle({ children, top = 159, size = 27, line = 34, side = 20 }: { children: ReactNode; top?: number; size?: number; line?: number; side?: number }) {
  return <T size={size} center ls={-.2} style={{ marginTop: top, marginHorizontal: side, lineHeight: line }}>{children}</T>;
}
export function OnboardingHint({ instruction = false, style }: { instruction?: boolean; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ alignItems: 'center' }, style]}><View style={styles.hintIcon}><T size={15} ls={0} color={c.white}>×</T></View><T size={17} ls={0} center style={{ marginTop: instruction ? 11 : 14, lineHeight: 20 }}>Это не блокирует приложения</T><T size={instruction ? 13 : 12} weight={400} ls={0} color={c.note} center style={{ marginTop: instruction ? 5 : 0, lineHeight: 16 }}>{instruction ? 'Это только инструкция' : 'Это только ориентир.'}</T></View>;
}
export function OnboardingStory({ kind, onNext }: { kind: 'personalize' | 'honest' | 'years' | 'started'; onNext: () => void }) {
  if (kind === 'personalize') return <><Image source={art.personalize} contentFit="contain" style={{ width: 165, height: 165, alignSelf: 'center', marginTop: 260 }} /><T size={17} weight={600} ls={0} center style={{ marginTop: 28, lineHeight: 21, transform:[{translateX:20}] }}>Теперь ваша очередь</T><T size={27} ls={0} center style={{ marginTop: 8, lineHeight: 33, transform:[{translateX:20}] }}>{'Давайте настроим Block\nпод вас'}</T><OnboardingButton onPress={onNext}>Продолжить</OnboardingButton></>;
  if (kind === 'honest') return <><Image source={art.honest} contentFit="contain" style={{ width: 121, height: 142, alignSelf: 'center', marginTop: 263 }} /><T size={17} ls={0} center style={{ marginTop: 49, lineHeight: 21 }}>Давайте начистоту</T><T size={27} ls={0} center style={{ marginTop: 9, lineHeight: 35 }}>{'Есть хорошие…\nи не лучшие новости'}</T><OnboardingButton onPress={onNext}>Расскажу подробнее</OnboardingButton></>;
  if (kind === 'years') return <><Image source={art.years} contentFit="contain" style={{ width: 131, height: 148, alignSelf: 'center', marginTop: 193 }} /><T size={17} ls={0} center style={{ marginTop: 43, lineHeight: 21 }}>При таком темпе</T><T size={28} ls={0} center style={{ marginTop: 6, lineHeight: 34 }}>Вы проведёте</T><View style={{ alignSelf: 'center', marginTop: 18 }}><T size={51} color={c.purple[0]} ls={0} style={{ lineHeight: 68 }}>28 лет</T></View><T size={28} ls={0} center style={{ marginTop: 25, lineHeight: 34 }}>{'своей жизни\nв телефоне'}</T><OnboardingButton onPress={onNext}>Продолжить</OnboardingButton></>;
  return <><Image source={art.started} contentFit="contain" style={{ width: 193, height: 133, alignSelf: 'center', marginTop: 267 }} /><T size={27} ls={0} center style={{ marginTop: 46, lineHeight: 34 }}>{'Поэтому мы запустили\nBlock в 2022 году,\nчтобы помочь вам'}</T><OnboardingButton onPress={onNext}>Как это работает?</OnboardingButton></>;
}
export function Rating({ welcome = false }: { welcome?: boolean }) {
  return <View style={{ alignItems: 'center' }}><View style={{ flexDirection: 'row', gap: 1.2 }}>{[0,1,2,3,4].map(i => <Icon key={i} name="onboarding-rating-star" width={13} height={14} color={welcome ? c.dimBlue : c.gold} />)}</View>{!welcome && <><View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}><Icon name="onboarding-rating-laurel" width={17} height={33} color={c.gold} /><T size={32} color={c.gold} ls={-.4} style={{ lineHeight: 38 }}>7000+</T><Icon name="onboarding-rating-laurel" width={17} height={33} color={c.gold} style={{ transform: [{ scaleX: -1 }] }} /></View><T size={16} weight={400} color={c.gold} ls={0} style={{ lineHeight: 21 }}>Высших оценок</T></>}</View>;
}
export function OnboardingFriction({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return <><OnboardingNav onBack={onBack} locale localeSize={20} /><OnboardingTitle size={25} line={31}>{'Block усложняет доступ\nк отвлечениям…'}</OnboardingTitle><View style={{ position: 'absolute', top: 265, left: 0, right: 0, height: 465, overflow: 'hidden' }}><Image source={art.friction} contentFit="fill" style={StyleSheet.absoluteFill} /></View><T size={16} ls={0} center color={c.white} style={{ position: 'absolute', top: 493, left: 72, right: 72, lineHeight: 22 }}>{'Вы не заходили в Instagram\n67 ч 15 мин'}</T><View style={{ position: 'absolute', top: 582, left: 30, right: 30, height: 58, borderRadius: 32, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}><LinearGradient colors={c.frictionBlue} start={{ x: 0, y: .5 }} end={{ x: 1, y: .5 }} style={StyleSheet.absoluteFill} /><T size={17} ls={0} color={c.white}>Я справлюсь</T></View><T size={14} weight={600} color={c.white} center ls={0} style={{ position: 'absolute', top: 646, left: 49, right: 49, lineHeight: 39, borderWidth: 1, borderColor: c.glassBorder, borderRadius: 24, backgroundColor: c.glassFill }}>Разблокировать (4/6)</T><OnboardingButton onPress={onNext}>Продолжить</OnboardingButton></>;
}
const styles = StyleSheet.create({
  button: { position: 'absolute', left: 20, right: 20, height: 60, borderRadius: 32, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }, nav: { position: 'absolute', width: 44, height: 44, borderRadius: 22, backgroundColor: c.white, boxShadow: c.navShadow, justifyContent: 'center', alignItems: 'center', zIndex: 3 }, progress: { position: 'absolute', left: 84, right: 40, height: 6, borderRadius: 5, backgroundColor: c.progress, overflow: 'hidden' }, hintIcon: { width: 18, height: 18, borderRadius: 5, backgroundColor: c.muted, justifyContent: 'center', alignItems: 'center' },
});
