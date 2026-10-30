import { Animated, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type RulesVariant, type Scenario, useAppState } from '@/state/app';
import { T, TRACK_SMALL } from '@/theme/typography';
import { colors, radii } from '@/theme/tokens';

import { Icon } from './Icon';
import { usePresence } from './motion';

const SCENARIOS: { id: Scenario; title: string; hint: string }[] = [
  { id: 'regular', title: 'Обычный день', hint: '12 мин, «Обновить» → 13 мин' },
  { id: 'active', title: 'Активный день', hint: 'Активности, «Продуктивно», «С пользой»' },
  { id: 'firstRun', title: 'Первый запуск', hint: 'Новое начало → загрузка → 8 мин, подсказки в Правилах' },
];

const RULES: { id: RulesVariant; title: string }[] = [
  { id: 'full', title: 'Все правила' },
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
  const { mounted, progress } = usePresence(visible);
  if (!mounted) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.35)', opacity: progress }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Закрыть" />
      </Animated.View>
      <Animated.View
        style={[
          styles.sheet,
          {
            paddingBottom: insets.bottom + 16,
            transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [500, 0] }) }],
          },
        ]}
      >
        <View style={styles.grabber} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <T size={12} ls={TRACK_SMALL} color={colors.section} style={styles.caption}>
            ДЕМО · СЦЕНАРИЙ
          </T>
          {SCENARIOS.map((s) => (
            <Row
              key={s.id}
              title={s.title}
              hint={s.hint}
              selected={app.scenario === s.id}
              onPress={() => {
                app.setScenario(s.id);
                onClose();
              }}
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
              onPress={() => {
                app.setRulesVariant(r.id);
                onClose();
              }}
            />
          ))}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

function Row({ title, hint, selected, onPress }: { title: string; hint?: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, selected && styles.rowOn, pressed && { opacity: 0.6 }]}>
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
