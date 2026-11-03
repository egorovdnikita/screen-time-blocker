import type { RoutineDraft } from './routine';
import type { TimeLimitDraft } from './timeLimit';
import type { AppGroupDraft } from './appGroup';
import type { StrictSettings, UnlockSettings } from './session';
import type { SessionIconId } from './sessionIcons';
import type { RulesVariant } from '@/state/app';

// Варианты экрана «Правила» из макетов (03-creating-an-account, 17/19/20-creating-a-rule, 37-rules).

export type Status =
  | { kind: 'paused' }
  | { kind: 'upcoming'; text?: string }
  | { kind: 'ongoing' }
  | { kind: 'blocking'; strict?: boolean };

export type Meta =
  | { kind: 'schedule'; time: string; days?: string }
  | { kind: 'ring'; text: string; progress: number; tone: 'accent' | 'blocking' };

export type LockRule = { id: string; app: string; name: string; unlocks: string; count?: number; minutes?: number; strict?: boolean; strictSettings?: StrictSettings; unlockSettings?: UnlockSettings };

export type RuleDetailChanges = { title: string; strict: boolean; strictSettings: StrictSettings };
export type SessionRule = {
  appIds?: string[];
  strict?: boolean;
  selectedApps?: boolean[];
  appGroup?: AppGroupDraft;
  unlockMinutes?: number;
  iconId?: SessionIconId;
  unlockSettings?: UnlockSettings;
  strictSettings?: StrictSettings;
  id: string;
  emoji: 'laptop' | 'briefcase' | 'zap';
  title: string;
  status: Status;
  meta: Meta;
  apps: 'session' | 'first-rule';
  unlock?: string;
};

export type LimitRule = {
  appCount?: number;
  configuration?: TimeLimitDraft;
  id: string;
  emoji: 'hourglass' | 'limit-hourglass';
  title: string;
  status: Status;
  meta: Meta;
  linkedApps?: boolean;
  value: string;
  /** null — без полосы прогресса. */
  progress: number | null;
};

export type RoutineRule = { id: string; title: string; configuration?: RoutineDraft };

export type Templates = 'classic' | 'gallery';

export type RulesData = {
  active: number;
  locks: LockRule[];
  sessions: SessionRule[];
  limits: LimitRule[];
  routines: RoutineRule[];
  templates: Templates;
};

const workHours: SessionRule = {
  id: 'work',
  emoji: 'laptop',
  title: 'Рабочие часы',
  status: { kind: 'upcoming' },
  meta: { kind: 'schedule', time: '9:00 – 17:00', days: 'По будням' },
  apps: 'session',
};

const limitAllDay: LimitRule = {
  id: 'limit',
  emoji: 'hourglass',
  title: 'Лимит времени',
  status: { kind: 'ongoing' },
  meta: { kind: 'ring', text: 'Весь день', progress: 0.06, tone: 'accent' },
  value: '0с / 2ч15',
  progress: 0,
};

const routine: RoutineRule = { id: 'routine', title: 'Рутина' };

