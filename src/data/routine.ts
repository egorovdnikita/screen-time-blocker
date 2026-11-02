import { art } from './art';
import { cloneAppGroup, hasGroupSelection } from './appGroup';
import { initialSession, type SessionDraft } from './session';
import type { RoutineRule } from './rules';
export const habits = [
  { id: 'clean', label: 'Убраться в комнате', title: 'Убрать комнату', image: art.habitBroom, minutes: 5 },
  { id: 'outside', label: 'Выйти на улицу', title: 'Выйти на улицу', image: art.habitLeaf, minutes: 5 },
  { id: 'todo', label: 'Составить список дел', title: 'Составить список дел', image: art.habitClipboard, minutes: 5 },
  { id: 'lunch', label: 'Приготовить полезный обед', title: 'Приготовить полезный обед', image: art.habitSoup, minutes: 5 },
] as const;
export type HabitId = typeof habits[number]['id'];
export type RoutineDraft = SessionDraft & { habitIds: HabitId[]; earningMode: 'time' | 'completion'; startingMinutes: number };
export const initialRoutine = (): RoutineDraft => ({ ...initialSession(), title: 'Рутина', days: [0, 1, 2, 3, 4, 5, 6], appGroup: { ...initialSession().appGroup, selectedApps: [false, false, false] }, habitIds: [], earningMode: 'time', startingMinutes: 0, allDay: true });
export const routineReward = (draft: RoutineDraft) => habits.filter(h => draft.habitIds.includes(h.id)).reduce((sum, h) => sum + h.minutes, 0);
export const canSaveRoutine = (draft: RoutineDraft) => hasGroupSelection(draft.appGroup) && draft.habitIds.length > 0 && draft.days.length > 0;
export function routineRule(draft: RoutineDraft): RoutineRule | null {
  if (!canSaveRoutine(draft)) return null;
  return { id: `routine-${Date.now()}`, title: draft.title.trim() || 'Рутина', configuration: { ...draft, habitIds: [...draft.habitIds], days: [...draft.days], appGroup: cloneAppGroup(draft.appGroup) } };
}
