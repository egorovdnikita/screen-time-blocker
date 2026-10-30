// Данные Главной из макетов. Значения графиков сняты с HTML-исходников
// (доля высоты графика 0–1 по часам 0–23).

export type BarTone = 'now' | 'q' | 'productive' | 'neutral';

export type ChartData = {
  axis: [string, string, string];
  /** Часы с фоновой «дорожкой»: прошедшие (past) или ещё впереди (future). */
  tracks: { hours: number[]; tone: 'past' | 'future' };
  /** Часы, подсвеченные зелёным — там записана активность. */
  highlights?: number[];
  bars: { h: number; v: number; tone: BarTone }[];
  bubbles?: { h: number; kind: 'app' | 'leaf' }[];
};

export type Quality = {
  word: string;
  pct: [good: number, neutral: number, bad: number];
  stats: { screenTime: string; pickups: string; notifications: string };
  chart: ChartData;
};

export type AppIconKind = 'block' | 'photos' | 'phia' | 'substack' | 'other';

export type AppRow = {
  id: string;
  name: string;
  time: string;
  /** Длина полосы относительно самого долгого. */
  ratio: number;
  icon: AppIconKind;
  /** ask — чип «Время с пользой?», productive — «С пользой», excluded — исключено из экранного времени. */
  state: 'ask' | 'productive' | 'excluded';
  others?: 'apps-other' | 'apps-other-2';
  othersCount?: number;
};

export type ActivityIcon = 'work' | 'inspiration' | 'procrastinate';
export type ActivityAppIcon = 'block' | 'flight' | 'photos' | 'store';

export type ActivityRow = {
  id: string;
  name: string;
  time: string;
  ratio: number;
  icon: ActivityIcon;
  quality: 'productive' | 'distracting';
  apps: ActivityAppIcon[];
};

export type Day = {
  id: string;
  label: string;
  screenTime: string;
  goal: { kind: 'target' | 'check'; text: string };
  stats: { saved: string; pickups: string; notifications: string };
  chart: ChartData;
  quality: Quality;
  apps: AppRow[];
  activities: ActivityRow[];
};

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const ALL_DAY = range(0, 23);

const qualityNeutral: Quality = {
  word: 'Нейтрально',
  pct: [0, 100, 0],
  stats: { screenTime: '20 мин', pickups: '5', notifications: '9' },
  chart: {
    axis: ['20мин', '10мин', '0с'],
    tracks: { hours: range(14, 23), tone: 'future' },
    bars: [
      { h: 14, v: 0.615, tone: 'q' },
      { h: 20, v: 0.135, tone: 'q' },
      { h: 23, v: 0.277, tone: 'q' },
    ],
  },
};

const qualityProductive: Quality = {
  word: 'Продуктивно',
  pct: [90, 5, 5],
  stats: { screenTime: '2ч18', pickups: '40', notifications: '24' },
  chart: {
    axis: ['30мин', '15мин', '0с'],
    tracks: { hours: ALL_DAY, tone: 'past' },
    bars: [
      { h: 0, v: 0.107, tone: 'productive' },
      { h: 9, v: 0.544, tone: 'productive' },
      { h: 10, v: 0.099, tone: 'productive' },
      { h: 10, v: 0.008, tone: 'neutral' },
      { h: 12, v: 0.048, tone: 'productive' },
      { h: 13, v: 0.223, tone: 'productive' },
      { h: 14, v: 0.012, tone: 'productive' },
      { h: 15, v: 0.095, tone: 'neutral' },
      { h: 17, v: 0.139, tone: 'neutral' },
      { h: 18, v: 0.167, tone: 'productive' },
      { h: 19, v: 0.048, tone: 'productive' },
      { h: 20, v: 0.655, tone: 'productive' },
      { h: 21, v: 0.024, tone: 'productive' },
      { h: 22, v: 0.583, tone: 'productive' },
    ],
  },
};

const appsRegular: AppRow[] = [
  { id: 'block', name: 'Block', time: '35 мин', ratio: 1, icon: 'block', state: 'ask' },
  { id: 'photos', name: 'Фото', time: '7 мин', ratio: 0.2, icon: 'photos', state: 'ask' },
  { id: 'phia', name: 'Phia', time: '1 мин', ratio: 0.03, icon: 'phia', state: 'ask' },
  { id: 'other', name: 'Другое', time: '1 мин', ratio: 0, icon: 'other', state: 'ask', others: 'apps-other', othersCount: 1 },
];

const activities: ActivityRow[] = [
  { id: 'work', name: 'Работа', time: '1ч40', ratio: 1, icon: 'work', quality: 'productive', apps: ['block', 'flight'] },
  { id: 'inspiration', name: 'Поиск вдохновения', time: '24 мин', ratio: 0.245, icon: 'inspiration', quality: 'productive', apps: ['photos'] },
  { id: 'procrastinate', name: 'Прокрастинация', time: '7 мин', ratio: 0.074, icon: 'procrastinate', quality: 'distracting', apps: ['store'] },
];

// 24-home__01-home
export const dayToday: Day = {
  id: 'today',
  label: 'Сегодня',
  screenTime: '12 мин',
  goal: { kind: 'target', text: 'Не больше 4ч20' },
  stats: { saved: '6ч48', pickups: '4', notifications: '5' },
  chart: {
    axis: ['1ч', '30мин', '0с'],
    tracks: { hours: range(15, 20), tone: 'future' },
    bars: [{ h: 14, v: 0.208, tone: 'now' }],
    bubbles: [{ h: 14, kind: 'app' }],
  },
  quality: qualityNeutral,
  apps: appsRegular,
  activities: [],
};

