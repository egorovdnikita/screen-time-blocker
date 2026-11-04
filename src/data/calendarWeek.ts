const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const WEEKDAYS = ['В', 'П', 'В', 'С', 'Ч', 'П', 'С'];

/** Неделя календаря «Истории»: сегодня на пятом месте, как в макете, дальше — будущие дни. */
export function calendarWeek(now: number) {
  const today = new Date(now);
  return {
    year: String(today.getFullYear()),
    month: MONTHS[today.getMonth()],
    days: Array.from({ length: 7 }, (_, i) => { const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4 + i); return { letter: WEEKDAYS[date.getDay()], number: date.getDate() }; }),
  };
}
// Неделя макета 182–185 для демо-сценариев.
export const designWeek = { year: '2026', month: 'Июн', days: ['В', 'П', 'В', 'С', 'Ч', 'П', 'С'].map((letter, i) => ({ letter, number: 21 + i })) };
