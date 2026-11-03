import { remainingArt as art } from './remainingArt';
export const appIcons = [
  { id: 'original', title: 'Оригинал', image: art.picker_reference_original_unselected },
  { id: 'noir', title: 'Нуар', image: art.picker_reference_noir },
  { id: 'sky', title: 'Небо', image: art.picker_reference_sky },
  { id: 'lush', title: 'Зелень', image: art.picker_reference_lush },
  { id: 'aurora', title: 'Аврора', image: art.picker_reference_aurora },
  { id: 'spooky', title: 'Жуть', image: art.picker_reference_spooky },
  { id: 'ghostly', title: 'Призрак', image: art.picker_reference_ghostly },
] as const;
export type AppIconId = typeof appIcons[number]['id'];
export const initialNotifications = () => ({ diary: false, sessionStart: true, sessionEnd: true, unlockWarning: true, unlockEnd: true, allOff: false });
export type NotificationPreferences = ReturnType<typeof initialNotifications>;
export const languages = [ ['🇷🇺','Русский'], ['🇫🇷','Français'], ['🇨🇳','简体中文'], ['🇩🇪','Deutsch'], ['🇳🇱','Nederlands'], ['🇪🇸','Español'], ['🇮🇹','Italiano'], ['🇧🇷','Português brasileiro'], ['🇰🇷','한국어'], ['🇵🇱','Polski'] ];
