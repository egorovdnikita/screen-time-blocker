import { art } from './art';

// Каталог макета. Данные системного Screen Time на этом этапе не запрашиваются.
export const groupApps = [
  { id: 'xchat', name: 'XChat', image: art.sessionXchat },
  { id: 'messages', name: 'Сообщения', image: art.sessionMessages },
  { id: 'bereal', name: 'BeReal', image: art.sessionBereal },
] as const;
export const groupCategories = [
  { id: 'social', title: 'Социальные сети', image: art.groupSocial },
  { id: 'games', title: 'Игры', image: art.groupGames },
  { id: 'entertainment', title: 'Развлечения', image: art.groupEntertainment },
  { id: 'creativity', title: 'Творчество', image: art.groupCreativity },
  { id: 'education', title: 'Образование', image: art.groupEducation },
  { id: 'health', title: 'Здоровье и фитнес', image: art.groupHealth },
] as const;
export type AppCategoryId = typeof groupCategories[number]['id'];
export type AppGroupWebsite = { host: string; selected: boolean };
export type AppGroupDraft = {
  mode: 'only' | 'except'; selectedApps: boolean[]; categories: AppCategoryId[];
  adultContent: boolean; purchases: boolean; installation: boolean;
  websites: AppGroupWebsite[];
};
export const initialAppGroup = (): AppGroupDraft => ({ mode: 'only', selectedApps: [true, true, true], categories: [], adultContent: false, purchases: false, installation: false, websites: [] });
export const cloneAppGroup = (group: AppGroupDraft): AppGroupDraft => ({ ...group, selectedApps: [...group.selectedApps], categories: [...group.categories], websites: group.websites.map(site => ({ ...site })) });
export const selectedWebsites = (group: AppGroupDraft) => group.websites.filter(site => site.selected);
export const hasGroupExtras = (group: AppGroupDraft) => !!(group.categories.length || selectedWebsites(group).length || group.adultContent || group.purchases || group.installation || group.mode === 'except');
export const hasGroupSelection = (group: AppGroupDraft) => group.selectedApps.some(Boolean) || hasGroupExtras(group);
export const countLabel = (count: number, one: string, few: string, many: string) => `${count} ${count % 10 === 1 && count % 100 !== 11 ? one : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? few : many}`;
export function groupSummary(group: AppGroupDraft) {
  const apps = group.selectedApps.filter(Boolean).length;
  const websites = selectedWebsites(group).length;
  const parts = [countLabel(apps, 'приложение', 'приложения', 'приложений')];
  if (group.categories.length) parts.push(countLabel(group.categories.length, 'категория', 'категории', 'категорий'));
  if (websites) parts.push(`${countLabel(websites, 'сайт', 'сайта', 'сайтов')} (Safari: 0, все браузеры: ${websites})`);
  if (group.adultContent) parts.push('Контент 18+');
  if (group.purchases) parts.push('Покупки');
  if (group.installation) parts.push('Установка');
  return `${group.mode === 'except' ? 'Все приложения, кроме:' : 'Блокируется:'} ${parts.join(' · ')}`;
}
// Сохраняется домен: протокол, путь, www и регистр не создают дубликатов.
export function websiteHost(input: string): string | null {
  const source = input.trim();
  if (!source || /\s/.test(source)) return null;
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(source) ? source : `https://${source}`);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
    if (host.length > 253 || !/^(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z\d](?:[a-z\d-]{0,61}[a-z\d])$/i.test(host)) return null;
    return host;
  } catch { return null; }
}
