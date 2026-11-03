import { ActivityIndicator } from 'react-native';
import { PlainSettingsSheet } from '@/components/PlainSettingsSheet';
import { PressScale } from '@/components/motion';
import { remainingTheme as c, colors } from '@/theme/tokens';
import { T } from '@/theme/typography';
// Состояние107 — отдельный предпросмотр, не имитация выдачи разрешения Screen Time.
export function SetupPreview({onClose}:{onClose:()=>void}) {
 return <PlainSettingsSheet title="1 приложение" top={69} surface={c.setup} onClose={onClose}><T size={12} weight={600} color={c.setupInk} ls={0} center style={{position:'absolute',top:363,left:20,right:20,lineHeight:16}}>Отлично! Всё настраиваем…</T><ActivityIndicator color={c.setupInk} style={{position:'absolute',top:396,alignSelf:'center',width:20,height:20}}/><PressScale accessibilityRole="button" accessibilityLabel="Настройка приложения: продолжить" disabled style={{position:'absolute',left:20,right:20,bottom:39,height:60,borderRadius:32,backgroundColor:colors.chevronCompact,alignItems:'center',justifyContent:'center'}}><T size={17} color={colors.white}>Продолжить</T></PressScale></PlainSettingsSheet>;
}
