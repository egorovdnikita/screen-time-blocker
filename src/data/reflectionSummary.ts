import type { ActivityRow, Day } from './home';
import { reflectionActivities, reflectionKey, reflectionMoods, type Reflection, type ActivityDefinition } from './reflection';

// В исходных данных есть только длительность приложения, без распределения по часам.
// Поэтому сводка использует известные длительности и не выдумывает новые столбики.
export function usageSeconds(value: string): number {
  const hours = value.match(/(\d+)\s*ч/);
  const minutes = value.match(/(\d+)\s*мин/) ?? value.match(/ч\s*(\d+)/);
  const seconds = value.match(/(\d+)\s*с/);
  return Number(hours?.[1] ?? 0) * 3600 + Number(minutes?.[1] ?? 0) * 60 + Number(seconds?.[1] ?? 0);
}
export function usageLabel(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  if (total < 60) return `${total}с`;
  const minutes = Math.floor(total / 60);
  return minutes < 60 ? `${minutes} мин` : `${Math.floor(minutes / 60)}ч${String(minutes % 60).padStart(2, '0')}`;
}
function percentages(values: number[]): [number, number, number] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (!total) return [0, 0, 0];
  const exact = values.map(value => value * 100 / total);
  const result = exact.map(Math.floor);
  const order = exact.map((value, i) => ({ i, remainder: value - result[i] })).sort((a, b) => b.remainder - a.remainder);
  const remaining = 100 - result.reduce((a, b) => a + b, 0);
  for (let i = 0; i < remaining; i++) result[order[i].i]++;
  return result as [number, number, number];
}
export function reflectedDay(day: Day, records: Record<string, Reflection>, excluded: string[], legacyExcluded: string[], touched: boolean, catalog: ActivityDefinition[] = [...reflectionActivities]): Day {
  if (!touched) return day;
  const groups = new Map<string, { row: ActivityRow; seconds: number }>();
  let good = 0, bad = 0, includedSeconds = 0, excludedSeconds = 0;
  for (const app of day.apps) {
    const seconds = usageSeconds(app.time);
    if (legacyExcluded.includes(app.id) || excluded.includes(reflectionKey(day.id, app.id))) { excludedSeconds += seconds; continue; }
    includedSeconds += seconds;
    const reflection = records[reflectionKey(day.id, app.id)];
    if (!reflection) continue;
    const quality = reflectionMoods.find(mood => mood.id === reflection.mood)!.quality;
    if (quality === 'productive') good += seconds;
    if (quality === 'distracting') bad += seconds;
    const activity = catalog.find(activity => activity.id === reflection.activity);
    if (!activity) continue;
    // Разные оценки одного занятия не теряются при объединении приложений.
    const id = `${activity.id}:${quality}`;
    const group: { row: ActivityRow; seconds: number } = groups.get(id) ?? { row: { id, name: activity.title, time: '', ratio: 0, icon: 'work', image: activity.image, emoji: activity.image ? undefined : '🧘', quality, apps: [] }, seconds: 0 };
    group.seconds += seconds;
    if (!group.row.apps.includes(app.icon)) group.row.apps.push(app.icon);
    groups.set(id, group);
  }
  // У макетов разные демонстрационные счётчики. Знаменатель не может быть меньше
  // суммы показанных приложений; неизвестный остаток относится к нейтральному времени.
  const total = Math.max(includedSeconds, usageSeconds(day.screenTime) - excludedSeconds, 0);
  const pct = percentages([good, Math.max(0, total - good - bad), bad]);
  const values = [...groups.values()].sort((a, b) => b.seconds - a.seconds);
  const largest = Math.max(1, ...values.map(group => group.seconds));
  const activities = values.map(({ row, seconds }) => ({ ...row, time: usageLabel(seconds), ratio: seconds / largest }));
  return { ...day, activities, quality: { ...day.quality, word: !total || pct[1] >= Math.max(pct[0], pct[2]) ? 'Нейтрально' : pct[0] >= pct[2] ? 'Продуктивно' : 'Отвлекает', pct, stats: { ...day.quality.stats, screenTime: usageLabel(total) } } };
}
