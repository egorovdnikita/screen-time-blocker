import { initialNotifications, type NotificationPreferences, type AppIconId } from '@/data/preferences';
import { initialOnboarding, type OnboardingDraft } from '@/data/onboarding';
import { initialEmergencySettings, type EmergencySettings } from '@/data/emergency';
import type { CustomBlockScreen } from '@/data/blockScreens';
import { cloneNamedGroup, type NamedAppGroup } from '@/data/namedGroups';
import { initialReminders, type ReminderSettings } from '@/data/reminders';
import { currentGoalDay, goalTimeLabel, boundedGoal } from '@/data/dailyGoal';
import { reflectedDay } from '@/data/reflectionSummary';
import { activityCatalog, reflectionKey, type ActivityDefinition, type Reflection } from '@/data/reflection';
import type { Habit } from '@/data/routine';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { LimitRule, LockRule, RoutineRule, SessionRule, RuleDetailChanges } from '@/data/rules';
import { dayActive, dayFirst, dayJune24, dayToday, dayTodayRefreshed, dayYesterday, type Day } from '@/data/home';

// Сценарии показывают все состояния из макетов. Переключаются в демо-меню (долгое нажатие на «⋯»).
export type Scenario = 'regular' | 'active' | 'firstRun';
export type RulesVariant = 'onboarding' | 'strict' | 'full' | 'sessions' | 'locks' | 'limits' | 'limitProgress' | 'first' | 'reason';
export type PeriodId = 'today' | 'yesterday' | 'june-24';
export type OnboardingStep = 'tip-first-rule' | 'tip-add-more' | 'done';

const LOADING_MS = 1400;

