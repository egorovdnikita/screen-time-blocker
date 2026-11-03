import { useLocalSearchParams } from 'expo-router';
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen';
// Без ?step= знакомство продолжается с сохранённого шага.
export default function OnboardingRoute() {
  const { step } = useLocalSearchParams<{step?:string}>();
  return <OnboardingScreen initialStep={step ? Number(step) : undefined}/>;
}
