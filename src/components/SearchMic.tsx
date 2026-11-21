import { Icon } from '@/components/Icon';
import { useAppState } from '@/state/app';

// Микрофон в поиске приложений. Голосового ввода нет, поэтому в реальном режиме иконка скрыта
// (аудит 2026-11-21); в демо остаётся как в макете.
export function SearchMic({ color }: { color: string }) {
  const { live } = useAppState();
  if (live) return null;
  return <Icon name="group-microphone" width={20} height={23} color={color} />;
}
