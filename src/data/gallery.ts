import { art } from './art';
import { initialSession } from './session';
export const gallerySections = [
  { title: 'Сосредоточиться', image: art.galleryTarget, cards: [
    { id: 'work', title: 'Рабочие часы', description: 'Никаких пингов.\nБлокировка приложений\nв рабочее время.', badge: '9:00–17:00', image: art.galleryWork, kind: 'session' },
    { id: 'focus', title: 'Утренний фокус', description: '2 часа без отвлечений\nдля важных дел\nс самого утра.', badge: '10:00–12:00', image: art.galleryFocus, kind: 'session' },
  ] },
  { title: 'Больше ограничений', image: art.galleryBrick, cards: [
    { id: 'intention', title: 'Вход с\nнамерением', description: 'Подумайте, прежде чем\nоткрыть приложение.', badge: 'День', image: art.galleryIntention, kind: 'session' },
    { id: 'limit', title: 'Лимит времени', description: 'Ограничьте приложения\nодним часом в день.', badge: '1ч макс.', image: art.galleryLimit, kind: 'limit' },
  ] },
  { title: 'Сон, отдых, отключение', image: art.gallerySleep, cards: [
    { id: 'wind', title: 'Вечерний отдых', description: 'Спите спокойно. Блок\nприложений на ночь.', badge: '22:00–6:00', image: art.galleryWind, kind: 'session' },
    { id: 'morning', title: 'Утро для себя', description: 'Без телефона до 9:00.\nНачните день спокойно.', badge: '6:00–9:00', image: art.galleryMorning, kind: 'session' },
  ] },
] as const;
export function gallerySession(preset?: string) {
  const draft = initialSession(true);
  const card = gallerySections.flatMap(s => [...s.cards]).find(c => c.id === preset && c.kind === 'session');
  if (!card) return null;
  draft.title = card.title.replace('\n', ' ');
  if (preset === 'work') { draft.start = 9; draft.end = 17; }
  if (preset === 'focus') { draft.start = 10; draft.end = 12; }
  if (preset === 'wind') { draft.start = 22; draft.end = 6; draft.days = [0, 1, 2, 3, 4, 5, 6]; }
  if (preset === 'morning') { draft.start = 6; draft.end = 9; draft.days = [0, 1, 2, 3, 4, 5, 6]; }
  if (preset === 'intention') { draft.allDay = true; draft.days = [0, 1, 2, 3, 4, 5, 6]; draft.unlocks = 3; draft.unlockMethod = 'reason'; }
  return draft;
}
