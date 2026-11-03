import type { NotificationPreferences } from './preferences';
import type { SessionRule } from './rules';

// APP-21: какие локальные уведомления должны быть запланированы сейчас. Чистая функция —
// планировщик (src/state/notifications.tsx) пересоздаёт по ней все уведомления с префиксом block-.
// Напоминания «до цели» и «каждые N мин» зависят от реальных данных экранного времени (APP-08) и сюда не входят.
export const LEAD_MINUTES = 5;

export type PlannedTrigger =
  | { kind: 'daily'; hour: number; minute: number }
  | { kind: 'weekly'; weekday: number; hour: number; minute: number } // weekday: 1 = воскресенье, как в expo-notifications
  | { kind: 'date'; at: number };
export type PlannedNotification = { id: string; title: string; body: string; route: string; trigger: PlannedTrigger };

type Input = {
  notifications: NotificationPreferences;
  sessions: readonly SessionRule[];
  titles: Readonly<Record<string, string>>;
  paused: Readonly<Record<string, unknown>>;
  unlocks: Readonly<Record<string, { until: number }>>;
  unlockNames: Readonly<Record<string, string>>;
  now: number;
};

// Наши дни: 0 = пн … 6 = вс. expo: 1 = вс, 2 = пн … 7 = сб.
const expoWeekday = (day: number) => ((day + 1) % 7) + 1;

/** Точка за lead минут до момента minute дня day, с переносом через полночь. */
export function shifted(day: number, minute: number, lead: number) {
  let m = minute - lead, d = day;
  if (m < 0) { m += 1440; d = (d + 6) % 7; }
  return { weekday: expoWeekday(d), hour: Math.floor(m / 60), minute: m % 60 };
}

export function plannedNotifications(input: Input): PlannedNotification[] {
  const { notifications: prefs, now } = input;
  if (prefs.allOff) return [];
  const out: PlannedNotification[] = [];
  if (prefs.diary) out.push({ id: 'block-diary', title: 'Как прошёл день?', body: 'Отметьте, на что ушло экранное время.', route: '/', trigger: { kind: 'daily', hour: 20, minute: 0 } });
  for (const rule of input.sessions) {
    const s = rule.schedule;
    if (!s || input.paused[rule.id]) continue;
    const title = input.titles[rule.id] ?? rule.title;
    if (s.kind === 'now') {
      const end = s.startedAt + s.minutes * 60000;
      if (prefs.sessionEnd && end - LEAD_MINUTES * 60000 > now) out.push({ id: `block-end-${rule.id}`, title, body: `Сессия закончится через ${LEAD_MINUTES} мин.`, route: '/rules', trigger: { kind: 'date', at: end - LEAD_MINUTES * 60000 } });
      continue;
    }
    const allDay = s.start === s.end;
    for (const day of s.days) {
      if (prefs.sessionStart) out.push({ id: `block-start-${rule.id}-${day}`, title, body: allDay ? `Блокировка на весь день начнётся через ${LEAD_MINUTES} мин.` : `Сессия начнётся через ${LEAD_MINUTES} мин.`, route: '/rules', trigger: { kind: 'weekly', ...shifted(day, s.start, LEAD_MINUTES) } });
      // Конец окна через полночь приходится на следующий день.
      const endDay = !allDay && s.end <= s.start ? (day + 1) % 7 : allDay ? (day + 1) % 7 : day;
      if (prefs.sessionEnd) out.push({ id: `block-end-${rule.id}-${day}`, title, body: `Сессия закончится через ${LEAD_MINUTES} мин.`, route: '/rules', trigger: { kind: 'weekly', ...shifted(endDay, allDay ? 0 : s.end, LEAD_MINUTES) } });
    }
  }
  for (const [id, entry] of Object.entries(input.unlocks)) {
    const name = input.unlockNames[id] ?? 'Приложение';
    if (prefs.unlockWarning && entry.until - 60000 > now) out.push({ id: `block-unlock-warn-${id}`, title: name, body: 'Доступ закончится через 1 мин.', route: '/rules', trigger: { kind: 'date', at: entry.until - 60000 } });
    if (prefs.unlockEnd && entry.until > now) out.push({ id: `block-unlock-end-${id}`, title: name, body: 'Время доступа закончилось.', route: '/rules', trigger: { kind: 'date', at: entry.until } });
  }
  return out;
}
