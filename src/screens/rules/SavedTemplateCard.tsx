import { StyleSheet, View } from 'react-native';
import { DashedBox } from '@/components/Dashed';
import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/motion';
import { SessionIcon } from '@/components/SessionIcon';
import type { SessionRule } from '@/data/rules';
import { colors, savedTemplateTheme as s } from '@/theme/tokens';
import { T } from '@/theme/typography';

export function SavedTemplateCard({ template, onAdd }: { template: SessionRule; onAdd: () => void }) {
  const time = template.meta.kind === 'schedule' ? template.meta.time.replaceAll(' ', '').replace(/(^|–)0(?=\d:)/g, '$1') : template.meta.text.replace('Осталось ', '');
  const description = template.meta.kind === 'schedule' ? `${template.meta.days || 'По расписанию'}\n${template.meta.time === 'Весь день' ? 'Весь день.' : `с ${template.meta.time.replace(/(^| – )0(?=\d:)/g, '$1').replace(' – ', ' до ')}.`}` : `Блокировка на ${time}\nс этой минуты.`;
  return <DashedBox radius={s.radius} color={colors.dashTpl} style={styles.card}>
    <View style={styles.pill}><Icon name="lock-fill" width={13} height={14} color={colors.black} /><T size={12} weight={400} ls={0}>{time}</T></View>
    <View style={styles.zap}><SessionIcon id={template.iconId || 'zap'} width={20} height={27} /></View>
    <T size={17} ls={0} numberOfLines={1} style={styles.title}>{template.title}</T>
    <T size={12.5} weight={400} ls={0} numberOfLines={3} style={styles.copy}>{description}</T>
    <PressScale accessibilityRole="button" accessibilityLabel={`Добавить шаблон ${template.title}`} onPress={onAdd} style={styles.add}><Icon name="plus" width={11} height={12} color={colors.black} /><T size={14} ls={0}>Добавить</T></PressScale>
  </DashedBox>;
}
const styles = StyleSheet.create({
  card: { width: s.width, height: s.height, borderRadius: s.radius, backgroundColor: colors.white, marginRight: 10.667 },
  pill: { position: 'absolute', left: 12, top: 13, height: 23, paddingHorizontal: 9, borderRadius: s.pillRadius, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: s.pill, boxShadow: s.pillShadow },
  zap: { position: 'absolute', left: 12, top: 86, width: 20, height: 27 },
  title: { position: 'absolute', left: 12, right: 8, top: 112 },
  copy: { position: 'absolute', left: 12, right: 8, top: 138, lineHeight: 15.333 },
  add: { position: 'absolute', left: 11, right: 11, bottom: 11, height: 33, borderRadius: s.buttonRadius, backgroundColor: colors.white, boxShadow: s.buttonShadow, flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'center' },
});
