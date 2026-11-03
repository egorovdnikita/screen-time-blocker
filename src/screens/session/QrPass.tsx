import { Image } from 'expo-image';
import { Image as NativeImage, Platform, Share, View } from 'react-native';
import { remainingArt as art } from '@/data/remainingArt';
import { PlainSettingsSheet } from '@/components/PlainSettingsSheet';
import { PressScale } from '@/components/motion';
import { Icon } from '@/components/Icon';
import { T } from '@/theme/typography';
import { colors, remainingTheme as c } from '@/theme/tokens';
export function QrPass({onClose}:{onClose:()=>void}) {
 const uri=Platform.OS==='web' ? (typeof art.qr_pass_code==='string'?art.qr_pass_code:art.qr_pass_code.uri) : NativeImage.resolveAssetSource(art.qr_pass_code)?.uri;
 const exportCode=async()=>{
  // Это исходный образец, не credential для обхода блокировок ОС.
  if(Platform.OS==='web') { const a=document.createElement('a');a.href=typeof art.qr_pass_code==='string'?art.qr_pass_code:uri??'';a.download='block-qr-demo.png';a.click(); }
  else if(uri) await Share.share({url:uri,message:'Демонстрационный QR-пропуск Block'});
 };
 return <PlainSettingsSheet title="Ваш QR-пропуск" top={218} inset={8} bottom={8} onClose={onClose}><View style={{position:'absolute',top:138,alignSelf:'center',width:210,height:296,borderWidth:2,borderStyle:'dashed',borderColor:colors.dash}}><View style={{position:'absolute',top:24,alignSelf:'center',borderRadius:19,paddingHorizontal:11,paddingVertical:7,backgroundColor:c.dark}}><T size={14} color={colors.white} ls={0} style={{lineHeight:20}}>Сканируйте код</T></View><Image source={art.qr_pass_code} style={{position:'absolute',top:81,alignSelf:'center',width:105,height:105}} contentFit="contain"/><View style={{position:'absolute',top:207,alignSelf:'center'}}><T size={11} center ls={0}>⚡ Сессия</T><T size={10} weight={400} variant="display" center ls={0}>защищает ваше время</T></View><Icon name="qr-pass-tag" width={31} height={23} style={{position:'absolute',top:248,alignSelf:'center'}}/></View><T size={11} center color={c.value} ls={0} style={{position:'absolute',left:20,right:20,bottom:108,lineHeight:14}}>{'Сохраните QR-код для печати или показа на экране.\nСканируйте его для входа в приложения.'}</T><PressScale accessibilityRole="button" accessibilityLabel="Экспортировать QR-пропуск" accessibilityHint="Экспорт демонстрационного образца из макета" onPress={exportCode} style={{position:'absolute',left:20,right:20,bottom:37,height:57,borderRadius:32,backgroundColor:c.dark,alignItems:'center',justifyContent:'center'}}><T size={16} color={colors.white}>Экспортировать</T></PressScale></PlainSettingsSheet>;
}
