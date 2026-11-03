import { initialSession, durationLabel, type SessionDraft } from './session';
import type { LockAppId } from './lockRule';
import type { LimitRule } from './rules';
export type TimeLimitDraft = SessionDraft & { limitApps: LockAppId[]; limitCategories: string[]; notifyBefore: number; notifyEvery: number };
export const initialTimeLimit = (): TimeLimitDraft => ({ ...initialSession(), title: 'Время экрана', minutes: 15, days: [0, 1, 2, 3, 4, 5, 6], limitApps: [], limitCategories: [], notifyBefore: 0, notifyEvery: 0 });
export const daysLabel = (days: number[]) => days.length === 7 ? 'Каждый день' : days.map(i => ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][i]).join(', ');
export function timeLimitRule(draft: TimeLimitDraft): LimitRule | null {
  if (!(draft.limitApps.length + draft.limitCategories.length) || !draft.days.length) return null;
  return { id: `limit-${Date.now()}`, emoji: 'limit-hourglass', title: draft.title.trim() || 'Время экрана', status: { kind: 'ongoing' }, meta: { kind: 'schedule', time: 'Весь день', days: daysLabel(draft.days) }, value: `0с / ${durationLabel(draft.minutes)}`, progress: 0, appCount: draft.limitApps.length + draft.limitCategories.length,
    configuration: { ...draft, limitApps: [...draft.limitApps], limitCategories: [...draft.limitCategories], days: [...draft.days], appGroup: { ...draft.appGroup, selectedApps: [...draft.appGroup.selectedApps], categories: [...draft.appGroup.categories], websites: draft.appGroup.websites.map(site => ({ ...site })) } } };
}
