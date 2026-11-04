const DAY = 86400000;
const midnight = (time: number) => new Date(time).setHours(0, 0, 0, 0);

/** Сколько календарных дней пользователь с Block, считая день начала (APP-20). */
export const daysWithBlock = (startedAt: number, now: number) => Math.max(1, Math.round((midnight(now) - midnight(startedAt)) / DAY) + 1);
/** Отчёт появляется на третий день использования. */
export const reportDaysLeft = (days: number) => Math.max(0, 3 - days);
