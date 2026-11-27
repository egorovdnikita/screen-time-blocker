import { box } from '@/theme/box-ui.generated';
import { SheetGrabber, SheetModal } from '@/components/SheetModal';
import { GlassDialog } from '@/components/GlassDialog';
import { useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/motion';
import { boundedReminder, remindersEnabled, type ReminderSettings } from '@/data/reminders';
import { T } from '@/theme/typography';
import { colors, settingsTheme as c, dailyGoalTheme as g, reminderTheme as r } from '@/theme/tokens';

export function Reminders({
  value,
  acknowledged,
  onClose,
  onSave,
}: {
  value: ReminderSettings;
  acknowledged: boolean;
  onClose: () => void;
  onSave: (value: ReminderSettings) => void;
}) {
  const [draft, setDraft] = useState(() => ({ ...value }));
  const [beta, setBeta] = useState(false);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const changed = draft.before !== value.before || draft.every !== value.every;
  return (
    <SheetModal
      animateClose
      onClose={onClose}
      backdrop={close => (
        <Pressable
          accessibilityLabel="Отменить напоминания"
          onPress={() => close()}
          style={[StyleSheet.absoluteFill, { backgroundColor: c.dim }]}
        />
      )}
    >
      {close => (
        <>
          <View accessibilityViewIsModal style={[styles.sheet, { top: Math.max(insets.top + 20, height - 346) }]}>
            <SheetGrabber style={styles.handle} />
            <View style={styles.header}>
              <PressScale
                accessibilityRole="button"
                accessibilityLabel="Отменить настройки напоминаний"
                onPress={() => close()}
                style={[styles.round, { backgroundColor: r.close }]}
              >
                <Icon name="reflection-close" width={18} height={18} />
              </PressScale>
              <T size={box.fontSize['20']} color={c.title} ls={0}>
                Напоминания
              </T>
              <PressScale
                accessibilityRole="button"
                accessibilityLabel="Сохранить напоминания"
                disabled={!changed}
                accessibilityState={{ disabled: !changed }}
                onPress={() =>
                  !acknowledged && remindersEnabled(draft) ? setBeta(true) : close(() => onSave({ ...draft }))
                }
                style={[styles.round, { backgroundColor: changed ? c.blue : g.disabled }]}
              >
                <Icon
                  name="reflection-confirm"
                  width={21}
                  height={23}
                  color={colors.white}
                  style={{ opacity: changed ? 1 : 0.7 }}
                />
              </PressScale>
            </View>
            <View style={styles.rows}>
              {(
                [
                  { id: 'before', title: 'До достижения цели', max: 120 },
                  { id: 'every', title: 'Каждые…', max: 240 },
                ] as const
              ).map((row, i) => (
                <View
                  key={row.id}
                  accessibilityLabel={`Интервал ${row.title}`}
                  style={[styles.row, i === 0 && { borderBottomWidth: 1, borderBottomColor: c.border }]}
                >
                  <T size={box.fontSize['14']} weight={box.fontWeight['regular']} variant="text" color={c.title} ls={0}>
                    {row.title}
                  </T>
                  <T
                    size={box.fontSize['14']}
                    weight={box.fontWeight['semibold']}
                    variant="text"
                    color={c.note}
                    ls={0}
                    style={{ marginLeft: 'auto' }}
                  >
                    {draft[row.id] ? `${draft[row.id]}мин` : 'Нет'}
                  </T>
                  <View style={styles.stepper}>
                    <View pointerEvents="none" style={styles.separator} />
                    {([-5, 5] as const).map(delta => (
                      <PressScale
                        key={delta}
                        accessibilityRole="button"
                        accessibilityLabel={`${delta > 0 ? 'Увеличить' : 'Уменьшить'} напоминание ${row.title}`}
                        disabled={delta < 0 ? draft[row.id] === 0 : draft[row.id] === row.max}
                        accessibilityState={{ disabled: delta < 0 ? draft[row.id] === 0 : draft[row.id] === row.max }}
                        onPress={() =>
                          setDraft(xs => ({ ...xs, [row.id]: boundedReminder(xs[row.id] + delta, row.max) }))
                        }
                        style={{
                          width: box.size['44'],
                          height: 30,
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: delta < 0 && !draft[row.id] ? 0.4 : 1,
                        }}
                      >
                        <Icon name={delta > 0 ? 'reminder-plus' : 'reminder-minus'} width={15} height={15} />
                      </PressScale>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
          {beta && (
            <ReminderBeta
              onCancel={() => setBeta(false)}
              onContinue={() => {
                setBeta(false);
                close(() => onSave({ ...draft }));
              }}
            />
          )}
        </>
      )}
    </SheetModal>
  );
}
function ReminderBeta({ onCancel, onContinue }: { onCancel: () => void; onContinue: () => void }) {
  return (
    <GlassDialog
      buttonWeight={400}
      title="Напоминания в БЕТА"
      name="включение напоминаний"
      cancelAccessibilityLabel="Отмена включения напоминаний"
      confirmLabel="Продолжить"
      onCancel={onCancel}
      onConfirm={onContinue}
    >
      <T
        size={15}
        weight={box.fontWeight['regular']}
        variant="text"
        color={r.alertInk}
        ls={0}
        style={{ position: 'absolute', left: 30, right: 25, top: 51, lineHeight: box.lineHeight['20'] }}
      >
        {'Функция ещё тестируется. Иногда\nнапоминания могут работать\nнепредсказуемо.'}
      </T>
    </GlassDialog>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: box.radius['44'],
    backgroundColor: c.front,
  },
  handle: {
    position: 'absolute',
    top: 11,
    alignSelf: 'center',
    width: 63,
    height: 5,
    borderRadius: 3,
    backgroundColor: c.handle,
  },
  header: {
    position: 'absolute',
    top: 42.667,
    left: 20,
    right: 20,
    height: box.size['44'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  round: {
    width: box.size['44'],
    height: box.size['44'],
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rows: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 104.667,
    backgroundColor: colors.white,
    borderRadius: box.radius['20'],
    overflow: 'hidden',
  },
  row: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: box.spacing['12'],
    gap: box.spacing['10'],
  },
  stepper: {
    width: box.size['88'],
    height: 30,
    borderRadius: box.radius['16'],
    backgroundColor: r.stepper,
    flexDirection: 'row',
  },
  separator: { position: 'absolute', left: 44, top: 4, width: 1, height: 22, backgroundColor: r.separator },
});