// 31-refreshing-a-screen-time-home__02-home-13min — после «Обновить»
export const dayTodayRefreshed: Day = {
  ...dayToday,
  id: 'today-refreshed',
  screenTime: '13 мин',
  goal: { kind: 'target', text: 'Не больше 4ч25' },
  stats: { saved: '6ч47', pickups: '5', notifications: '1' },
  chart: {
    axis: ['1ч', '30мин', '0с'],
    tracks: { hours: [0, 1, 2], tone: 'past' },
    bars: [
      { h: 0, v: 0.056, tone: 'now' },
      { h: 2, v: 0.175, tone: 'now' },
    ],
    bubbles: [{ h: 2, kind: 'app' }],
  },
};

// 81-logging-in__09-home-8min — первый день после входа
export const dayFirst: Day = {
  ...dayToday,
  id: 'first',
  screenTime: '8 мин',
  goal: { kind: 'target', text: 'Не больше 4ч20' },
  stats: { saved: '6ч52', pickups: '1', notifications: '0' },
  chart: {
    axis: ['1ч', '30мин', '0с'],
    tracks: { hours: [0], tone: 'past' },
    bars: [{ h: 0, v: 0.143, tone: 'now' }],
  },
  apps: [{ id: 'block', name: 'Block', time: '20с', ratio: 1, icon: 'block', state: 'ask' }],
};

// 30-changing-period__02-home-yesterday
export const dayYesterday: Day = {
  id: 'yesterday',
  label: 'Вчера',
  screenTime: '23 мин',
  goal: { kind: 'check', text: 'В пределах 4ч25' },
  stats: { saved: '6ч37', pickups: '6', notifications: '5' },
  chart: {
    axis: ['1ч', '30мин', '0с'],
    tracks: { hours: ALL_DAY, tone: 'past' },
    highlights: range(8, 14),
    bars: [
      { h: 0, v: 0.027, tone: 'now' },
      { h: 11, v: 0.012, tone: 'now' },
      { h: 15, v: 0.063, tone: 'now' },
      { h: 16, v: 0.027, tone: 'now' },
      { h: 17, v: 0.027, tone: 'now' },
      { h: 18, v: 0.06, tone: 'now' },
      { h: 21, v: 0.027, tone: 'now' },
      { h: 22, v: 0.131, tone: 'now' },
    ],
    bubbles: [{ h: 11, kind: 'leaf' }],
  },
  quality: qualityNeutral,
  apps: [
    { id: 'photos', name: 'Фото', time: '7 мин', ratio: 1, icon: 'photos', state: 'ask' },
    { id: 'block', name: 'Block', time: '5 мин', ratio: 0.7, icon: 'block', state: 'ask' },
    { id: 'phia', name: 'Phia', time: '1 мин', ratio: 0.14, icon: 'phia', state: 'ask' },
  ],
  activities: [],
};

// 24-june: в макете только пункт меню — показываем те же данные, что и «Вчера».
export const dayJune24: Day = { ...dayYesterday, id: 'june-24', label: '24 июня' };

// 26-switching-to-activities / 27-logging-a-session-reflection — активный день с отмеченными активностями
export const dayActive: Day = {
  id: 'active',
  label: 'Сегодня',
  screenTime: '2ч18',
  goal: { kind: 'target', text: 'Не больше 4ч20' },
  stats: { saved: '6ч16', pickups: '11', notifications: '4' },
  chart: {
    axis: ['1ч', '30мин', '0с'],
    tracks: { hours: ALL_DAY, tone: 'past' },
    highlights: [8, 9, 10],
    bars: [
      { h: 0, v: 0.155, tone: 'now' },
      { h: 11, v: 0.127, tone: 'now' },
      { h: 14, v: 0.087, tone: 'now' },
      { h: 15, v: 0.063, tone: 'now' },
      { h: 16, v: 0.175, tone: 'now' },
      { h: 17, v: 0.143, tone: 'now' },
    ],
    bubbles: [
      { h: 9, kind: 'leaf' },
      { h: 16, kind: 'app' },
    ],
  },
  quality: qualityProductive,
  apps: [
    { id: 'block', name: 'Block', time: '1ч09', ratio: 1, icon: 'block', state: 'productive' },
    { id: 'photos', name: 'Фото', time: '15 мин', ratio: 0.22, icon: 'photos', state: 'ask' },
    { id: 'substack', name: 'Substack', time: '4 мин', ratio: 0.06, icon: 'substack', state: 'ask' },
    { id: 'phia', name: 'Phia', time: '1 мин', ratio: 0.02, icon: 'phia', state: 'ask' },
    { id: 'other', name: 'Другое', time: '37с', ratio: 0, icon: 'other', state: 'ask', others: 'apps-other-2' },
  ],
  activities,
};

// Подсказки по тапу на график (25-information)
export const insights = {
  glued: {
    title: '12 минут подряд\nу экрана…',
    hint: 'Как часто вас отвлекали? Почему тянет проверить телефон? Это действительно важно?',
  },
  offline: {
    title: '8 часов вне сети',
    hint: 'Что вы успели за это время? Как вы себя чувствуете?',
  },
};

export const periodOptions = [
  { id: 'today', label: 'Сегодня' },
  { id: 'yesterday', label: 'Вчера' },
  { id: 'june-24', label: 'Среда, 24 июня' },
] as const;
