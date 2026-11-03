import { View } from 'react-native';
import { SettingsStack } from './SettingsStack';
import { SheetScrollView } from '@/components/SheetModal';
import { FlowSwitch } from '@/components/SessionPrimitives';
import { Icon, type IconName } from '@/components/Icon';
import { useAppState } from '@/state/app';
import { T } from '@/theme/typography';
import { colors, remainingTheme as c } from '@/theme/tokens';
import type { NotificationPreferences } from '@/data/preferences';
import { PressScale } from '@/components/motion';
import { useNotificationPermission } from '@/state/notifications';
const groups: {title:string; gap:number; rows:{key:keyof NotificationPreferences;label:string;icon:IconName;sub?:string}[]}[] = [
  {title:'Экранное время',gap:0,rows:[{key:'diary',label:'Напоминание вести дневник',sub:'Каждый день в 20:00',icon:'notify-journal'}]},
  {title:'Сессии',gap:29.667,rows:[{key:'sessionStart',label:'Перед началом',icon:'play-fill'},{key:'sessionEnd',label:'Перед окончанием',icon:'interface-app'}]},
  {title:'Разблокировки',gap:32.334,rows:[{key:'unlockWarning',label:'Перед завершением',icon:'notify-alarm'},{key:'unlockEnd',label:'Перед окончанием',icon:'shield-check'}]},
];
export function NotificationSettings({onClose}:{onClose:()=>void}) {
 const app=useAppState(),value=app.notifications;
 const {permission,request}=useNotificationPermission();
 // APP-21: системный запрет показываем над группами; на вебе и до первого запроса плашки нет.
 const banner=(permission==='denied'||permission==='blocked')&&<PressScale accessibilityRole="button" accessibilityLabel="Разрешить уведомления Block" onPress={request} style={{marginBottom:24,borderRadius:20,backgroundColor:colors.white,padding:16,gap:4}}><T size={14.25} weight={600} variant="text" ls={0}>Уведомления выключены</T><T size={13} weight={400} variant="text" color={c.value} ls={0} style={{lineHeight:17}}>{permission==='blocked'?'Разрешите их в Настройках iOS → Block → Уведомления.':'Нажмите, чтобы разрешить уведомления.'}</T></PressScale>;
 const row=(key:keyof NotificationPreferences,label:string,icon:IconName,sub?:string,last=true)=><View key={key} style={{height:sub?67.333:key==='allOff'?59:60.333,flexDirection:'row',alignItems:'center',paddingHorizontal:15,gap:11,borderBottomWidth:last?0:1,borderColor:c.line}}><View style={{width:22,height:24,alignItems:'center',justifyContent:'center'}}><Icon name={icon} width={key==='sessionStart'?16:key==='sessionEnd'?15:22} height={key==='sessionStart'?18:key==='sessionEnd'?15:24} color={c.icon}/></View><View style={{flex:1}}><T size={14.25} weight={400} variant="text" ls={0} style={{lineHeight:20}}>{label}</T>{sub&&<T size={13} weight={400} variant="text" color={c.value} ls={0} style={{lineHeight:17}}>{sub}</T>}</View><FlowSwitch label={key==='allOff'?label:`Уведомления: ${label}`} disabled={key!=='allOff'&&value.allOff} value={key==='allOff'?value.allOff:!value.allOff&&value[key]} onChange={enabled=>app.setNotifications({...value,[key]:enabled})}/></View>;
 return <SettingsStack onClose={onClose} radius={44} surface={c.surface}><T size={20} center ls={0} style={{position:'absolute',top:44,left:20,right:20,lineHeight:26}}>Уведомления</T><SheetScrollView accessibilityLabel="Настройки уведомлений" style={{marginTop:100}} contentContainerStyle={{paddingHorizontal:20,paddingBottom:40}}>{banner}{groups.map(group=><View key={group.title} style={{marginTop:group.gap}}><T size={20} color={c.section} ls={0} style={{lineHeight:26}}>{group.title}</T><View style={{marginTop:11,borderRadius:20,backgroundColor:colors.white,overflow:'hidden'}}>{group.rows.map((r,i)=>row(r.key,r.label,r.icon,r.sub,i===group.rows.length-1))}</View></View>)}<View style={{marginTop:33.667,borderRadius:20,backgroundColor:colors.white,overflow:'hidden'}}>{row('allOff','Отключить все уведомления','notify-muted')}</View></SheetScrollView></SettingsStack>;
}
