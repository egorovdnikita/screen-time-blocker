import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/TabBar';
import { useAppState } from '@/state/app';

export default function TabsLayout() {
  // Новая установка начинает со знакомства 000; незавершённый шаг восстанавливается из хранилища.
  const { onboardingCompleted } = useAppState();
  if (!onboardingCompleted) return <Redirect href="/onboarding" />;
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, animation: 'shift' }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="rules" />
      <Tabs.Screen name="overview" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
