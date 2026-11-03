import type * as NotificationsModule from 'expo-notifications';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState as RNAppState, Linking, Platform } from 'react-native';

import { plannedNotifications, type PlannedNotification } from '@/data/notificationPlan';
import { rulesVariants } from '@/data/rules';
import { memoryOnly, useAppState } from '@/state/app';

// APP-21: локальные уведомления (работают в Expo Go). Пока только iOS: в Expo Go на Android модуль
// предупреждает об отсутствии push, а Android — отдельная работа. На вебе и в проверочных скриптах — выключено.
const supported = Platform.OS === 'ios' && !memoryOnly;
const PREFIX = 'block-';
// На вебе модуль не импортируем вовсе: он пишет предупреждения уже при загрузке.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Notifications: typeof NotificationsModule = supported ? require('expo-notifications') : (null as never);

if (supported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

export type NotificationPermission = 'unsupported' | 'unknown' | 'granted' | 'denied' | 'blocked';

async function readPermission(): Promise<NotificationPermission> {
  if (!supported) return 'unsupported';
  const s = await Notifications.getPermissionsAsync();
  if (s.granted || s.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) return 'granted';
  if (s.status === 'undetermined') return 'unknown';
  return s.canAskAgain ? 'denied' : 'blocked';
}

/** Состояние разрешения для экрана настроек: обновляется при возврате из Настроек iOS. */
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>(supported ? 'unknown' : 'unsupported');
  const refresh = useCallback(() => { readPermission().then(setPermission).catch(() => setPermission('unsupported')); }, []);
  useEffect(() => {
    refresh();
    const sub = RNAppState.addEventListener('change', state => { if (state === 'active') refresh(); });
    return () => sub.remove();
  }, [refresh]);
  const request = useCallback(async () => {
    if (!supported) return;
    if (permission === 'blocked') { await Linking.openSettings(); return; }
    await Notifications.requestPermissionsAsync();
    refresh();
  }, [permission, refresh]);
  return { permission, request };
}

function trigger(item: PlannedNotification): NotificationsModule.NotificationTriggerInput {
  const t = item.trigger;
  if (t.kind === 'daily') return { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: t.hour, minute: t.minute };
  if (t.kind === 'weekly') return { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: t.weekday, hour: t.hour, minute: t.minute };
  return { type: Notifications.SchedulableTriggerInputTypes.DATE, date: t.at };
}

/** Пересоздаёт уведомления Block при каждом изменении плана; чужие уведомления не трогает. */
export function NotificationSync() {
  const app = useAppState();
  const unlockNames = useMemo(() => Object.fromEntries([...app.createdLocks, ...rulesVariants[app.rulesVariant].locks].map(rule => [rule.id, rule.name])), [app.createdLocks, app.rulesVariant]);
  const titles = useMemo(() => Object.fromEntries(Object.entries(app.ruleChanges).map(([id, change]) => [id, change.title])), [app.ruleChanges]);
  // Минута как часы плана: прошедшие одноразовые события отпадают сами.
  const [minute, setMinute] = useState(() => Math.floor(Date.now() / 60000));
  useEffect(() => { if (!supported) return; const id = setInterval(() => setMinute(Math.floor(Date.now() / 60000)), 60000); return () => clearInterval(id); }, []);
  const plan = useMemo(() => plannedNotifications({ notifications: app.notifications, sessions: app.createdSessions, titles, paused: app.pausedSessions, unlocks: app.appUnlocks, unlockNames, now: minute * 60000 }), [app.notifications, app.createdSessions, titles, app.pausedSessions, app.appUnlocks, unlockNames, minute]);
  const signature = JSON.stringify(plan);
  const applied = useRef<string | null>(null);
  useEffect(() => {
    if (!supported || signature === applied.current) return;
    let cancelled = false;
    const id = setTimeout(async () => {
      try {
        let permission = await readPermission();
        // Первый запрос — в контексте: когда появилось первое событие, о котором стоит напомнить.
        if (permission === 'unknown' && plan.length) { await Notifications.requestPermissionsAsync(); permission = await readPermission(); }
        const existing = await Notifications.getAllScheduledNotificationsAsync();
        await Promise.all(existing.filter(n => n.identifier.startsWith(PREFIX)).map(n => Notifications.cancelScheduledNotificationAsync(n.identifier)));
        if (cancelled || permission !== 'granted') return;
        for (const item of plan) await Notifications.scheduleNotificationAsync({ identifier: item.id, content: { title: item.title, body: item.body, data: { route: item.route } }, trigger: trigger(item) });
        applied.current = signature;
      } catch {
        // Ошибка ОС не должна ронять приложение; следующий пересчёт плана повторит попытку.
      }
    }, 600);
    return () => { cancelled = true; clearTimeout(id); };
  }, [signature, plan]);
  // Нажатие на уведомление открывает нужный раздел.
  useEffect(() => {
    if (!supported) return;
    const open = (response: NotificationsModule.NotificationResponse | null) => {
      const route = response?.notification.request.content.data?.route;
      if (typeof route === 'string') router.navigate(route as never);
    };
    Notifications.getLastNotificationResponseAsync().then(open).catch(() => {});
    const sub = Notifications.addNotificationResponseReceivedListener(open);
    return () => sub.remove();
  }, []);
  return null;
}
