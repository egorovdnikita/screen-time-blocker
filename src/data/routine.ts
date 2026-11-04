import { art } from './art';
import { cloneAppGroup, hasGroupSelection } from './appGroup';
import { initialSession, type SessionDraft } from './session';
import type { RoutineRule } from './rules';
import { localDay } from './unlockDay';
export type Habit = { id: string; label: string; title: string; image: number; minutes: number; criterion?: string; kind?: 'photo' | 'manual' };
export const habits: Habit[] = [
  { id: 'clean', label: 'Убраться в комнате', title: 'Убрать комнату', image: art.habitBroom, minutes: 5 },
  { id: 'outside', label: 'Выйти на улицу', title: 'Выйти на улицу', image: art.habitLeaf, minutes: 5 },
  { id: 'todo', label: 'Составить список дел', title: 'Составить список дел', image: art.habitClipboard, minutes: 5 },
  { id: 'lunch', label: 'Приготовить полезный обед', title: 'Приготовить полезный обед', image: art.habitSoup, minutes: 5 },
];
export type HabitId = string;
export const manualHabit: Habit = { id: 'shower', label: 'Принять холодный душ', title: 'Принять холодный душ', image: art.habitShower, minutes: 5, kind: 'manual' };
export const newHabit = (): Habit => ({ id: `habit-${Date.now()}`, label: '', title: '', criterion: '', image: art.routinePlant, minutes: 5, kind: 'photo' });
export function habitCatalog(custom: Habit[]) {
  const base = [...habits, manualHabit];
  return [...base.map(habit => custom.find(h => h.id === habit.id) ?? habit), ...custom.filter(habit => !base.some(h => h.id === habit.id))];
}
export const routineHabits = (draft: RoutineDraft) => (draft.habitDefinitions ?? habits).filter(h => draft.habitIds.includes(h.id));
export type RoutineDraft = SessionDraft & { habitIds: HabitId[]; habitDefinitions?: Habit[]; earningMode: 'time' | 'completion'; startingMinutes: number };
export const initialRoutine = (): RoutineDraft => ({ ...initialSession(), title: 'Рутина', days: [0, 1, 2, 3, 4, 5, 6], appGroup: { ...initialSession().appGroup, selectedApps: [false, false, false] }, habitIds: [], earningMode: 'time', startingMinutes: 0, allDay: true });
/** Выполнение рутины за день (APP-15): новый день сбрасывает отметки, награда выдаётся один раз. */
export type RoutineProgress = { day: string; done: string[]; claimed: boolean };
export const routineProgressToday = (entry: RoutineProgress | undefined, now: number): RoutineProgress => entry?.day === localDay(now) ? entry : { day: localDay(now), done: [], claimed: false };
export const routineReward = (draft: RoutineDraft) => routineHabits(draft).reduce((sum, h) => sum + h.minutes, 0);
export const canSaveRoutine = (draft: RoutineDraft) => hasGroupSelection(draft.appGroup) && draft.habitIds.length > 0 && draft.days.length > 0;
export function routineRule(draft: RoutineDraft): RoutineRule | null {
  if (!canSaveRoutine(draft)) return null;
  return { id: `routine-${Date.now()}`, title: draft.title.trim() || 'Рутина', configuration: { ...draft, habitIds: [...draft.habitIds], habitDefinitions: routineHabits(draft).map(habit => ({ ...habit })), days: [...draft.days], appGroup: cloneAppGroup(draft.appGroup) } };
}
