import { useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useAppState } from '@/state/app';
import { initialSession, sessionRule } from '@/data/session';
import { onboardingTheme as c } from '@/theme/tokens';
import { Welcome, SocialProof } from './WelcomeSocial';
import { OnboardingFriction, OnboardingStory } from './OnboardingPieces';
import { NameEntry, OnboardingQuiz, GoalIntro, GoalControls, OnboardingMath } from './OnboardingQuiz';
import { Commit, ConnectScreenTime, Preferences, OnboardingPicker, OnboardingUnlocks, OnboardingMethod, OnboardingSchedule } from './OnboardingSetup';

export function OnboardingScreen({ initialStep }: { initialStep?: number }) {
  const app = useAppState(); const { height } = useWindowDimensions();
  const { startOnboarding, patchOnboarding: patch } = app;
  useEffect(() => { if (initialStep !== undefined) startOnboarding(initialStep); }, [initialStep,startOnboarding]);
  const draft = app.onboardingDraft, step = draft.step;
  const go = (next: number) => patch({ step: next });
  useEffect(() => { if (step !== 11) return; const timer = setTimeout(() => patch({step:12}),1800); return () => clearTimeout(timer); }, [step,patch]);
  const finish = (schedule: boolean) => {
    const session = initialSession(true); session.title = ({limit:'Рабочее время',morning:'Утро',work:'Рабочее время',evening:'Вечерний отдых'})[draft.preference];
    session.start = draft.preference === 'morning' ? 6 : draft.preference === 'evening' ? 21 : 9;
    session.end = draft.preference === 'morning' ? 8 : draft.preference === 'evening' ? 6 : 17;
    session.unlocks = draft.unlocks; session.unlockMinutes = draft.unlockMinutes;
    session.appGroup.selectedApps = ['xchat','messages','bereal'].map(id=>draft.apps.includes(id));
    app.setScenario('firstRun'); app.setRulesVariant('onboarding'); app.setDailyGoalMinutes(draft.goal);
    if (draft.name.trim()) app.setProfileName(draft.name.trim());
    if (schedule) app.addSession({...sessionRule(session),appIds:['messages','xchat','bereal','facetime'].filter(id=>draft.apps.includes(id))});
    app.completeOnboarding();
    router.replace('/(tabs)/rules');
  };
  let content;
  switch (step) {
    case 0: content=<Welcome onStart={()=>go(1)}/>;break;
    case 1: content=<OnboardingFriction onBack={()=>go(0)} onNext={()=>go(2)}/>;break;
    case 2: content=<SocialProof onBack={()=>go(1)} onNext={()=>go(3)}/>;break;
    case 3: content=<OnboardingStory kind="personalize" onNext={()=>go(4)}/>;break;
    case 4: case 5: content=<NameEntry name={draft.name} onChange={name=>patch({name,step:name?5:4})} onNext={()=>go(6)}/>;break;
    case 6: content=<OnboardingQuiz onBack={()=>go(draft.name?5:4)} onSelect={issue=>patch({issue,step:7})}/>;break;
    case 7: content=<OnboardingQuiz time onBack={()=>go(6)} onSelect={time=>patch({time,step:8})}/>;break;
    case 8: content=<GoalIntro onNext={()=>go(draft.goal%60?10:9)}/>;break;
    case 9: case 10: content=<GoalControls value={draft.goal} onChange={goal=>patch({goal,step:goal%60?10:9})} onBack={()=>go(8)} onNext={()=>go(11)}/>;break;
    case 11: content=<OnboardingMath/>;break;
    case 12: content=<OnboardingStory kind="honest" onNext={()=>go(13)}/>;break;
    case 13: content=<OnboardingStory kind="years" onNext={()=>go(14)}/>;break;
    case 14: content=<OnboardingStory kind="started" onNext={()=>go(15)}/>;break;
    case 15: content=<Commit onNext={()=>go(17)}/>;break;
    case 17: content=<ConnectScreenTime onNext={()=>go(18)}/>;break;
    case 18: content=<Preferences onBack={()=>go(17)} onSelect={preference=>patch({preference,step:19})}/>;break;
    case 19: case 20: case 21: content=<OnboardingPicker value={draft.apps} expanded={step!==19} onChange={apps=>patch({apps,step:apps.length?21:20})} onExpand={()=>go(step===19?draft.apps.length?21:20:19)} onBack={()=>go(18)} onNext={()=>go(draft.unlocks===3?23:22)}/>;break;
    case 22: case 23: content=<OnboardingUnlocks draft={draft} patch={patch} onBack={()=>go(21)} onNext={()=>go(24)}/>;break;
    case 24: content=<OnboardingMethod onBack={()=>go(draft.unlocks===3?23:22)} onNext={()=>go(25)}/>;break;
    case 25: content=<OnboardingSchedule draft={draft} onBack={()=>go(24)} onFinish={finish}/>;break;
  }
  return <KeyboardAvoidingView behavior={Platform.OS==='ios'&&(step===4||step===5)?'padding':undefined} style={{flex:1,backgroundColor:step>=19&&step<=21?c.picker:c.white}}><StatusBar style={step===0?'light':'dark'}/><ScrollView accessibilityLabel={`Знакомство: экран ${String(step).padStart(3,'0')}`} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{minHeight:Math.max(852,height)}}><View style={[styles.page,{minHeight:Math.max(852,height),backgroundColor:step>=19&&step<=21?c.picker:c.white}]}>{content}</View></ScrollView></KeyboardAvoidingView>;
}
const styles=StyleSheet.create({page:{position:'relative',overflow:'hidden'}});
