import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type RulesVariant, type Scenario, useAppState } from '@/state/app';
import { T, TRACK_SMALL } from '@/theme/typography';
import { colors, radii, modalTheme } from '@/theme/tokens';

import { Icon } from './Icon';
import { SheetModal } from './SheetModal';

const SCENARIOS: { id: Scenario; title: string; hint: string }[] = [
  { id: 'regular', title: 'Обычный день', hint: '12 мин, «Обновить» → 13 мин' },
  { id: 'active', title: 'Активный день', hint: 'Активности, «Продуктивно», «С пользой»' },
  { id: 'firstRun', title: 'Первый запуск', hint: 'Новое начало → загрузка → 8 мин, подсказки в Правилах' },
];

const RULES: { id: RulesVariant; title: string }[] = [
  { id: 'strict', title: 'Строгое правило Apple Music' },
  { id: 'full', title: 'Все правила' },
  { id: 'reason', title: 'Открытие: указать причину' },
  { id: 'first', title: 'Первое правило' },
  { id: 'sessions', title: 'Две сессии' },
  { id: 'locks', title: 'Блокировки и сессии' },
  { id: 'limits', title: 'Лимит времени' },
  { id: 'limitProgress', title: 'Прогресс лимита' },
];

// Скрытое меню состояний из макетов: долгое нажатие на «⋯» на Главной или в Правилах.
export function DemoMenu({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const app = useAppState();
  const insets = useSafeAreaInsets();
  return <SheetModal visible={visible} animateClose onClose={onClose} backdrop={close => <Pressable style={[StyleSheet.absoluteFill,{backgroundColor:modalTheme.dim}]} onPress={() => close()} accessibilityLabel="Закрыть" />}>
    {close => <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.grabber} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Row title="Последние 22 экрана" hint="046, 094, 107, 203–207, 265, 310–318, 338–344" selected={false} onPress={() => close(() => { onClose(); router.push('/remaining'); })} />
          <Row title="Знакомство с Block" hint="Экраны 000–017" selected={false} onPress={() => close(() => { onClose(); router.push('/onboarding'); })} />
          <Row title="Настройка первой блокировки" hint="Экраны 018–025" selected={false} onPress={() => close(() => { onClose(); router.push('/onboarding?step=18'); })} />
          <T size={12} ls={TRACK_SMALL} color={colors.section} style={styles.caption}>
            ДЕМО · СЦЕНАРИЙ
          </T>
          {SCENARIOS.map((s) => (
            <Row
              key={s.id}
              title={s.title}
              hint={s.hint}
              selected={app.scenario === s.id}
              onPress={() => close(() => { app.setScenario(s.id); onClose(); })}
            />
          ))}
          <T size={12} ls={TRACK_SMALL} color={colors.section} style={[styles.caption, { marginTop: 18 }]}>
            ДЕМО · ПРАВИЛА
          </T>
          {RULES.map((r) => (
            <Row
              key={r.id}
              title={r.title}
              selected={app.rulesVariant === r.id}
              onPress={() => close(() => { app.setRulesVariant(r.id); onClose(); })}
            />
          ))}
        </ScrollView>
    </View>}
  </SheetModal>;
}

function Row({ title, hint, selected, onPress }: { title: string; hint?: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={({ pressed }) => [styles.row, selected && styles.rowOn, pressed && { opacity: 0.6 }]}>
      <View style={{ flex: 1 }}>
        <T size={15.25} color={selected ? colors.bar : colors.text}>
          {title}
        </T>
        {hint && (
          <T size={12} weight={500} ls={TRACK_SMALL} color={colors.meta} style={{ marginTop: 2 }}>
            {hint}
          </T>
        )}
      </View>
      {selected && <Icon name="period-check" width={15} color={colors.bar} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    maxHeight: '80%',
    borderRadius: 34,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  grabber: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3, backgroundColor: colors.dash, marginBottom: 12 },
  caption: { marginLeft: 4, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, borderRadius: radii.ruleCard },
  rowOn: { backgroundColor: colors.periodSelected },
});
