import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { remainingScreens } from '@/data/remainingScreens';
import { useAppState } from '@/state/app';
import { T } from '@/theme/typography';
import { colors, remainingTheme as c } from '@/theme/tokens';
import { PressScale } from '@/components/motion';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { MainSettings } from '@/screens/settings/MainSettings';
import { InterfaceSettings } from '@/screens/settings/InterfaceSettings';
import { QrPass } from '@/screens/session/QrPass';
import { SetupPreview } from './SetupPreview';
import { HabitPhoto, type HabitPhotoState } from './HabitPhoto';
import { SystemPreviews } from './SystemPreviews';
export function RemainingScreen({id}:{id?:number}) {
 const app=useAppState(),insets=useSafeAreaInsets();const [open,setOpen]=useState(true);
 const dismiss=()=>{setOpen(false);if(router.canGoBack())router.back();else router.replace('/remaining');};
 const {setAppIcon,setNotifications}=app;
 useEffect(()=>{if(id===310||id===311||id===312)setAppIcon(id===312?'spooky':'original');if(id===316||id===317)setNotifications({diary:id===317,sessionStart:true,sessionEnd:true,unlockWarning:true,unlockEnd:true,allOff:false});if(id===46)router.replace('/session?tip=template');if(id===207)router.replace('/(tabs)/rules?earned=1');if(id===265)router.replace('/(tabs)/profile?recap=1');},[id,setAppIcon,setNotifications]);
 if(!id)return <ScrollView style={{flex:1,backgroundColor:c.surface}} contentContainerStyle={{paddingTop:insets.top+30,paddingHorizontal:20,paddingBottom:40}}><T size={28}>Перенесённые экраны</T><T size={14} weight={400} color={c.value} ls={0} style={{marginTop:12,marginBottom:20}}>22 последних состояния. Системные функции и проверка фото — демо макетов. Вернуться можно жестом «назад» или кнопкой браузера.</T>{remainingScreens.map(([number,title])=><PressScale key={number} accessibilityRole="button" accessibilityLabel={`Экран ${String(number).padStart(3,'0')}`} onPress={()=>router.push(`/remaining?id=${number}`)} style={{padding:16,borderRadius:20,backgroundColor:colors.white,marginBottom:8}}><T size={15}>{String(number).padStart(3,'0')} · {title}</T></PressScale>)}</ScrollView>;
 if(id>=338)return <SystemPreviews id={id}/>;
 const photo=({203:'photo',204:'analyzing',205:'error',206:'good'} as Record<number,HabitPhotoState>)[id];
 return <View accessibilityLabel={`Перенесённый экран ${String(id).padStart(3,'0')}`} style={{flex:1,backgroundColor:c.system}}>{[310,311,312,316,317,318].includes(id)&&<ProfileScreen/>}{open&&<>
 {id===94&&<QrPass onClose={dismiss}/>}
 {id===107&&<SetupPreview onClose={dismiss}/>}
 {photo&&<HabitPhoto initial={photo} onClose={dismiss} onEarn={()=>router.replace('/(tabs)/rules?earned=1')}/>}
 {[310,311,312].includes(id)&&<InterfaceSettings initialPicker demoAlert={id===311} onClose={dismiss}/>}
 {(id===316||id===317||id===318)&&<MainSettings initialChild={id===318?'language':'notifications'} onClose={dismiss}/>}
 </>}</View>;
}
