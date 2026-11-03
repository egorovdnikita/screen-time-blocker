import { art } from './art';
export const screenApps = [
  { id: 'substack', title: 'Substack', image: art.screenSearchApp0, preview: art.blockScreenSubstackPreview },
  { id: 'medium', title: 'Medium', image: art.screenSearchApp1 },
  { id: 'economist', title: 'The Economist', image: art.screenSearchApp2 },
  { id: 'ted', title: 'TED Talks', image: art.screenSearchApp3 },
  { id: 'youtube', title: 'YouTube', image: art.screenSearchApp4 },
  { id: 'deepstash', title: 'Deepstash', image: art.screenSearchApp5 },
  { id: 'bbc', title: 'BBC', image: art.screenSearchApp6 },
  { id: 'ground-news', title: 'Ground News', image: art.screenSearchApp7 },
  { id: 'nerdish', title: 'Nerdish', image: art.screenSearchApp8 },
];
export type ScreenApp = typeof screenApps[number];
export type CustomBlockScreen = { id: string; kind: 'app'; appId: string } | { id: string; kind: 'message'; title: string; subtitle: string; button: string };
export type MessageBlockScreen = Extract<CustomBlockScreen, { kind: 'message' }>;
export const newMessageScreen = (): MessageBlockScreen => ({ id: `screen-message-${Date.now()}`, kind: 'message', title: '', subtitle: '', button: '' });
export const findScreenApp = (id: string) => screenApps.find(app => app.id === id);
// Рекомендации из локального макета, без запроса App Store.
export function searchScreenApps(query: string) {
  const q = query.trim().toLocaleLowerCase();
  return !q ? [] : q === 'substack' ? screenApps : screenApps.filter(app => app.title.toLocaleLowerCase().includes(q));
}
export function resolveScreenText(text: string, context: Record<string, string>) {
  return text.replace(/\{([a-z_]+)\}/g, (original, name: string) => context[name] ?? original);
}
