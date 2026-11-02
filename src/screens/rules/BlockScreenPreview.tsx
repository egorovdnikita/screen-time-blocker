import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressScale } from '@/components/motion';
import { art } from '@/data/art';
import { findScreenApp, resolveScreenText, type CustomBlockScreen } from '@/data/blockScreens';
import { useAppState } from '@/state/app';
import { T } from '@/theme/typography';
import { colors, blockScreensTheme as c } from '@/theme/tokens';

export function BlockScreenPreview({ screen, onClose }: { screen: CustomBlockScreen | 'tips'; onClose: () => void }) {
  const app = useAppState();
  const insets = useSafeAreaInsets();
  const tips = screen === 'tips';
  const message = !tips && screen.kind === 'message';
  const application = !tips && screen.kind === 'app' ? findScreenApp(screen.appId) : undefined;
  const context = { shielded_activity_name: 'XChat', total_screen_time: app.day.screenTime, total_shielded_activity_opens_count: '5' };
  const title = tips ? 'Уделяйте внимание важному' : message ? resolveScreenText(screen.title, context) : `Позаботьтесь о себе\nс ${application?.title ?? ''}`;
  const text = tips ? 'Джеймс Уильямс сказал мне:\n«Чтобы делать важное в любой\nсфере и любом контексте жизни,\nнужно уметь уделять внимание\nважному… Если вы не можете\nэтого, вам будет очень трудно\nсделать хоть что-нибудь».' : message ? resolveScreenText(screen.subtitle, context) : 'Вы уже открыли XChat 5 раз за\nсегодня. Может, стоит заняться\nчем-нибудь другим?';
  return <Modal animationType="fade" onRequestClose={onClose}><StatusBar style="dark" animated /><ScrollView bounces={false} contentContainerStyle={{ minHeight: 852, flexGrow: 1 }}><LinearGradient colors={[c.previewTop, c.previewBottom]} style={StyleSheet.absoluteFill} /><Image source={tips ? art.blockScreenQuoteCheck : message ? art.blockScreenMessagePreview : application?.preview ?? application?.image} contentFit="contain" style={{ position: 'absolute', width: tips ? 69 : message ? 61 : 57, height: tips ? 69 : message ? 61 : 57, top: tips ? 181 : message ? 298 : 257, alignSelf: 'center' }} /><T size={22} center ls={-.4} style={{ position: 'absolute', top: tips ? 291 : message ? 403 : 361, left: 20, right: 20, lineHeight: 28 }}>{title}</T><T size={tips ? 20 : 21} variant="display" weight={400} center color={c.caption} ls={0} style={{ position: 'absolute', top: tips ? 346 : message ? 459 : 444, left: 28, right: 28, lineHeight: 28 }}>{text}</T>{tips && <T size={18} weight={400} variant="display" center color={c.caption} ls={0} style={{ position: 'absolute', top: 572, left: 20, right: 20, lineHeight: 26 }}>— Йохан Хари, «Украденный фокус»</T>}<View style={{ position: 'absolute', top: tips ? 626 : message ? 514 : 556, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}><T size={21} weight={400} variant="display" color={c.caption} ls={0}>Блокирует:</T><Image source={art.blockScreenQuotePlant} style={{ width: 23, height: 26 }} /><T size={21} variant="display" color={c.caption} ls={0}>Рутина</T></View><PressScale accessibilityRole="button" accessibilityLabel="Закрыть предпросмотр экрана" onPress={onClose} style={{ position: 'absolute', left: 32, right: 32, bottom: Math.max(42, insets.bottom + 8), height: 50, borderRadius: 28, backgroundColor: c.previewBlue, alignItems: 'center', justifyContent: 'center' }}><T size={17} weight={400} variant="display" color={colors.white} ls={0}>{message && screen.button.trim() ? resolveScreenText(screen.button, context) : 'Закрыть'}</T></PressScale></ScrollView></Modal>;
}
