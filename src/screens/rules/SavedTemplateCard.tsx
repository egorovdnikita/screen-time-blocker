import { useState } from 'react';
import { TemplateDetails } from './SessionDetails';
import { routineReward } from '@/data/routine';
import { daysLabel } from '@/data/timeLimit';
import { art } from '@/data/art';
import { durationLabel } from '@/data/session';
import { Image, StyleSheet, View } from 'react-native';
import { DashedBox } from '@/components/Dashed';
import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/motion';
import { SessionIcon } from '@/components/SessionIcon';
import type { LimitRule, RoutineRule, SessionRule } from '@/data/rules';
import { colors, savedTemplateTheme as s } from '@/theme/tokens';
import { T } from '@/theme/typography';

export function SavedTemplateCard({ template, onAdd }: { template: SessionRule | LimitRule | RoutineRule; onAdd: () => void }) {
  const [details, setDetails] = useState(false);
  const routine = !('emoji' in template);
  const limit = !routine && 'value' in template;
  const time = routine ? durationLabel(template.configuration ? routineReward(template.configuration) : 5) : limit ? durationLabel(template.configuration?.minutes ?? 15) : template.meta.kind === 'schedule' ? template.meta.time.replaceAll(' ', '').replace(/(^|–)0(?=\d:)/g, '$1') : template.meta.text.replace('Осталось ', '');
  const description = routine ? `${template.configuration?.earningMode === 'completion' ? 'За выполнение привычек' : 'За привычки'}\n${template.configuration ? daysLabel(template.configuration.days) : 'Каждый день'}.` : limit ? `После ${time}\n${template.meta.kind === 'schedule' ? template.meta.days || 'Каждый день' : 'Каждый день'}.` : template.meta.kind === 'schedule' ? `${template.meta.days || 'По расписанию'}\n${template.meta.time === 'Весь день' ? 'Весь день.' : `с ${template.meta.time.replace(/(^| – )0(?=\d:)/g, '$1').replace(' – ', ' до ')}.`}` : `Блокировка на ${time}\nс этой минуты.`;
  return <><DashedBox radius={s.radius} color={colors.dashTpl} style={styles.card}>
    {!routine && !limit && <PressScale accessibilityRole="button" accessibilityLabel={`Детали шаблона ${template.title}`} onPress={() => setDetails(true)} style={StyleSheet.absoluteFill}>{null}</PressScale>}
    <View pointerEvents="none" style={styles.pill}><Icon name="lock-fill" width={13} height={14} color={colors.black} /><T size={12} weight={400} ls={0}>{time}</T></View>
    <View pointerEvents="none" style={styles.zap}>{routine ? <Image source={art.routinePlant} style={{ width: 20, height: 27 }} /> : limit ? <Image source={art.timeLimitHourglass} style={{ width: 20, height: 27 }} /> : <SessionIcon id={template.iconId || 'zap'} width={20} height={27} />}</View>
    <T pointerEvents="none" size={17} ls={0} numberOfLines={1} style={styles.title}>{template.title}</T>
    <T pointerEvents="none" size={12.5} weight={400} ls={0} numberOfLines={3} style={styles.copy}>{description}</T>
    <PressScale accessibilityRole="button" accessibilityLabel={`Добавить шаблон ${template.title}`} onPress={onAdd} style={styles.add}><Icon name="plus" width={11} height={12} color={colors.black} /><T size={14} ls={0}>Добавить</T></PressScale>
  </DashedBox>{details && !routine && !limit && <TemplateDetails rule={template} onClose={() => setDetails(false)} />}</>;
}
const styles = StyleSheet.create({
  card: { width: s.width, height: s.height, borderRadius: s.radius, backgroundColor: colors.white, marginRight: 10.667 },
  pill: { position: 'absolute', left: 12, top: 13, height: 23, paddingHorizontal: 9, borderRadius: s.pillRadius, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: s.pill, boxShadow: s.pillShadow },
  zap: { position: 'absolute', left: 12, top: 86, width: 20, height: 27 },
  title: { position: 'absolute', left: 12, right: 8, top: 112 },
  copy: { position: 'absolute', left: 12, right: 8, top: 138, lineHeight: 15.333 },
  add: { position: 'absolute', left: 11, right: 11, bottom: 11, height: 33, borderRadius: s.buttonRadius, backgroundColor: colors.white, boxShadow: s.buttonShadow, flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'center' },
});
