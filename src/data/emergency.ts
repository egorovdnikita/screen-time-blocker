// Только локальный прототип: настройки и демонстрационный код живут в памяти.
export type EmergencySettings = { method: 'random' | 'passcode'; length: number; passcode: string | null };
export const initialEmergencySettings = (): EmergencySettings => ({ method: 'random', length: 80, passcode: null });
export function emergencyChallenge(length: number, special = false) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' + (special ? '!@#$%&*?' : '');
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
