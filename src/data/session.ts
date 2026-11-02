import type { SessionRule } from './rules';
export type SessionDraft = { title: string; minutes: number; scheduled: boolean; start: number; end: number; days: number[]; strict: boolean; unlocks: number };
export const initialSession = (scheduled = false): SessionDraft => ({ title: 'Сессия', minutes: 30, scheduled, start: 9, end: 17, days: [0, 1, 2, 3, 4], strict: false, unlocks: 0 });
export const hourLabel = (hour: number) => `${String(hour).padStart(2, '0')}:00`;
export function sessionRule(draft: SessionDraft): SessionRule {
  return { id: `session-${Date.now()}`, emoji: 'zap', title: draft.title.trim() || 'Сессия', status: draft.scheduled ? { kind: 'upcoming' } : { kind: 'blocking', strict: draft.strict },
    meta: draft.scheduled ? { kind: 'schedule', time: `${hourLabel(draft.start)} – ${hourLabel(draft.end)}`, days: draft.days.length === 7 ? 'Каждый день' : draft.days.map(d => ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'][d]).join(', ') } : { kind: 'ring', text: `Осталось ${draft.minutes} мин`, progress: 0, tone: 'blocking' },
    apps: 'first-rule', unlock: draft.unlocks ? `(${draft.unlocks}/${draft.unlocks})` : undefined };
}
