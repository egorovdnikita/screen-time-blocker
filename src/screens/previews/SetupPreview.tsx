import { box } from '@/theme/box-ui.generated';
import { ActivityIndicator } from 'react-native';
import { PlainSettingsSheet } from '@/components/PlainSettingsSheet';
import { PressScale } from '@/components/motion';
import { remainingTheme as c, colors } from '@/theme/tokens';
import { T } from '@/theme/typography';
// Состояние107 — отдельный предпросмотр, не имитация выдачи разрешения Screen Time.
export function SetupPreview({ onClose }: { onClose: () => void }) {
  return (
    <PlainSettingsSheet title="1 приложение" top={69} surface={c.setup} onClose={onClose}>
      <T
        size={box.fontSize['12']}
        weight={box.fontWeight['semibold']}
        color={c.setupInk}
        ls={0}
        center
        style={{ position: 'absolute', top: 363, left: 20, right: 20, lineHeight: box.lineHeight['16'] }}
      >
        Отлично! Всё настраиваем…
      </T>
      <ActivityIndicator
        color={c.setupInk}
        style={{ position: 'absolute', top: 396, alignSelf: 'center', width: box.size['20'], height: box.size['20'] }}
      />
      <PressScale
        accessibilityRole="button"
        accessibilityLabel="Настройка приложения: продолжить"
        disabled
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: 39,
          height: box.size['60'],
          borderRadius: box.radius['32'],
          backgroundColor: colors.chevronCompact,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <T size={17} color={colors.white}>
          Продолжить
        </T>
      </PressScale>
    </PlainSettingsSheet>
  );
}
