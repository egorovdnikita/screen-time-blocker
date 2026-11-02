import { cloneAppGroup, countLabel, groupSummary, type AppGroupDraft } from './appGroup';
export type NamedAppGroup = { id: string; title: string; group: AppGroupDraft };
export const cloneNamedGroup = (item: NamedAppGroup): NamedAppGroup => ({ ...item, group: cloneAppGroup(item.group) });
export const emptyNamedGroup = (): AppGroupDraft => ({ mode: 'only', selectedApps: [false, false, false], categories: [], adultContent: false, purchases: false, installation: false, websites: [] });
export function namedGroupSummary(group: AppGroupDraft) {
  if (group.mode === 'only' && !group.selectedApps.some(Boolean) && group.categories.length && !group.websites.some(site => site.selected) && !group.adultContent && !group.purchases && !group.installation) return `Блокируется: ${countLabel(group.categories.length, 'категория', 'категории', 'категорий')}`;
  return groupSummary(group);
}

export const newNamedGroup = (): NamedAppGroup => ({ id: `group-${Date.now()}`, title: 'Группа', group: emptyNamedGroup() });
