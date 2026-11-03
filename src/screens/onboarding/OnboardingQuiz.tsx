import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { PanResponder, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { Icon, type IconName } from '@/components/Icon';
import { PressScale } from '@/components/motion';
import { onboardingArt as art, onboardingGoalLabel, onboardingIssues, onboardingTimes } from '@/data/onboarding';
import { onboardingTheme as c } from '@/theme/tokens';
import { T, rounded } from '@/theme/typography';
import { OnboardingButton, OnboardingHint, OnboardingNav, OnboardingTitle } from './OnboardingPieces';

export function NameEntry({ name, onChange, onNext }: { name: string; onChange: (value: string) => void; onNext: () => void }) {
  return <><OnboardingTitle top={217} size={28}>Как к вам обращаться?</OnboardingTitle><View style={styles.name}><TextInput accessibilityLabel="Ваше имя" value={name} autoFocus maxLength={40} onChangeText={onChange} placeholder="Имя" placeholderTextColor={c.muted} autoCorrect={false} returnKeyType="next" onSubmitEditing={() => { if (name.trim()) onNext(); }} style={styles.input} /><PressScale accessibilityRole="button" accessibilityLabel="Очистить имя" disabled={!name} onPress={() => onChange('')} style={{ width: 40, height: 51, alignItems: 'center', justifyContent: 'center' }}><Icon name={name ? 'reflection-close' : 'pencil'} width={17} height={17} color={c.muted} /></PressScale></View><OnboardingButton onPress={onNext} disabled={!name.trim()} style={{ top: 480, bottom: undefined }}>Продолжить</OnboardingButton></>;
}
export function OnboardingQuiz({ time = false, onBack, onSelect }: { time?: boolean; onBack: () => void; onSelect: (index: number) => void }) {
  return <><OnboardingNav onBack={onBack} /><OnboardingTitle top={time ? 162 : 151} side={time ? 35 : 46}>{time ? 'Сколько часов в день вы\nпроводите в телефоне?' : 'Что не так с вашим\nтелефоном?'}</OnboardingTitle>{time && <T size={15} weight={400} color={c.muted} center ls={0} style={{ position: 'absolute', top: 226, left: 30, right: 30, lineHeight: 19 }}>В среднем за день</T>}<View style={{ marginTop: time ? 59 : 51, marginHorizontal: 20, gap: time ? 10 : 8 }}>{(time ? onboardingTimes : onboardingIssues).map((label,i) => <PressScale key={label} accessibilityRole="button" accessibilityLabel={label} onPress={() => onSelect(i)} style={styles.option}>{!time && <Icon name={`onboarding-quiz-${i+1}` as IconName} width={21} height={21} color={c.muted} />}<T size={16} weight={600} ls={0} style={{ flex: 1, lineHeight: 20 }}>{label}</T><Icon name="chevron-right" width={8} height={11} color={c.muted} /></PressScale>)}</View></>;
}
export function GoalIntro({ onNext }: { onNext: () => void }) {
  return <><View style={{ position: 'absolute', top: 137, left: 0, right: 0, height: 423, overflow: 'hidden' }}><Image source={art.goal} contentFit="fill" style={StyleSheet.absoluteFill} /></View><LinearGradient pointerEvents="none" colors={[c.skyFade,c.white]} style={{position:'absolute',left:0,right:0,top:487,height:58}}/><View pointerEvents="none" style={{position:'absolute',top:545,left:0,right:0,height:15,backgroundColor:c.white}}/><Icon name="onboarding-wordmark" width={70} height={19.6} color={c.white} style={{ position: 'absolute', top: 211, left: 55 }} /><T size={10} ls={0} color={c.white} style={{ position: 'absolute', top: 215, left: 171, lineHeight: 13 }}>18 апр.</T><T size={13} weight={600} color={c.quoteName} center ls={0} style={{ position: 'absolute', top: 301, left: 120, right: 120, lineHeight: 17 }}>Экранное время</T><Icon name="goal-check" width={14} height={14} color={c.white} style={{ position: 'absolute', top: 391, left: 128 }} /><T size={12} color={c.white} center ls={0} style={{ position: 'absolute', top: 391, left: 137, width: 138, lineHeight: 16 }}>Ниже цели в 2 часа</T><T size={17} center ls={0} style={{ marginTop: 530, lineHeight: 21 }}>Поставим цель</T><T size={28} center ls={-.2} style={{ marginTop: 4, lineHeight: 34 }}>{'Не превышайте свою цель\nдень за днём'}</T><OnboardingHint style={{ marginTop: 29 }} /><OnboardingButton onPress={onNext}>Продолжить</OnboardingButton></>;
}
export function GoalControls({ value, onChange, onBack, onNext }: { value: number; onChange: (minutes: number) => void; onBack: () => void; onNext: () => void }) {
  const [gesture] = useState(() => new GoalGesture(value,onChange));
  useEffect(()=>gesture.update(value,onChange),[gesture,value,onChange]);
  const change = (delta: number) => onChange(Math.max(20,Math.min(420,value+delta)));
  return <><OnboardingNav onBack={onBack} /><OnboardingTitle top={164} size={value%60 ? 24 : 26} line={31}>Цель экранного времени</OnboardingTitle><T size={14} weight={400} color={c.note} center ls={0} style={{ marginHorizontal: 35, lineHeight: 20 }}>{'Обычно вы проводите около 7 часов в день\nна телефоне'}</T><View style={styles.goalMarker}><View style={{position:'absolute',bottom:-5,alignSelf:'center',width:10,height:10,backgroundColor:c.white,transform:[{rotate:'45deg'}]}}/><T size={15} ls={0} style={{ lineHeight: 20 }}>Смелая цель!</T></View><View {...gesture.pan.panHandlers} onLayout={e=>gesture.setWidth(e.nativeEvent.layout.width)} accessible accessibilityRole="adjustable" accessibilityLabel="Цель экранного времени" accessibilityValue={{ min:20,max:420,now:value,text:onboardingGoalLabel(value) }} aria-valuemin={20} aria-valuemax={420} aria-valuenow={value} accessibilityActions={[{name:'increment'},{name:'decrement'}]} onAccessibilityAction={e=>change(e.nativeEvent.actionName==='increment'?20:-20)} style={styles.range}><View style={[styles.fill,{width:`${value/420*100}%`}]}><T size={23.5} color={c.white} ls={0}>{onboardingGoalLabel(value)}</T><View style={styles.rangeHandle}/></View><T size={value%60?15:16} weight={400} color={c.muted} ls={0} style={{ marginLeft:'auto',marginRight:14 }}>7 ч</T></View><View style={styles.caps}><T size={13} weight={600} color={c.cap} ls={0}>Ваша цель</T><T size={13} weight={400} color={c.muted} ls={0}>Сегодня</T></View><View style={styles.adjust}><PressScale accessibilityRole="button" accessibilityLabel="Уменьшить цель на 20 минут" disabled={value<=20} onPress={()=>change(-20)} style={styles.circle}><T size={29} weight={400} ls={0}>−</T></PressScale><T size={40} ls={0} style={{lineHeight:48}}>{onboardingGoalLabel(value)}</T><PressScale accessibilityRole="button" accessibilityLabel="Увеличить цель на 20 минут" disabled={value>=420} onPress={()=>change(20)} style={styles.circle}><Icon name="plus" width={20} height={20} color={c.ink}/></PressScale></View><OnboardingHint instruction style={{position:'absolute',top:656,left:20,right:20}}/><OnboardingButton onPress={onNext}>Продолжить</OnboardingButton></>;
}
export function OnboardingMath() {
  return <><View style={{position:'absolute',top:331,alignSelf:'center',width:155,height:155,justifyContent:'center',alignItems:'center'}}><Svg width={155} height={155} style={StyleSheet.absoluteFill}><Defs><SvgGradient id="onboard-ring" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={c.purple[0]}/><Stop offset="1" stopColor={c.purple[1]}/></SvgGradient></Defs><Circle cx={77.5} cy={77.5} r={74.5} fill="none" stroke="url(#onboard-ring)" strokeWidth={6}/></Svg><T size={28} color={c.purple[0]} ls={0}>100%</T></View><OnboardingTitle top={514} size={24} line={30}>Давайте посчитаем</OnboardingTitle></>;
}
// Императивное состояние жеста отделено от React render и не теряется при смене цели.
class GoalGesture {
  private value: number;
  private onChange: (value:number)=>void;
  private start = 0;
  private width = 353;
  readonly pan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { this.start=this.value; },
    onPanResponderMove: (_,event) => this.onChange(Math.max(20,Math.min(420,Math.round((this.start+event.dx/this.width*420)/20)*20))),
  });
  constructor(value:number,onChange:(value:number)=>void){this.value=value;this.onChange=onChange;}
  update(value:number,onChange:(value:number)=>void){this.value=value;this.onChange=onChange;}
  setWidth(width:number){this.width=width;}
}
const styles=StyleSheet.create({
 name:{marginTop:30,marginHorizontal:20,height:53,borderRadius:30,borderWidth:1,borderColor:c.muted,backgroundColor:c.white,flexDirection:'row',alignItems:'center',paddingLeft:18},input:{flex:1,height:51,fontSize:14,fontFamily:rounded,color:c.ink,padding:0,borderWidth:0,outlineStyle:'solid',outlineWidth:0},option:{height:74,borderRadius:24,backgroundColor:c.surface,paddingHorizontal:24,flexDirection:'row',alignItems:'center',gap:13},
 goalMarker:{position:'absolute',top:342,alignSelf:'center',paddingVertical:9,paddingHorizontal:12,borderRadius:10,backgroundColor:c.white,boxShadow:c.circleShadow},range:{position:'absolute',top:408,left:20,right:20,height:54,borderRadius:30,backgroundColor:c.range,flexDirection:'row',alignItems:'center',boxShadow:c.rangeShadow},fill:{height:54,borderRadius:30,backgroundColor:c.blue,flexDirection:'row',alignItems:'center',paddingHorizontal:18,boxShadow:c.rangeFillShadow},rangeHandle:{width:4,height:22,borderRadius:2,backgroundColor:c.white,marginLeft:'auto'},caps:{position:'absolute',top:475,left:32,right:32,flexDirection:'row',justifyContent:'space-between'},adjust:{position:'absolute',top:522,left:78,right:78,height:48,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},circle:{width:42,height:42,borderRadius:21,backgroundColor:c.white,boxShadow:c.circleShadow,alignItems:'center',justifyContent:'center'},
});
