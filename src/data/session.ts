import { initialAppGroup, cloneAppGroup, type AppGroupDraft } from './appGroup';
import type { SessionIconId } from './sessionIcons';
import type { SessionRule } from './rules';
export const copyTextIdeas = [
  'Это приложение похоже на конфеты: сладкое, яркое — легко увлечься. Но если провести в нём слишком много времени, у меня не останется сил, а внутри будет странная пустота.',
  'Да, я мог бы использовать это время лучше. Я знаю, что мог бы заняться чем-то более полезным прямо сейчас. Но я выбираю провести это время в приложении и принимаю это.',
] as const;
export const copyPreviewQuote = 'Да, я мог бы использовать это время лучше и заняться чем-то полезным прямо сейчас. Но я выбираю провести время в этом приложении и принимаю это.';
export type UnlockMethod = 'none' | 'wait' | 'reason' | 'text' | 'scan';
export type UnlockSettings = { unlockMethod: UnlockMethod; waitAutomatic: boolean; waitSeconds: number; copyText: string; scanType: 'qr' | 'nfc' };
export const unlockMethodLabel: Record<UnlockMethod, string> = { none: 'Ничего', wait: 'Пауза', reason: 'Указать причину', text: 'Перепечатать…', scan: 'Сканировать' };
export type StrictSettings = { strictScope: 'session' | 'days'; strictDays: number };
export type SessionDraft = StrictSettings & UnlockSettings & { title: string; appGroup: AppGroupDraft; iconId: SessionIconId; minutes: number; scheduled: boolean; start: number; end: number; startMinute: number; endMinute: number; allDay: boolean; days: number[]; strict: boolean; unlocks: number; unlockMinutes: number };
export const initialSession = (scheduled = false): SessionDraft => ({ title: 'Сессия', appGroup: initialAppGroup(), iconId: 'zap', strictScope: 'session', strictDays: 1, unlockMethod: 'wait', waitAutomatic: true, waitSeconds: 30, copyText: copyTextIdeas[0], scanType: 'qr', minutes: 30, scheduled, start: 8, end: 17, startMinute: 0, endMinute: 0, allDay: false, days: [0, 1, 2, 3, 4], strict: false, unlocks: 0, unlockMinutes: 15 });
export const hourLabel = (hour: number, minute = 0) => `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
export const durationLabel = (total: number) => [Math.floor(total / 1440) ? `${Math.floor(total / 1440)} д` : '', Math.floor(total / 60) % 24 ? `${Math.floor(total / 60) % 24} ч` : '', total % 60 ? `${total % 60} мин` : ''].filter(Boolean).join(' ');
export function sessionRule(draft: SessionDraft): SessionRule {
  return { strict: draft.strict, appGroup: cloneAppGroup(draft.appGroup), selectedApps: [...draft.appGroup.selectedApps], strictSettings: { strictScope: draft.strictScope, strictDays: draft.strictDays }, unlockSettings: { unlockMethod: draft.unlockMethod, waitAutomatic: draft.waitAutomatic, waitSeconds: draft.waitSeconds, copyText: draft.copyText, scanType: draft.scanType }, iconId: draft.iconId, unlockMinutes: draft.unlockMinutes, id: `session-${Date.now()}`, emoji: 'zap', title: draft.title.trim() || 'Сессия', status: draft.scheduled ? { kind: 'upcoming' } : { kind: 'blocking', strict: draft.strict },
    meta: draft.scheduled ? { kind: 'schedule', time: draft.allDay ? 'Весь день' : `${hourLabel(draft.start, draft.startMinute)} – ${hourLabel(draft.end, draft.endMinute)}`, days: draft.days.length === 7 ? 'Каждый день' : draft.days.map(d => ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'][d]).join(', ') } : { kind: 'ring', text: `Осталось ${durationLabel(draft.minutes)}`, progress: 0, tone: 'blocking' },
    apps: 'first-rule', unlock: draft.unlocks ? `(${draft.unlocks}/${draft.unlocks})` : undefined,
    schedule: draft.scheduled
      ? { kind: 'weekly', start: draft.allDay ? 0 : draft.start * 60 + draft.startMinute, end: draft.allDay ? 0 : draft.end * 60 + draft.endMinute, days: [...draft.days] }
      : { kind: 'now', startedAt: Date.now(), minutes: draft.minutes } };
}
