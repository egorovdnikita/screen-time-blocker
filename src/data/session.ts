import type { SessionRule } from './rules';
export type SessionDraft = { title: string; minutes: number; scheduled: boolean; start: number; end: number; startMinute: number; endMinute: number; allDay: boolean; days: number[]; strict: boolean; unlocks: number };
export const initialSession = (scheduled = false): SessionDraft => ({ title: 'Сессия', minutes: 30, scheduled, start: 8, end: 17, startMinute: 0, endMinute: 0, allDay: false, days: [0, 1, 2, 3, 4], strict: false, unlocks: 0 });
export const hourLabel = (hour: number, minute = 0) => `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
export const durationLabel = (total: number) => [Math.floor(total / 1440) ? `${Math.floor(total / 1440)} д` : '', Math.floor(total / 60) % 24 ? `${Math.floor(total / 60) % 24} ч` : '', total % 60 ? `${total % 60} мин` : ''].filter(Boolean).join(' ');
export function sessionRule(draft: SessionDraft): SessionRule {
  return { id: `session-${Date.now()}`, emoji: 'zap', title: draft.title.trim() || 'Сессия', status: draft.scheduled ? { kind: 'upcoming' } : { kind: 'blocking', strict: draft.strict },
    meta: draft.scheduled ? { kind: 'schedule', time: draft.allDay ? 'Весь день' : `${hourLabel(draft.start, draft.startMinute)} – ${hourLabel(draft.end, draft.endMinute)}`, days: draft.days.length === 7 ? 'Каждый день' : draft.days.map(d => ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'][d]).join(', ') } : { kind: 'ring', text: `Осталось ${durationLabel(draft.minutes)}`, progress: 0, tone: 'blocking' },
    apps: 'first-rule', unlock: draft.unlocks ? `(${draft.unlocks}/${draft.unlocks})` : undefined };
}
