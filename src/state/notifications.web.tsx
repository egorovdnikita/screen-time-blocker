// Веб-версия без expo-notifications: модуль на вебе не поддерживается и пишет предупреждения при импорте.
export type NotificationPermission = 'unsupported' | 'unknown' | 'granted' | 'denied' | 'blocked';
export function useNotificationPermission() {
  return { permission: 'unsupported' as NotificationPermission, request: async () => {} };
}
export function NotificationSync() {
  return null;
}
