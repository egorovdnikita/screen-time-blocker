import type { RulesVariant } from '@/state/app';

// Варианты экрана «Правила» из макетов (03-creating-an-account, 17/19/20-creating-a-rule, 37-rules).

export type Status =
  | { kind: 'upcoming'; text?: string }
  | { kind: 'ongoing' }
  | { kind: 'blocking'; strict?: boolean };

export type Meta =
  | { kind: 'schedule'; time: string; days?: string }
  | { kind: 'ring'; text: string; progress: number; tone: 'accent' | 'blocking' };

export type LockRule = { id: string; app: 'apple-music' | 'bereal'; name: string; unlocks: string };

export type SessionRule = {
  id: string;
  emoji: 'laptop' | 'briefcase' | 'zap';
  title: string;
  status: Status;
  meta: Meta;
  apps: 'session' | 'first-rule';
  unlock?: string;
};

export type LimitRule = {
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

export type RoutineRule = { id: string; title: string };

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
