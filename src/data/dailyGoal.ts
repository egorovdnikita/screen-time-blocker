export const goalWeekdays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
export const goalTimeLabel = (minutes: number) => minutes % 60 ? `${Math.floor(minutes / 60)}ч${String(minutes % 60).padStart(2, '0')}` : `${Math.floor(minutes / 60)}ч`;
export const boundedGoal = (minutes: number) => Math.max(5, Math.min(1440, Math.round(minutes / 5) * 5));
export const currentGoalDay = (period: string) => period === 'june-24' ? 2 : (new Date().getDay() + 6 + (period === 'yesterday' ? -1 : 0) + 7) % 7;
