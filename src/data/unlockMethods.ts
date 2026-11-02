import { art } from './art';
import type { UnlockMethod } from './session';

// Один каталог для свёрнутых строк и раскрытых настроек. Отсутствующий method
// означает, что способ ещё не перенесён: выбор и сохранение недоступны.
export const unlockMethods: { id: string; method?: UnlockMethod; label: string; image: number }[] = [
  { id: 'none', method: 'none', label: 'Ничего не делать', image: art.unlockIconNothing },
  { id: 'wait', method: 'wait', label: 'Немного подождать', image: art.unlockIconWait },
  { id: 'reason', method: 'reason', label: 'Указать причину', image: art.unlockIconReason },
  { id: 'text', method: 'text', label: 'Перепечатать текст', image: art.unlockIconText },
  { id: 'code', label: 'Ввести случайный код', image: art.unlockIconCode },
  { id: 'photo', label: 'Подтвердить фото', image: art.unlockIconPhoto },
  { id: 'password', label: 'Ввести пароль', image: art.unlockIconPassword },
  { id: 'scan', method: 'scan', label: 'Сканировать', image: art.unlockIconScan },
  { id: 'mirror', label: 'Посмотреть на себя', image: art.unlockIconMirror },
];
