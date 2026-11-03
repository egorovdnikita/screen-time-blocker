import { View, StyleSheet } from 'react-native';
import { groupSummary, hasGroupExtras, selectedWebsites, type AppGroupDraft } from '@/data/appGroup';
import { colors, appGroupTheme as c } from '@/theme/tokens';
import { T } from '@/theme/typography';
import { Icon } from './Icon';
import { SessionApps } from './SessionPrimitives';

export function GroupExtraGlyphs({ group, sitesFirst = false }: { group: AppGroupDraft; sitesFirst?: boolean }) {
  const sites = selectedWebsites(group).length;
  const entries = [
    ...(group.adultContent ? [<View key="adult" style={styles.badge}><T size={7} weight={600} color={colors.white} ls={0}>18</T></View>] : []),
    ...(group.purchases ? [<View key="purchases" style={styles.badge}><T size={7} weight={600} color={colors.white} ls={0}>$</T></View>] : []),
    ...(group.installation ? [<Icon key="installation" name="group-install" width={14} height={14} color={colors.black} />] : []),
  ];
  const site = sites ? <View key="sites" style={styles.inline}><Icon name="group-globe" width={14} height={14} color={colors.black} /><T size={12} weight={600} ls={0}>{sites}</T></View> : null;
  if (site) { if (sitesFirst) entries.unshift(site); else entries.push(site); }
  if (group.categories.length) entries.unshift(<View key="categories" style={styles.inline}><Icon name="apps-grid" width={13} height={13} color={colors.black} /><T size={12} weight={600} ls={0}>{group.categories.length}</T></View>);
  return <View style={styles.glyphs}>{entries.map((entry, i) => <View key={entry.key} style={styles.inline}>{i > 0 && <T size={12} weight={600} ls={0}>·</T>}{entry}</View>)}</View>;
}
export function AppGroupSummary({ group }: { group: AppGroupDraft }) {
  if (!hasGroupExtras(group)) return <SessionApps selected={group.selectedApps} />;
  return <View accessibilityLabel={`Группа: ${groupSummary(group)}`} style={styles.root}>
    {group.mode === 'except' && <T size={10} weight={600} ls={0}>{group.selectedApps.some(Boolean) || group.categories.length ? 'Кроме' : 'Все приложения'}</T>}
    {group.selectedApps.some(Boolean) && <><SessionApps selected={group.selectedApps} bare reverse={false} /><T size={12} color={c.secondary} ls={0}>·</T></>}
    <GroupExtraGlyphs group={group} sitesFirst />
  </View>;
}
const styles = StyleSheet.create({
  root: { height: 27, maxWidth: 198, paddingHorizontal: 5, borderRadius: c.badgeRadius, backgroundColor: c.badge, flexDirection: 'row', alignItems: 'center', gap: 5.5, overflow: 'hidden' },
  glyphs: { flexDirection: 'row', alignItems: 'center', gap: 5.5 }, inline: { flexDirection: 'row', alignItems: 'center', gap: 5.5 }, badge: { width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.black },
});
