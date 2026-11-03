import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';
import type { ComponentProps } from 'react';
// Web измеряется в CSS px, native сохраняет настроенную интенсивность.
export function MaterialBlur({blurPx,nativeIntensity,...props}:Omit<ComponentProps<typeof BlurView>,'intensity'> & {blurPx:number;nativeIntensity:number}) {
  return <BlurView {...props} intensity={Platform.OS==='web'?Math.min(100,blurPx*5):nativeIntensity}/>;
}
