import { art } from './art';
import type { LockRule } from './rules';
import { initialSession, type StrictSettings, type UnlockSettings } from './session';

export const lockApps = [
  { id: 'bereal', name: 'BeReal', image: art.lockAppBereal },
  { id: 'facetime', name: 'FaceTime', image: art.lockAppFacetime },
  { id: 'messages', name: 'Сообщения', image: art.lockAppMessages },
  { id: 'xchat', name: 'XChat', image: art.lockAppXchat },
  { id: 'instagram', name: 'Instagram', image: art.lockAppInstagram },
  { id: 'tiktok', name: 'TikTok', image: art.lockAppTiktok },
  { id: 'youtube', name: 'YouTube', image: art.lockAppYoutube },
  { id: 'facebook', name: 'Facebook', image: art.lockAppFacebook },
  { id: 'x', name: 'X', image: art.lockAppX },
  { id: 'linkedin', name: 'LinkedIn', image: art.lockAppLinkedin },
  { id: 'reddit', name: 'Reddit', image: art.lockAppReddit },
  { id: 'setlog', name: 'setlog', image: art.lockAppSetlog },
  { id: 'whatsapp', name: 'WhatsApp Messenger', image: art.lockAppWhatsapp },
  { id: 'spotify', name: 'Spotify', image: art.lockAppSpotify },
  { id: 'snapchat', name: 'Snapchat', image: art.lockAppSnapchat },
] as const;
export type LockAppId = typeof lockApps[number]['id'];
export const lockApp = (id: string | null) => lockApps.find(app => app.id === id);
export const lockCategories = [
  ['all', 'Приложения и категории', art.lockCategoryAll], ['social', 'Социальные сети', art.lockCategorySocial],
  ['games', 'Игры', art.lockCategoryGames], ['entertainment', 'Развлечения', art.lockCategoryEntertainment],
  ['creativity', 'Творчество', art.lockCategoryCreativity], ['education', 'Образование', art.lockCategoryEducation],
  ['health', 'Здоровье и фитнес', art.lockCategoryHealth], ['information', 'Информация и чтение', art.lockCategoryInformation],
  ['productivity', 'Продуктивность и финансы', art.lockCategoryProductivity], ['shopping', 'Покупки и еда', art.lockCategoryShopping],
] as const;
export const popularLockApps = ['instagram', 'tiktok', 'youtube', 'facebook', 'x', 'linkedin', 'reddit'];
export const suggestedLockApps = ['bereal', 'setlog', 'instagram', 'whatsapp', 'spotify', 'snapchat', 'youtube', 'tiktok'];
export type LockDraft = StrictSettings & UnlockSettings & { appId: LockAppId | null; count: number; minutes: number; strict: boolean };
export function initialLock(): LockDraft { return { ...initialSession(), appId: null, count: 3, minutes: 5 }; }
export function createLock(draft: LockDraft): LockRule | null {
  const app = lockApp(draft.appId);
  if (!app) return null;
  return { id: `lock-${Date.now()}`, app: app.id, name: app.name, unlocks: `(${draft.count}/${draft.count})`, count: draft.count, minutes: draft.minutes, strict: draft.strict,
    strictSettings: { strictScope: draft.strictScope, strictDays: draft.strictDays }, unlockSettings: { unlockMethod: draft.unlockMethod, waitAutomatic: draft.waitAutomatic, waitSeconds: draft.waitSeconds, copyText: draft.copyText, scanType: draft.scanType } };
}

const pickerImages: Partial<Record<LockAppId, number>> = { bereal: art.lockPickerBereal, facetime: art.lockPickerFacetime, messages: art.lockPickerMessages, xchat: art.lockPickerXchat };
export const lockPickerImage = (id: LockAppId) => pickerImages[id] ?? lockApp(id)!.image;

export { localDay, unlocksUsedToday, type AppUnlockEntry } from './unlockDay';
