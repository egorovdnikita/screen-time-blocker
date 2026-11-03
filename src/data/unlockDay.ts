// APP-07: разблокировки блокировки считаются за календарный день и сбрасываются в полночь.
export type AppUnlockEntry = { until: number; used: number; reason: string; day?: string };
export const localDay = (time: number) => { const d = new Date(time); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
export const unlocksUsedToday = (entry: AppUnlockEntry | undefined, now: number) => entry && (entry.day ?? localDay(entry.until)) === localDay(now) ? entry.used : 0;