type AppState = {
  onboardingDraft: OnboardingDraft;
  startOnboarding: (step?: number) => void;
  patchOnboarding: (patch: Partial<OnboardingDraft>) => void;
  profileName: string;
  setProfileName: (name: string) => void;
  emergencySettings: EmergencySettings;
  saveEmergencySettings: (value: EmergencySettings) => void;
  appIcon: AppIconId;
  setAppIcon: (value: AppIconId) => void;
  notifications: NotificationPreferences;
  setNotifications: (value: NotificationPreferences) => void;
  interfaceSettings: { streak: boolean; special: boolean };
  setInterfaceSettings: (value: { streak: boolean; special: boolean }) => void;
  deletedRuleIds: string[];
  deleteRule: (id: string) => void;
  legacyLimits: boolean;
  setLegacyLimits: (value: boolean) => void;
  troubleshooting: { hideIcons: boolean; realTime: boolean };
  setTroubleshooting: (value: { hideIcons: boolean; realTime: boolean }) => void;
  expertScreens: boolean;
  alternativeScreens: boolean;
  setExpertScreens: (value: boolean) => void;
  setAlternativeScreens: (value: boolean) => void;
  customBlockScreens: CustomBlockScreen[];
  saveBlockScreen: (screen: CustomBlockScreen) => void;
  deleteBlockScreen: (id: string) => void;
  namedGroups: NamedAppGroup[];
  saveNamedGroup: (group: NamedAppGroup) => void;
  showRuleRefreshDemo: () => void;
  ruleChanges: Record<string, RuleDetailChanges>;
  saveRuleDetails: (id: string, changes: RuleDetailChanges) => void;
  pausedSessions: Record<string, 'next' | 'manual'>;
  pauseSession: (id: string, mode: 'next' | 'manual') => void;
  resumeSession: (id: string) => void;
  appUnlocks: Record<string, { until: number; used: number; reason: string }>;
  grantAppUnlock: (ruleId: string, minutes: number, reason: string, showNotice: boolean) => void;
  shareGuideSeen: boolean;
  markShareGuideSeen: () => void;
  estimatedMinutes: number;
  estimatedAccuracy: boolean;
  refreshEstimatedDemo: () => void;
  reminders: ReminderSettings;
  remindersAcknowledged: boolean;
  saveReminders: (value: ReminderSettings) => void;
  customActivities: ActivityDefinition[];
  upsertActivity: (activity: ActivityDefinition) => void;
  dailyGoalMinutes: number | null;
  dailyGoals: number[] | null;
  dailyGoalEnabled: boolean;
  saveDailyGoals: (days: number[]) => void;
  disableDailyGoal: () => void;
  setDailyGoalMinutes: (minutes: number) => void;
  reflections: Record<string, Reflection>;
  reflectionDefaults: Record<string, Reflection>;
  deleteReflection: (day: string, appId: string) => void;
  reflectionExcluded: string[];
  saveReflection: (day: string, appId: string, value: Reflection) => void;
  setReflectionExcluded: (day: string, appId: string, excluded: boolean) => void;
  customHabits: Habit[];
  upsertHabit: (habit: Habit) => void;
  sessionNotice: string | null;
  createdSessions: SessionRule[];
  createdLocks: LockRule[];
  createdLimits: LimitRule[];
  createdRoutines: RoutineRule[];
  savedRoutineTemplates: RoutineRule[];
  addRoutine: (rule: RoutineRule, template?: boolean) => void;
  addLimit: (rule: LimitRule, template?: boolean) => void;
  savedLimitTemplates: LimitRule[];
  addLock: (rule: LockRule) => void;
  savedTemplates: SessionRule[];
  updateSessionTemplate: (id: string, changes: RuleDetailChanges) => void;
  deleteSessionTemplate: (id: string) => void;
  addSession: (session: SessionRule, template?: boolean) => void;
  scenario: Scenario;
  setScenario: (s: Scenario) => void;
  rulesVariant: RulesVariant;
  setRulesVariant: (v: RulesVariant) => void;

  period: PeriodId;
  setPeriod: (p: PeriodId) => void;
  day: Day;
  loading: boolean;
  refresh: () => void;

  mostUsedMode: 'apps' | 'activities';
  setMostUsedMode: (m: 'apps' | 'activities') => void;
  excluded: string[];
  toggleExcluded: (id: string) => void;
  productive: string[];
  markProductive: (id: string) => void;

  newStartVisible: boolean;
  dismissNewStart: () => void;
  onboarding: OnboardingStep;
  advanceOnboarding: () => void;
};

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [onboardingDraft, setOnboardingDraft] = useState(() => initialOnboarding());
  const [profileName, setProfileName] = useState('Саша');
  const startOnboarding = useCallback((step = 0) => setOnboardingDraft(previous => step === 18 ? { ...previous, step } : initialOnboarding(step)), []);
  const patchOnboarding = useCallback((patch: Partial<OnboardingDraft>) => setOnboardingDraft(value => ({ ...value, ...patch })), []);
  const [emergencySettings, saveEmergencySettings] = useState(initialEmergencySettings);
  const [appIcon, setAppIcon] = useState<AppIconId>('original');
  const [notifications, setNotifications] = useState(initialNotifications);
  const [interfaceSettings, setInterfaceSettings] = useState({ streak: true, special: false });
  const [deletedRuleIds, setDeletedRuleIds] = useState<string[]>([]);
  const [legacyLimits, setLegacyLimits] = useState(false);
  const [troubleshooting, setTroubleshooting] = useState({ hideIcons: false, realTime: true });
  const [ruleChanges, setRuleChanges] = useState<Record<string, RuleDetailChanges>>({});
  const [pausedSessions, setPausedSessions] = useState<Record<string, 'next' | 'manual'>>({});
  const [appUnlocks, setAppUnlocks] = useState<Record<string, { until: number; used: number; reason: string }>>({});
  const [shareGuideSeen, setShareGuideSeen] = useState(false);
  const [estimatedMinutes, setEstimatedMinutes] = useState(125);
  const [estimatedAccuracy, setEstimatedAccuracy] = useState(false);
  const [reminders, setReminders] = useState(initialReminders);
  const [remindersAcknowledged, setRemindersAcknowledged] = useState(false);
  const [customActivities, setCustomActivities] = useState<ActivityDefinition[]>([]);
  const [dailyGoals, setDailyGoals] = useState<number[] | null>(null);
  const [dailyGoalEnabled, setDailyGoalEnabled] = useState(true);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number | null>(null);
  const [reflectionTouchedDays, setReflectionTouchedDays] = useState<string[]>([]);
  const touchReflectionDay = (dayId: string) => setReflectionTouchedDays(xs => [...new Set([...xs, reflectionKey(dayId, '')])]);
  const [reflections, setReflections] = useState<Record<string, Reflection>>({});
  const [reflectionDefaults, setReflectionDefaults] = useState<Record<string, Reflection>>({});
  const [reflectionExcluded, setReflectionExcludedRaw] = useState<string[]>([]);
  const [customHabits, setCustomHabits] = useState<Habit[]>([]);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (noticeTimer.current) clearTimeout(noticeTimer.current); }, []);
  const [createdRoutines, setCreatedRoutines] = useState<RoutineRule[]>([]);
  const [savedRoutineTemplates, setSavedRoutineTemplates] = useState<RoutineRule[]>([]);
  const [savedLimitTemplates, setSavedLimitTemplates] = useState<LimitRule[]>([]);
  const [createdLimits, setCreatedLimits] = useState<LimitRule[]>([]);
  const [createdLocks, setCreatedLocks] = useState<LockRule[]>([]);
  const [createdSessions, setCreatedSessions] = useState<SessionRule[]>([]);
  const [expertScreens, setExpertScreens] = useState(false);
  const [alternativeScreens, setAlternativeScreens] = useState(false);
  const [customBlockScreens, setCustomBlockScreens] = useState<CustomBlockScreen[]>([]);
  const [namedGroups, setNamedGroups] = useState<NamedAppGroup[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<SessionRule[]>([]);
  const [scenario, setScenarioRaw] = useState<Scenario>('regular');
  const [rulesVariant, setRulesVariant] = useState<RulesVariant>('full');
  const [period, setPeriod] = useState<PeriodId>('today');
  const [refreshed, setRefreshed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mostUsedMode, setMostUsedMode] = useState<'apps' | 'activities'>('apps');
  const [excluded, setExcluded] = useState<string[]>([]);
  const [productive, setProductive] = useState<string[]>([]);
  const [newStartVisible, setNewStartVisible] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingStep>('done');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const startLoading = useCallback((then?: () => void) => {
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => {
      then?.();
      setLoading(false);
    }, LOADING_MS);
  }, []);

  const setScenario = useCallback((s: Scenario) => {
    if (timer.current) clearTimeout(timer.current);
    setSessionNotice(null);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setCreatedSessions([]);
    setCreatedLocks([]);
    setCreatedLimits([]);
    setCreatedRoutines([]);
    setCustomHabits([]);
    setSavedRoutineTemplates([]);
    setSavedLimitTemplates([]);
    setSavedTemplates([]);
    setNamedGroups([]);
    setLegacyLimits(false);
    setOnboardingDraft(initialOnboarding()); setProfileName('Саша');
    setAppIcon('original'); setNotifications(initialNotifications()); saveEmergencySettings(initialEmergencySettings()); setInterfaceSettings({ streak: true, special: false }); setDeletedRuleIds([]);
    setTroubleshooting({ hideIcons: false, realTime: true });
    setExpertScreens(false); setAlternativeScreens(false); setCustomBlockScreens([]);
    setScenarioRaw(s);
    setPeriod('today');
    setRefreshed(false);
    setLoading(false);
    setMostUsedMode('apps');
    setExcluded([]);
    setProductive([]);
    setRuleChanges({}); setPausedSessions({});
    setAppUnlocks({});
    setShareGuideSeen(false);
    setEstimatedMinutes(125); setEstimatedAccuracy(false);
    setReminders(initialReminders()); setRemindersAcknowledged(false);
    setCustomActivities([]); setDailyGoalMinutes(null); setDailyGoals(null); setDailyGoalEnabled(true);
    setReflectionTouchedDays([]);
    setReflections({}); setReflectionDefaults({}); setReflectionExcludedRaw([]);
    setNewStartVisible(s === 'firstRun');
    setOnboarding(s === 'firstRun' ? 'tip-first-rule' : 'done');
    setRulesVariant(s === 'firstRun' ? 'first' : 'full');
  }, []);

  const baseDay = useMemo<Day>(() => {
    if (period === 'yesterday') return dayYesterday;
    if (period === 'june-24') return dayJune24;
    if (scenario === 'firstRun') return dayFirst;
    if (scenario === 'active') return dayActive;
    return refreshed ? dayTodayRefreshed : dayToday;
  }, [period, scenario, refreshed]);

  const selectedGoal = dailyGoals?.[currentGoalDay(period)] ?? dailyGoalMinutes;
  const day = useMemo(() => reflectedDay(selectedGoal === null && dailyGoalEnabled ? baseDay : { ...baseDay, goal: { ...baseDay.goal, enabled: dailyGoalEnabled, text: `${baseDay.goal.kind === 'check' ? 'В пределах' : 'Не больше'} ${goalTimeLabel(selectedGoal ?? 260)}` } }, reflections, reflectionExcluded, excluded, reflectionTouchedDays.includes(reflectionKey(baseDay.id, '')), activityCatalog(customActivities)), [baseDay, reflections, reflectionExcluded, excluded, reflectionTouchedDays, customActivities, selectedGoal, dailyGoalEnabled]);

  const ruleNotice = () => { if (noticeTimer.current) clearTimeout(noticeTimer.current); setSessionNotice('Изменения сохранены'); noticeTimer.current = setTimeout(() => setSessionNotice(null), 2800); };
  const value: AppState = {
    onboardingDraft, startOnboarding, patchOnboarding, profileName, setProfileName,
    appIcon, setAppIcon, notifications, setNotifications, emergencySettings, saveEmergencySettings, interfaceSettings, setInterfaceSettings, deletedRuleIds,
    deleteRule: id => setDeletedRuleIds(xs => xs.includes(id) ? xs : [...xs, id]),
    showRuleRefreshDemo: () => { if (noticeTimer.current) clearTimeout(noticeTimer.current); setSessionNotice('Обновляем данные. Это может занять\nнесколько минут.'); noticeTimer.current = setTimeout(() => setSessionNotice(null), 4000); },
    ruleChanges, saveRuleDetails: (id, changes) => { setRuleChanges(xs => ({ ...xs, [id]: { ...changes, strictSettings: { ...changes.strictSettings } } })); ruleNotice(); },
    pausedSessions, pauseSession: (id, mode) => { setPausedSessions(xs => ({ ...xs, [id]: mode })); ruleNotice(); },
    resumeSession: id => { setPausedSessions(xs => { const next = { ...xs }; delete next[id]; return next; }); ruleNotice(); },
    appUnlocks, grantAppUnlock: (id, minutes, reason, showNotice) => {
      setAppUnlocks(xs => ({ ...xs, [id]: { until: Date.now() + Math.max(1, minutes) * 60000, used: (xs[id]?.used ?? 0) + 1, reason } }));
      if (showNotice) { if (noticeTimer.current) clearTimeout(noticeTimer.current); setSessionNotice(`Приложения откроются на ${minutes}мин.`); noticeTimer.current = setTimeout(() => setSessionNotice(null), 2800); }
    },
    shareGuideSeen, markShareGuideSeen: () => setShareGuideSeen(true),
    estimatedMinutes, estimatedAccuracy, refreshEstimatedDemo: () => { setEstimatedMinutes(value => value === 125 ? 110 : 125); setEstimatedAccuracy(true); },
    reminders, remindersAcknowledged, saveReminders: value => { setReminders({ ...value }); setRemindersAcknowledged(true); },
    customActivities, upsertActivity: activity => setCustomActivities(xs => [...xs.filter(item => item.id !== activity.id), { ...activity }]),
    dailyGoalMinutes, dailyGoals, dailyGoalEnabled,
    saveDailyGoals: days => { if (days.length !== 7) return; setDailyGoals(days.map(boundedGoal)); setDailyGoalEnabled(true); },
    disableDailyGoal: () => setDailyGoalEnabled(false),
    setDailyGoalMinutes: minutes => { const goal = boundedGoal(minutes); setDailyGoalMinutes(goal); setDailyGoals(Array(7).fill(goal)); setDailyGoalEnabled(true); },
    reflections, reflectionDefaults, reflectionExcluded,
    deleteReflection: (dayId, appId) => { touchReflectionDay(dayId); setReflections(xs => { const next = { ...xs }; delete next[reflectionKey(dayId, appId)]; return next; }); },
    saveReflection: (dayId, appId, value) => {
      touchReflectionDay(dayId);
      setReflections(xs => ({ ...xs, [reflectionKey(dayId, appId)]: { ...value } }));
      setReflectionDefaults(xs => { const next = { ...xs }; if (value.always) next[appId] = { ...value }; else delete next[appId]; return next; });
    },
    setReflectionExcluded: (dayId, appId, excluded) => { touchReflectionDay(dayId); const key = reflectionKey(dayId, appId); setReflectionExcludedRaw(xs => excluded ? [...new Set([...xs, key])] : xs.filter(x => x !== key)); },
    customHabits, upsertHabit: habit => setCustomHabits(items => [...items.filter(h => h.id !== habit.id), { ...habit }]),
    legacyLimits, setLegacyLimits,
    troubleshooting, setTroubleshooting,
    expertScreens, alternativeScreens, setExpertScreens, setAlternativeScreens, customBlockScreens,
    saveBlockScreen: screen => setCustomBlockScreens(xs => xs.some(x => x.id === screen.id) ? xs.map(x => x.id === screen.id ? { ...screen } : x) : [...xs, { ...screen }]),
    deleteBlockScreen: id => setCustomBlockScreens(xs => xs.filter(x => x.id !== id)),
    namedGroups, saveNamedGroup: group => setNamedGroups(xs => xs.some(x => x.id === group.id) ? xs.map(x => x.id === group.id ? cloneNamedGroup(group) : x) : [...xs, cloneNamedGroup(group)]),
    sessionNotice, createdSessions, savedTemplates, createdLocks, createdLimits, savedLimitTemplates, createdRoutines, savedRoutineTemplates,
    updateSessionTemplate: (id, changes) => { setSavedTemplates(xs => xs.map(x => x.id === id ? { ...x, title: changes.title, strict: changes.strict, strictSettings: { ...changes.strictSettings } } : x)); },
    deleteSessionTemplate: id => { setSavedTemplates(xs => xs.filter(x => x.id !== id)); if (noticeTimer.current) clearTimeout(noticeTimer.current); setSessionNotice('Шаблон удалён!'); noticeTimer.current = setTimeout(() => setSessionNotice(null), 2800); },
    addRoutine: (rule, template = false) => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
      setSessionNotice(template ? 'Шаблон создан!' : 'Правило добавлено!');
      noticeTimer.current = setTimeout(() => setSessionNotice(null), 2800);
      if (template) setSavedRoutineTemplates(xs => [rule, ...xs]);
      else setCreatedRoutines(xs => [rule, ...xs]);
    },
    addLimit: (rule, template = false) => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
      setSessionNotice(template ? 'Шаблон создан!' : 'Правило добавлено!');
      noticeTimer.current = setTimeout(() => setSessionNotice(null), 2800);
      if (template) setSavedLimitTemplates(xs => [rule, ...xs]);
      else setCreatedLimits(xs => [rule, ...xs]);
    },
    addLock: rule => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
      setSessionNotice('Правило добавлено!');
      noticeTimer.current = setTimeout(() => setSessionNotice(null), 2800);
      setCreatedLocks(xs => [rule, ...xs]);
    },
    addSession: (session, template = false) => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
      setSessionNotice(template ? 'Шаблон создан!' : session.status.kind === 'upcoming' ? 'Расписание добавлено!' : 'Сессия началась!');
      noticeTimer.current = setTimeout(() => setSessionNotice(null), 2800);
      if (template) setSavedTemplates(xs => [session, ...xs]);
      else setCreatedSessions(xs => [session, ...xs]);
    },
    scenario,
    setScenario,
    rulesVariant,
    setRulesVariant: variant => { setRulesVariant(variant); setAppUnlocks({}); },
    period,
    setPeriod,
    day,
    loading,
    refresh: () => startLoading(() => setRefreshed(true)),
    mostUsedMode,
    setMostUsedMode,
    excluded,
    toggleExcluded: (id) => setExcluded((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id])),
    productive,
    markProductive: (id) => setProductive((xs) => (xs.includes(id) ? xs : [...xs, id])),
    newStartVisible,
    dismissNewStart: () => {
      setNewStartVisible(false);
      startLoading();
    },
    onboarding,
    advanceOnboarding: () => setOnboarding((s) => (s === 'tip-first-rule' ? 'tip-add-more' : 'done')),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppState вне AppStateProvider');
  return v;
}
