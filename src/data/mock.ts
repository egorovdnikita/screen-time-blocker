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

export type MostUsedApp = {
  id: string;
  name: string;
  minutes: number;
  icon: 'block' | 'photos' | 'phia' | 'other';
};

export const mostUsed: MostUsedApp[] = [
  { id: 'block', name: 'Block', minutes: 35, icon: 'block' },
  { id: 'photos', name: 'Фото', minutes: 7, icon: 'photos' },
  { id: 'phia', name: 'Phia', minutes: 1, icon: 'phia' },
  { id: 'other', name: 'Другое', minutes: 1, icon: 'other' },
];

export const profile = {
  name: 'Саша',
  initials: 'СА',
  nowMinutes: '33 мин',
  nowCaption: 'За 5 дней',
  before: '7 ч',
  beforeCaption: 'Среднее в день',
  lifeBack: 'Вернёте 25 лет жизни.',
  daysWithBlock: '3 дня',
  bestStreak: '1',
};
