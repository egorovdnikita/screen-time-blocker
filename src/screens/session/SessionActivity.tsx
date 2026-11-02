import { BlurView } from 'expo-blur';
import { useRef, useState, type ComponentRef } from 'react';
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { FlowSwitch } from '@/components/SessionPrimitives';
import { animateLayout, PressScale } from '@/components/motion';
import { WheelColumn, type WheelItem } from '@/components/WheelColumn';
import { durationLabel, hourLabel, type SessionDraft } from '@/data/session';
import { colors, sessionPickerTheme as p, sessionTheme as c } from '@/theme/tokens';
import { T } from '@/theme/typography';

const range = (count: number, pad = false): WheelItem[] => Array.from({ length: count }, (_, value) => ({ value, label: pad ? String(value).padStart(2, '0') : String(value) }));
const DAYS = range(31), HOURS = range(24), MINUTES = range(60), CLOCK_MINUTES = range(60, true);
const CLOCK_HOURS: WheelItem[] = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: String(i + 1) }));
const PERIODS: WheelItem[] = [{ value: 0, label: 'AM' }, { value: 1, label: 'PM' }];
type ClockKey = 'start' | 'end';
type Props = { draft: SessionDraft; patch: (update: Partial<SessionDraft>) => void };

export function SessionActivity({ draft, patch }: Props) {
  const anchors = useRef<Partial<Record<ClockKey, ComponentRef<typeof View>>>>({});
  const [clock, setClock] = useState<{ key: ClockKey; left: number; top: number } | null>(null);
  const { width, height } = useWindowDimensions();
  const openClock = (key: ClockKey) => anchors.current[key]?.measureInWindow((x, y, w, h) => {
    const below = y + h + 5.5;
    setClock({ key, left: Math.max(20, Math.min(width - 20 - p.clockWidth, x + w + 3 - p.clockWidth)), top: below + p.clockHeight > height - 162 ? Math.max(72, y - p.clockHeight - 6) : below });
  });
  const days = Math.floor(draft.minutes / 1440), hours = Math.floor(draft.minutes / 60) % 24, minutes = draft.minutes % 60;
  const setDuration = (day: number, hour: number, minute: number) => patch({ minutes: Math.max(1, day * 1440 + hour * 60 + minute) });
  const clockHour = clock ? draft[clock.key] : 0;
  const clockMinute = clock ? draft[`${clock.key}Minute`] : 0;
  const clockName = clock?.key === 'start' ? 'начала' : 'окончания';
  const updateHour = (value: number) => clock && patch({ [clock.key]: value % 12 + (clockHour >= 12 ? 12 : 0) });

  return <View style={{ height: draft.scheduled ? 341 : 321 }}>
    <View style={styles.segmentClip}>
      <View style={styles.segments}>
        {[false, true].map((scheduled, i) => <PressScale key={String(scheduled)} accessibilityRole="button" accessibilityState={{ selected: draft.scheduled === scheduled }}
          onPress={() => { animateLayout(); patch({ scheduled }); }}
          style={[styles.segment, { minWidth: draft.scheduled === scheduled ? 129 : 108 }, i === 0 && draft.scheduled && { marginLeft: -20 }, draft.scheduled === scheduled && styles.segmentOn]}>
          <T size={14} color={draft.scheduled === scheduled ? colors.white : c.secondary} ls={0}>{draft.scheduled === scheduled ? '✓ ' : ''}{scheduled ? 'По графику' : 'Сразу'}</T>
        </PressScale>)}
        <View style={styles.segment} accessibilityLabel="Всегда" accessibilityState={{ disabled: true }}><T size={14} color={c.secondary} ls={0}>Всегда</T></View>
      </View>
    </View>
    {draft.scheduled ? <>
      <View style={styles.grid}>
        <View style={styles.scheduleRow}><T size={15} weight={400} ls={0}>Весь день</T><FlowSwitch label="Весь день" value={draft.allDay} onChange={allDay => { patch({ allDay }); setClock(null); }} /></View>
        {(['start', 'end'] as const).map(key => <View key={key} style={[styles.scheduleRow, styles.line, draft.allDay && { opacity: .35 }]}>
          <T size={15} weight={400} ls={0}>{key === 'start' ? 'Начало' : 'Окончание'}</T>
          <View collapsable={false} ref={view => { anchors.current[key] = view ?? undefined; }}>
            <PressScale disabled={draft.allDay} accessibilityRole="button" accessibilityLabel={key === 'start' ? 'Начало' : 'Окончание'} accessibilityState={{ disabled: draft.allDay }} onPress={() => openClock(key)} style={styles.time}>
              <T size={17} weight={400} ls={0}>{hourLabel(draft[key], draft[`${key}Minute`])}</T>
            </PressScale>
          </View>
        </View>)}
      </View>
      <View style={styles.days}>{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((name, day) => <PressScale key={day} accessibilityRole="checkbox" accessibilityLabel={name} accessibilityState={{ checked: draft.days.includes(day) }}
        onPress={() => patch({ days: draft.days.includes(day) && draft.days.length > 1 ? draft.days.filter(v => v !== day) : [...new Set([...draft.days, day])].sort() })}
        style={[styles.day, draft.days.includes(day) && styles.dayOn]}><T size={13} color={draft.days.includes(day) ? colors.white : p.inactiveDay} ls={0}>{name}</T></PressScale>)}</View>
      <T size={12} weight={400} color={p.note} center ls={0} style={styles.daysNote}>Дни недели активны ({draft.days.length}/7)</T>
    </> : <>
      <View style={styles.durationWheel}>
        <WheelColumn label="Дни длительности" items={DAYS} value={days} onChange={day => setDuration(day, hours, minutes)} width={48} height={p.durationHeight} center={p.durationCenter} rowHeight={p.durationRow} highlight />
        <T size={12} weight={600} ls={0} style={styles.unit}>день</T>
        <WheelColumn label="Часы длительности" items={HOURS} value={hours} onChange={hour => setDuration(days, hour, minutes)} width={48} height={p.durationHeight} center={p.durationCenter} rowHeight={p.durationRow} highlight />
        <T size={12} weight={600} ls={0} style={styles.unit}>час</T>
        <WheelColumn label="Минуты длительности" items={days === 0 && hours === 0 ? MINUTES.slice(1) : MINUTES} value={minutes} onChange={minute => setDuration(days, hours, minute)} width={48} height={p.durationHeight} center={p.durationCenter} rowHeight={p.durationRow} highlight />
        <T size={12} weight={600} ls={0} style={styles.unit}>мин</T>
      </View>
      <T size={13} weight={400} color={p.note} ls={0} center style={styles.durationNote}>Приложения будут заблокированы на {durationLabel(draft.minutes)}.</T>
    </>}
    <Modal visible={clock !== null} transparent animationType="fade" onRequestClose={() => setClock(null)}>
      <View style={StyleSheet.absoluteFill}>
        <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Закрыть выбор времени" onPress={() => setClock(null)} />
        {clock && <View style={[styles.popover, { left: clock.left, top: clock.top }]} accessibilityViewIsModal>
          <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: p.clockFill }]} />
          <View pointerEvents="none" style={styles.clockHighlight} />
          <WheelColumn label={`Часы ${clockName}`} items={CLOCK_HOURS} value={clockHour % 12 || 12} onChange={updateHour} width={57} selectedSize={24} otherSize={19} surface={p.clockMask} fade={p.clockFade} />
          <WheelColumn label={`Минуты ${clockName}`} items={CLOCK_MINUTES} value={clockMinute} onChange={minute => patch({ [`${clock.key}Minute`]: minute })} width={57} selectedSize={24} otherSize={19} surface={p.clockMask} fade={p.clockFade} />
          <WheelColumn label={`Период ${clockName}`} items={PERIODS} value={clockHour >= 12 ? 1 : 0} onChange={period => patch({ [clock.key]: clockHour % 12 + period * 12 })} width={57} selectedSize={24} otherSize={19} surface={p.clockMask} fade={p.clockFade} />
        </View>}
      </View>
    </Modal>
  </View>;
}
const styles = StyleSheet.create({
  segmentClip: { height: 40, marginHorizontal: 17, overflow: 'hidden' },
  segments: { flexDirection: 'row', gap: 5 },
  segment: { minWidth: 108, height: 40, borderRadius: 23, borderWidth: 1, borderColor: p.segmentBorder, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  segmentOn: { backgroundColor: c.blue, borderColor: c.blue },
  durationWheel: { position: 'absolute', top: 66, left: 25, right: 25, height: p.durationHeight, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  unit: { marginTop: 88, marginLeft: -12 },
  durationNote: { position: 'absolute', bottom: 15, left: 0, right: 0 },
  grid: { marginTop: 15, marginHorizontal: 17, borderRadius: p.gridRadius, backgroundColor: p.scheduleGrid, overflow: 'hidden' },
  scheduleRow: { height: 66, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  line: { borderTopWidth: 1, borderColor: p.scheduleLine },
  time: { borderRadius: 23, backgroundColor: p.scheduleTime, paddingVertical: 7, paddingHorizontal: 12 },
  days: { marginTop: 12, marginHorizontal: 17, flexDirection: 'row', justifyContent: 'space-between' },
  day: { width: 39, height: 39, borderRadius: 20, borderWidth: 1, borderColor: p.segmentBorder, alignItems: 'center', justifyContent: 'center' },
  dayOn: { backgroundColor: c.ink, borderColor: c.ink },
  daysNote: { marginTop: 9 },
  popover: { position: 'absolute', width: p.clockWidth, height: p.clockHeight, borderRadius: p.clockRadius, overflow: 'hidden', flexDirection: 'row', justifyContent: 'center', gap: 12, paddingHorizontal: 12, boxShadow: p.clockShadow },
  clockHighlight: { position: 'absolute', top: 86, left: 12, right: 12, height: 34, borderRadius: 18, backgroundColor: p.scheduleTime },
});
