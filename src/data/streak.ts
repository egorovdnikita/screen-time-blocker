// Серия считается по настоящим выполненным дням. Ключ дня — localDay: «год-месяц-день».
export type CompletedDays = Record<string, string[]>;

const dayNumber = (key: string) => { const [year, month, day] = key.split('-').map(Number); return Math.round(Date.UTC(year, month - 1, day) / 86400000); };

export const withDay = (days: string[] | undefined, day: string) => days?.includes(day) ? days : [...days ?? [], day];

/** Подряд идущие дни, заканчивая сегодня; пока сегодня не выполнено, серия вчера ещё жива. */
export function currentStreak(days: string[] | undefined, today: string) {
  const done = new Set((days ?? []).map(dayNumber));
  let cursor = dayNumber(today);
  if (!done.has(cursor)) cursor -= 1;
  let length = 0;
  while (done.has(cursor)) { length += 1; cursor -= 1; }
  return length;
}

export function bestStreak(all: CompletedDays) {
  let best = 0;
  for (const days of Object.values(all)) {
    const sorted = [...new Set(days.map(dayNumber))].sort((a, b) => a - b);
    let run = 0;
    sorted.forEach((value, index) => { run = index && value === sorted[index - 1] + 1 ? run + 1 : 1; best = Math.max(best, run); });
  }
  return best;
}
