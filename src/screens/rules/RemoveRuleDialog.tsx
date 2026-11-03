import { GlassDialog } from '@/components/GlassDialog';
import { useAppState } from '@/state/app';
import { colors, refreshAlertTheme as a } from '@/theme/tokens';
import { T } from '@/theme/typography';

// APP-10: удаление блокировки и рутины, у которых нет экрана деталей. Стиль — как у удаления шаблона.
export function RemoveRuleDialog({ id, title, strict, onClose }: { id: string; title: string; strict: boolean; onClose: () => void }) {
  const app = useAppState();
  return <GlassDialog title={strict ? 'Строгий режим' : `Удалить «${title}»?`} name="удаление правила" cancelAccessibilityLabel="Отмена удаления правила" confirmLabel={strict ? 'Понятно' : 'Удалить'} height={172.667} top={352.667} radius={a.radius} blur={18} surface={a.surface} confirmColor={a.button} cancelColor={a.button} confirmInk={colors.black} titleWeight={700} fontVariant="rounded" buttonWeight={400} titleSize={16} titleTop={20} titleSide={29} buttonSide={15} buttonBottom={16} buttonRadius={28} onCancel={onClose} onConfirm={() => { if (!strict) app.deleteRule(id); onClose(); }}>
    <T size={14.25} weight={400} color={a.ink} ls={0} numberOfLines={2} style={{ position: 'absolute', left: 29, right: 29, top: 47, lineHeight: 20 }}>{strict ? 'Правило нельзя удалить. Отключите\nего в экстренном режиме.' : 'Правило будет удалено\nбез восстановления.'}</T>
  </GlassDialog>;
}
