import { useLocalSearchParams } from 'expo-router';
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen';
export default function OnboardingRoute() {
  const { step } = useLocalSearchParams<{step?:string}>();
  return <OnboardingScreen initialStep={step ? Number(step) : 0}/>;
}
