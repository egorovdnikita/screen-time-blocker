// Ответ «Сколько часов в день вы проводите в телефоне?» и всё, что из него следует в знакомстве.
// Цифры макета (7 ч → 28 лет, вернуть 14 лет, цель 5 ч) — частный случай ответа «Больше 7 часов».

export const onboardingTimes = ['Больше 7 часов', '5–7 часов', '4–5 часов', '3–4 часа', '1–3 часа', 'Меньше часа'];
const usualHours = [7, 6, 4.5, 3.5, 2, 1];
// Без ответа считаем как в макете.
const hoursFor = (time: number | null) => usualHours[time ?? 0] ?? usualHours[0];

/** «Обычно вы проводите 1–3 часа в день». */
export const usualTimeText = (time: number | null) =>
  `Обычно вы проводите ${time == null ? 'около 7 часов' : onboardingTimes[time].toLocaleLowerCase('ru')} в день`;

/** Начальная цель — около 70 % обычного времени, шаг 20 минут, как у шкалы (20…420). */
export const suggestedGoal = (time: number | null) =>
  Math.max(20, Math.min(420, Math.round((hoursFor(time) * 60 * 0.7) / 20) * 20));

/** Сколько лет жизни уйдёт на телефон при таком темпе: 7 ч в день → 28 лет, как в макете. */
export const phoneYears = (time: number | null) => Math.round(hoursFor(time) * 4);

export function yearsLabel(years: number) {
  const tail = years % 100;
  const last = years % 10;
  if (tail >= 11 && tail <= 14) return `${years} лет`;
  if (last === 1) return `${years} год`;
  if (last >= 2 && last <= 4) return `${years} года`;
  return `${years} лет`;
}
