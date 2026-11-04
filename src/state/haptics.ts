import * as Haptics from 'expo-haptics';

// Тактильный отклик на итог действия. Сбой не должен мешать самому действию.
export function hapticResult(type: 'success' | 'warning' | 'error') {
  const kind = { success: Haptics.NotificationFeedbackType.Success, warning: Haptics.NotificationFeedbackType.Warning, error: Haptics.NotificationFeedbackType.Error }[type];
  Haptics.notificationAsync(kind).catch(() => undefined);
}
