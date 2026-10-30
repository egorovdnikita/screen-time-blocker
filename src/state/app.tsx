import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { dayActive, dayFirst, dayJune24, dayToday, dayTodayRefreshed, dayYesterday, type Day } from '@/data/home';

// Сценарии показывают все состояния из макетов. Переключаются в демо-меню (долгое нажатие на «⋯»).
export type Scenario = 'regular' | 'active' | 'firstRun';
export type RulesVariant = 'full' | 'sessions' | 'locks' | 'limits' | 'limitProgress' | 'first';
export type PeriodId = 'today' | 'yesterday' | 'june-24';
export type OnboardingStep = 'tip-first-rule' | 'tip-add-more' | 'done';

const LOADING_MS = 1400;

type AppState = {
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
    setScenarioRaw(s);
    setPeriod('today');
    setRefreshed(false);
    setLoading(false);
    setMostUsedMode('apps');
    setExcluded([]);
    setProductive([]);
    setNewStartVisible(s === 'firstRun');
    setOnboarding(s === 'firstRun' ? 'tip-first-rule' : 'done');
    setRulesVariant(s === 'firstRun' ? 'first' : 'full');
  }, []);

  const day = useMemo<Day>(() => {
    if (period === 'yesterday') return dayYesterday;
    if (period === 'june-24') return dayJune24;
    if (scenario === 'firstRun') return dayFirst;
    if (scenario === 'active') return dayActive;
    return refreshed ? dayTodayRefreshed : dayToday;
  }, [period, scenario, refreshed]);

  const value: AppState = {
    scenario,
    setScenario,
    rulesVariant,
    setRulesVariant,
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
