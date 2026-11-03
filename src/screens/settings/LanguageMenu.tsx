import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SheetModal } from '@/components/SheetModal';
import { PressScale } from '@/components/motion';
import { languages } from '@/data/preferences';
import { T } from '@/theme/typography';
import { remainingTheme as c } from '@/theme/tokens';
export function LanguageMenu({onClose}:{onClose:()=>void}) {
 const {height}=useWindowDimensions();
 return <SheetModal animateClose motion="dialog" swipeEnabled={false} onClose={onClose} backdrop={close=><Pressable accessibilityLabel="Закрыть языки" onPress={()=>close()} style={StyleSheet.absoluteFill}/>}>{close=><View accessibilityRole="menu" style={{position:'absolute',right:36,top:Math.max(70,Math.min(336,height-456)),width:250,height:440,borderRadius:34,borderWidth:1,borderColor:c.menuBorder,backgroundColor:c.menu,boxShadow:c.menuShadow,overflow:'hidden',paddingTop:8}}><BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill}/>{languages.map(([flag,name],i)=><PressScale key={name} accessibilityRole="menuitem" accessibilityLabel={`Язык: ${name}`} accessibilityState={{disabled:i!==0,selected:i===0}} disabled={i!==0} onPress={()=>close()} style={{height:42,paddingLeft:i===0?48:29,flexDirection:'row',alignItems:'center',gap:7,backgroundColor:i===0?c.menuSelected:undefined}}>{i===0&&<T size={16} weight={400} ls={0} style={{position:'absolute',left:27}}>✓</T>}<T size={18} weight={400} ls={0}>{flag}</T><T size={16.25} weight={400} variant="display" ls={0}>{name}</T></PressScale>)}</View>}</SheetModal>;
}
