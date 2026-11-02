import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PlainSettingsSheet } from '@/components/PlainSettingsSheet';
import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/motion';
import { FlowSwitch } from '@/components/SessionPrimitives';
import { T } from '@/theme/typography';
import { colors, ruleSettingsTheme as c } from '@/theme/tokens';
import { AppGroupSheet } from '../session/AppGroupSheet';
import { NamedAppGroups } from './NamedAppGroups';
export function RuleSettings({ onClose }: { onClose: () => void }) {
  const [groups, setGroups] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  return <PlainSettingsSheet title="Настройки" onClose={onClose}>
    <T size={20} color={c.section} ls={0} style={{ position: 'absolute', top: 101, left: 20, lineHeight: 25 }}>Персонализация</T>
    <View style={styles.list}>{[
      { title: 'Группы приложений', text: 'Списки для разных правил.', icon: 'rule-settings-groups', height: 66.667, onPress: () => setGroups(true) },
      { title: 'Экраны блокировки', text: 'Что показывать поверх\nзаблокированных приложений.', icon: 'rule-settings-shield', height: 85, onPress: undefined },
      { title: 'Квоты', text: 'Лимит отсрочек и обновлений.', icon: 'rule-settings-quotas', height: 66.667, onPress: undefined },
    ].map((row, index) => <PressScale key={row.title} accessibilityRole="button" accessibilityLabel={row.title} disabled={!row.onPress} accessibilityState={{ disabled: !row.onPress }} onPress={row.onPress} style={[styles.row, { height: row.height, borderBottomWidth: index < 2 ? 1 : 0 }]}><Icon name={row.icon as 'rule-settings-groups'} width={20} height={21} /><View style={{ flex: 1 }}><T size={14.25} weight={400} variant="display" ls={0}>{row.title}</T><T size={13} weight={400} variant="display" color={c.caption} ls={0} style={{ lineHeight: 17 }}>{row.text}</T></View><Icon name="activity-row-chevron" width={10} height={14} /></PressScale>)}</View>
    <PressScale accessibilityRole="button" accessibilityLabel="Другие настройки правил" accessibilityState={{ expanded: advanced }} onPress={() => setAdvanced(x => !x)} style={styles.advanced}><Icon name="chevron-down-section" width={10} height={10} color={advanced ? c.section : c.collapsed} style={{ transform: [{ rotate: advanced ? '0deg' : '-90deg' }] }} /><T size={20} color={advanced ? c.section : c.collapsed} ls={0}>Другие настройки</T></PressScale>
    {advanced && <View style={styles.legacy}><Icon name="rule-settings-legacy" width={20} height={21} /><View style={{ flex: 1 }}><T size={14} weight={400} variant="display" ls={0}>Старые лимиты входов</T><T size={12.5} weight={400} variant="display" color={c.caption} ls={0}>Через Быстрые команды Apple</T></View><FlowSwitch label="Старые лимиты входов" value={false} disabled onChange={() => {}} /></View>}
    {groups && <NamedAppGroups renderEditor={props => <AppGroupSheet {...props} purpose="named" />} onClose={() => setGroups(false)} />}
  </PlainSettingsSheet>;
}
const styles = StyleSheet.create({ list: { position: 'absolute', left: 20, right: 20, top: 137.333, height: 218.333, borderRadius: 24, overflow: 'hidden', backgroundColor: colors.white }, row: { paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomColor: c.line }, advanced: { position: 'absolute', left: 20, top: 390.333, flexDirection: 'row', alignItems: 'center', gap: 8 }, legacy: { position: 'absolute', top: 425.333, left: 20, right: 20, height: 66.667, borderRadius: 24, backgroundColor: colors.white, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 } });
