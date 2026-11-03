import type { Meta, SessionRule, Status } from './rules';

// APP-06: статус сессии считается из расписания и текущего времени, а не хранится строкой.
// Внутри приложения; автоматическое начало защиты без открытого Block требует DeviceActivity (dev-сборка).
export type SessionSchedule =
  | { kind: 'now'; startedAt: number; minutes: number }
  | { kind: 'weekly'; start: number; end: number; days: number[] }; // минуты от полуночи, дни 0 = пн

const DAY = 1440;
const weekday = (date: Date) => (date.getDay() + 6) % 7;
const minuteOfDay = (date: Date) => date.getHours() * 60 + date.getMinutes();
const short = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
const clock = (m: number) => `${Math.floor(m / 60) % 24}:${String(m % 60).padStart(2, '0')}`;

export function remainingLabel(total: number) {
  const m = Math.max(1, Math.ceil(total));
  const h = Math.floor(m / 60), rest = m % 60;
  return [h ? `${h} ч` : '', rest ? `${rest} мин` : ''].filter(Boolean).join(' ');
}

/** Сколько минут осталось до конца активного окна; null — окно сейчас не активно. */
export function weeklyRemaining(s: Extract<SessionSchedule, { kind: 'weekly' }>, now: Date): number | null {
  const t = minuteOfDay(now) + now.getSeconds() / 60, today = weekday(now), yesterday = (today + 6) % 7;
  const allDay = s.start === s.end;
  if (allDay) return s.days.includes(today) ? DAY - t : null;
  if (s.end > s.start) return s.days.includes(today) && t >= s.start && t < s.end ? s.end - t : null;
  // Через полночь: вечер начатого дня или утро следующего.
  if (s.days.includes(today) && t >= s.start) return DAY - t + s.end;
  if (s.days.includes(yesterday) && t < s.end) return s.end - t;
  return null;
}

/** Ближайший запуск: «Сегодня в 9:00», «Завтра в 9:00», «пн в 9:00». */
export function nextStartLabel(s: Extract<SessionSchedule, { kind: 'weekly' }>, now: Date): string | null {
  if (!s.days.length) return null;
  const t = minuteOfDay(now), today = weekday(now);
  for (let offset = 0; offset < 8; offset++) {
    const day = (today + offset) % 7;
    if (!s.days.includes(day) || (offset === 0 && t >= s.start)) continue;
    const at = s.start === s.end ? '' : ` в ${clock(s.start)}`;
    return `${offset === 0 ? 'Сегодня' : offset === 1 ? 'Завтра' : short[day]}${at}`;
  }
  return null;
}

export function liveSession(rule: SessionRule, now: Date): SessionRule {
  const s = rule.schedule;
  if (!s) return rule;
  const strict = rule.strict;
  if (s.kind === 'now') {
    const left = s.startedAt + s.minutes * 60000 - now.getTime();
    if (left <= 0) return { ...rule, status: { kind: 'upcoming', text: 'Завершена' }, meta: { kind: 'ring', text: 'Завершена', progress: 1, tone: 'blocking' }, nextStart: null };
    const meta: Meta = { kind: 'ring', text: `Осталось ${remainingLabel(left / 60000)}`, progress: Math.min(1, 1 - left / (s.minutes * 60000)), tone: 'blocking' };
    return { ...rule, status: { kind: 'blocking', strict }, meta, nextStart: null };
  }
  const left = weeklyRemaining(s, now);
  const status: Status = left !== null ? { kind: 'blocking', strict } : { kind: 'upcoming' };
  return { ...rule, status, remaining: left === null ? null : remainingLabel(left), nextStart: left === null ? nextStartLabel(s, now) : null };
}
