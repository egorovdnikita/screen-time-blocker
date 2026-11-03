export type OnboardingDraft = { step: number; name: string; issue: number | null; time: number | null; goal: number; apps: string[]; preference: 'limit' | 'morning' | 'work' | 'evening'; unlocks: number; unlockMinutes: number };
export const onboardingSteps = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,18,19,20,21,22,23,24,25] as const;
export function initialOnboarding(step = 0): OnboardingDraft {
  return { step: onboardingSteps.includes(step as typeof onboardingSteps[number]) ? step : 0, name: step === 5 ? 'Аня' : '', issue: null, time: null, goal: step === 10 ? 260 : 300, apps: step >= 21 ? ['bereal','messages','xchat'] : [], preference: 'work', unlocks: step >= 23 ? 3 : 2, unlockMinutes: step >= 23 ? 15 : 10 };
}
export const onboardingIssues = ['Плохо сплю','Не могу выбрать главное','Слишком много скроллю','Меня отвлекает телефон','Сижу в телефоне часами','Зависимость от контента 18+','Всё в порядке…'];
export const onboardingTimes = ['Больше 7 часов','5–7 часов','4–5 часов','3–4 часа','1–3 часа','Меньше часа'];
export const onboardingArt = {
  originalIcon: require('../../assets/art/onboarding/icon-original-unselected.png'),
  sky: require('../../assets/art/onboarding/welcome-sky-reference.png'),
  cards: require('../../assets/art/onboarding/onboarding-welcome-cards.png'),
  friction: require('../../assets/art/onboarding/onboarding-friction-phone-clean.png'),
  personalize: require('../../assets/art/onboarding/onboarding-mascot.png'),
  goal: require('../../assets/art/onboarding/onboarding-goal-scene-localized.png'),
  honest: require('../../assets/art/onboarding/onboarding-honest-mascot.png'),
  years: require('../../assets/art/onboarding/onboarding-years-mascot.png'),
  started: require('../../assets/art/onboarding/onboarding-started-mascot.png'),
  commit: require('../../assets/art/onboarding/setup-commit-complete.png'),
  arrow: require('../../assets/art/onboarding/screen-time-prompt-arrow.png'),
  unlockFrame: require('../../assets/art/onboarding/unlock-preview-frame.png'),
};
export const onboardingGoalLabel = (minutes: number) => minutes % 60 ? `${Math.floor(minutes / 60)}ч${String(minutes % 60).padStart(2,'0')}` : `${minutes / 60} ч`;
export const onboardingPreferences = [
  { id: 'limit', icon: 'onboarding-shield-fill', title: 'Ограничить приложения', copy: 'Открывать их несколько раз в день' },
  { id: 'morning', icon: 'onboarding-cup-fill', title: 'Блокировать утром', copy: 'Например, с 6:00 до 8:00' },
  { id: 'work', icon: 'onboarding-graduationcap-fill', title: 'Блокировать на работе', copy: 'Например, с 8:00 до 17:00' },
  { id: 'evening', icon: 'onboarding-moon-fill', title: 'Блокировать вечером', copy: 'Например, с 21:00 до 6:00' },
] as const;
