import { art } from './art';
export const reflectionActivities = [
  { id: 'hobby', title: 'Заниматься хобби', menu: 'Заниматься\nхобби', image: art.reflectionPlant, top: 65 },
  { id: 'fun', title: 'Развлекаться', image: art.reflectionPeace, top: 127 },
  { id: 'exercise', title: 'Тренироваться', image: art.reflectionRunner, top: 169 },
  { id: 'learn', title: 'Узнавать новое', image: art.reflectionBrain, top: 211 },
  { id: 'tasks', title: 'Выполнять дела', menu: 'Выполнять\nдела', image: art.reflectionGear, top: 253 },
  { id: 'delay', title: 'Откладывать дела', image: art.reflectionSeeNoEvil, top: 315 },
  { id: 'scroll', title: 'Листать без цели', image: art.reflectionScroll, top: 357 },
  { id: 'buy', title: 'Покупать сгоряча', image: art.reflectionMoney, top: 399 },
  { id: 'care', title: 'Беречь себя', image: null, top: 501 },
] as const;
export type ReflectionActivityId = typeof reflectionActivities[number]['id'];
export const reflectionMoods = [
  { id: 'very-distracting', title: 'Очень отвлекает', image: art.reflectionMoodVeryDistracting, menuImage: art.reflectionMoodVeryDistracting, quality: 'distracting' },
  { id: 'distracting', title: 'Отвлекает', image: art.reflectionMoodDistracting, menuImage: art.reflectionMoodDistracting, quality: 'distracting' },
  { id: 'neutral', title: 'Норма', image: art.reflectionMoodNeutral, menuImage: art.reflectionMoodNeutralMenu, quality: 'neutral' },
  { id: 'productive', title: 'С пользой', image: art.reflectionMoodProductive, menuImage: art.reflectionMoodProductive, quality: 'productive' },
  { id: 'very-productive', title: 'Очень полезно', image: art.reflectionMoodVeryProductive, menuImage: art.reflectionMoodVeryProductiveMenu, quality: 'productive' },
] as const;
export type ReflectionMoodId = typeof reflectionMoods[number]['id'];
export type Reflection = { activity: ReflectionActivityId | null; mood: ReflectionMoodId; always: boolean };
export const newReflection = (): Reflection => ({ activity: null, mood: 'neutral', always: false });
export const reflectionKey = (dayId: string, appId: string) => `${dayId === 'today-refreshed' ? 'today' : dayId}:${appId}`;
