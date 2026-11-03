export type ReminderSettings = { before: number; every: number };
export const initialReminders = (): ReminderSettings => ({ before: 0, every: 0 });
export const remindersEnabled = (value: ReminderSettings) => value.before > 0 || value.every > 0;
export const boundedReminder = (value: number, max: number) => Math.max(0, Math.min(max, Math.round(value / 5) * 5));