export const rulesVariants: Record<RulesVariant, RulesData> = {
  onboarding: { active:0,locks:[],sessions:[],limits:[],routines:[],templates:'classic' },
  strict: { active: 3, locks: [{ id: 'music', app: 'apple-music', name: 'Apple Music', unlocks: '(3/3)', strict: true, strictSettings: { strictScope: 'session', strictDays: 1 } }], sessions: [workHours], limits: [limitAllDay], routines: [routine], templates: 'classic' },
  reason: { active: 3, locks: [{ id: 'music', app: 'apple-music', name: 'Apple Music', unlocks: '(3/3)', unlockSettings: { unlockMethod: 'reason', waitAutomatic: true, waitSeconds: 3, copyText: '', scanType: 'qr' } }], sessions: [workHours], limits: [limitAllDay], routines: [routine], templates: 'classic' },
  // 37-rules__01
  full: {
    active: 3,
    locks: [{ id: 'music', app: 'apple-music', name: 'Apple Music', unlocks: '(3/3)' }],
    sessions: [workHours],
    limits: [limitAllDay],
    routines: [routine],
    templates: 'classic',
  },
  // 03-creating-an-account__08
  first: {
    active: 1,
    locks: [],
    sessions: [
      {
        id: 'work',
        emoji: 'briefcase',
        title: 'Рабочие часы',
        status: { kind: 'blocking' },
        meta: { kind: 'ring', text: '9:00 – 17:00', progress: 0.75, tone: 'blocking' },
        apps: 'first-rule',
        unlock: '(3/3)',
      },
    ],
    limits: [],
    routines: [],
    templates: 'gallery',
  },
  // 17-creating-a-rule-session__05
  sessions: {
    active: 0,
    locks: [],
    sessions: [
      {
        id: 'session',
        emoji: 'zap',
        title: 'Сессия',
        status: { kind: 'upcoming', text: 'Предстоит…' },
        meta: { kind: 'schedule', time: '24.06, 23:11 – 24.06, 23:41' },
        apps: 'session',
      },
      workHours,
    ],
    limits: [],
    routines: [],
    templates: 'gallery',
  },
  // 19-creating-a-rule-locks__12
  locks: {
    active: 2,
    locks: [{ id: 'bereal', app: 'bereal', name: 'BeReal', unlocks: '(3/3)' }],
    sessions: [
      {
        id: 'session',
        emoji: 'zap',
        title: 'Сессия',
        status: { kind: 'blocking', strict: true },
        meta: { kind: 'ring', text: 'Осталось 28 мин', progress: 0.07, tone: 'accent' },
        apps: 'session',
      },
      workHours,
    ],
    limits: [],
    routines: [],
    templates: 'gallery',
  },
  // 20-creating-a-rule-limits__17
  limits: {
    active: 1,
    locks: [],
    sessions: [workHours],
    limits: [
      {
        id: 'limit',
        emoji: 'limit-hourglass',
        title: 'Лимит времени',
        status: { kind: 'upcoming' },
        meta: { kind: 'schedule', time: 'Весь день', days: 'пн, ср, пт, вс' },
        value: '2ч15',
        progress: null,
      },
    ],
    routines: [],
    templates: 'gallery',
  },
  // 37-rules__03
  limitProgress: {
    active: 3,
    locks: [{ id: 'music', app: 'apple-music', name: 'Apple Music', unlocks: '(3/3)' }],
    sessions: [workHours],
    limits: [{ ...limitAllDay, linkedApps: true, value: '10 мин / 2ч15', progress: 0.074 }],
    routines: [routine],
    templates: 'classic',
  },
};

export const activeLabel = (n: number) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} активное`;
  return `${n} активных`;
};

// Один счётчик для заголовка Правил и таббара, включая приостановленные сессии.
export function activeRuleCount(base: RulesData, state: { createdRoutines: readonly RoutineRule[]; createdLimits: readonly LimitRule[]; createdLocks: readonly LockRule[]; createdSessions: readonly SessionRule[]; pausedSessions: Readonly<Record<string, 'next' | 'manual'>>; deletedRuleIds?: readonly string[] }) {
  const deleted = new Set(state.deletedRuleIds);
  const removedBase = [...base.locks, ...base.limits, ...base.routines].filter(x => deleted.has(x.id)).length + base.sessions.filter(x => x.status.kind === 'blocking' && deleted.has(x.id)).length;
  const pausedBase = base.sessions.filter(rule => !deleted.has(rule.id) && rule.status.kind === 'blocking' && state.pausedSessions[rule.id]).length;
  const activeSessions = state.createdSessions.filter(rule => !deleted.has(rule.id) && rule.status.kind === 'blocking' && !state.pausedSessions[rule.id]).length;
  return Math.max(0, base.active - pausedBase - removedBase) + [...state.createdRoutines, ...state.createdLimits, ...state.createdLocks].filter(x => !deleted.has(x.id)).length + activeSessions;
}

// Одна презентационная база для заголовка и таббара демо207; реальные правила не меняются.
export function rulesForPresentation(variant: RulesVariant, earned = false): RulesData {
  if (!earned) return rulesVariants[variant];
  const base = rulesVariants.limitProgress;
  return {...base, active: 2, locks: [], sessions: [], limits: base.limits.map(rule => ({...rule, value: '2ч15', status: {kind: 'upcoming'}, meta: {kind: 'schedule', time: 'Весь день', days: 'пн, ср, пт, вс'}, progress: null, linkedApps: false}))};
}
