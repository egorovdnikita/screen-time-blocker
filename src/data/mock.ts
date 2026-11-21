// Данные экранов из макета. Заменятся реальными, когда появится интеграция с Screen Time / UsageStats.

export const today = {
  screenTime: '12 мин',
  goal: 'Не больше 4ч20',
  saved: '6ч48',
  pickups: 4,
  notifications: 5,
  currentHour: 14,
  // Минуты экранного времени по часам (0–23).
  hourly: Array.from({ length: 24 }, (_, h) => (h === 14 ? 12.5 : 0)),
  // Часы, которые ещё впереди и показываются светлыми столбиками.
  upcomingHours: [15, 16, 17, 18, 19, 20],
};

export const profile = {
  name: 'Саша',
  initials: 'СА',
  nowMinutes: '9 мин',
  nowCaption: 'За 5 дней',
  before: '7 ч',
  beforeCaption: 'Ср. за день',
  lifeBack: 'Вернули 25 лет жизни.',
  daysWithBlock: '3 дня',
  bestStreak: '1',
};
