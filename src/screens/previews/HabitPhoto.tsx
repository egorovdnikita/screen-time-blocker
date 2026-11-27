import { box } from '@/theme/box-ui.generated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { PlainSettingsSheet } from '@/components/PlainSettingsSheet';
import { PressScale } from '@/components/motion';
import { Icon } from '@/components/Icon';
import { remainingArt as art } from '@/data/remainingArt';
import { T } from '@/theme/typography';
import { remainingTheme as c, colors } from '@/theme/tokens';
export type HabitPhotoState = 'photo' | 'analyzing' | 'error' | 'good';
export function HabitPhoto({
  initial = 'photo',
  onClose,
  onEarn,
}: {
  initial?: HabitPhotoState;
  onClose: () => void;
  onEarn: () => void;
}) {
  const [state, setState] = useState(initial),
    good = state === 'good';
  const { width, height } = useWindowDimensions(),
    insets = useSafeAreaInsets();
  const sheetHeight = height - Math.max(59, insets.top);
  const cameraSize = Math.min(width - 39.667, Math.max(80, sheetHeight - 233.333 - 148.667));
  const proofSize = Math.min(282.333, Math.max(80, sheetHeight - 268.333 - 148.667));
  // Результат не вычисляется и не начисляет минуты в AppState: только демо из макетов.
  return (
    <PlainSettingsSheet title="" onClose={onClose} surface={c.photoSurface}>
      <View
        style={{
          position: 'absolute',
          top: 37,
          alignSelf: 'center',
          height: 38,
          borderRadius: box.radius['24'],
          backgroundColor: colors.white,
          paddingHorizontal: box.spacing['14'],
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
        }}
      >
        <Icon name="apps-grid" width={15} height={14} />
        <T size={14.25}>1</T>
        <Icon name="app-unlock-lock" width={15} height={18} />
        <T size={14.25}>от «Рутина»</T>
      </View>
      {!good && (
        <T
          size={14.25}
          center
          ls={0}
          style={{ position: 'absolute', top: 149, left: 15, right: 15, lineHeight: box.lineHeight['18'] }}
        >
          Чтобы выполнить привычку
        </T>
      )}
      <T
        size={good ? 28 : 27}
        center
        ls={-0.3}
        style={{ position: 'absolute', top: 168, left: 10, right: 10, lineHeight: 34 }}
      >
        {good ? 'Отлично!' : 'Подтвердите фото'}
      </T>
      {good ? (
        <View style={[styles.proof, { width: proofSize, height: proofSize }]}>
          <Image source={art.habit_proof_clean} style={StyleSheet.absoluteFill} />
          <View style={styles.success}>
            <Icon name="reflection-confirm" width={24} height={26} color={colors.white} />
          </View>
        </View>
      ) : (
        <>
          <View style={[styles.camera, { left: (width - cameraSize) / 2, width: cameraSize, height: cameraSize }]}>
            {state === 'analyzing' && (
              <View
                style={{
                  position: 'absolute',
                  top: 184,
                  left: 0,
                  right: 0,
                  height: box.size['2'],
                  backgroundColor: c.scan,
                  boxShadow: '0 0 8px 3px ' + c.proof,
                }}
              />
            )}
          </View>
          <View
            style={{
              position: 'absolute',
              top: 233.333 + cameraSize + 6.667,
              left: 60,
              right: 50,
              flexDirection: 'row',
              alignItems: 'center',
              gap: box.spacing['4'],
            }}
          >
            <Icon name="habit-photo-camera" width={12} height={11} color={c.photoHint} />
            <T size={11.75} weight={box.fontWeight['semibold']} color={c.photoHint} ls={0} numberOfLines={1}>
              Чистая комната, без беспорядка. Если это…
            </T>
          </View>
        </>
      )}
      {state === 'error' && (
        <View accessibilityRole="alert" style={styles.toast}>
          <Icon name="reflection-close" width={16} height={16} color={colors.white} />
          <T size={box.fontSize['14']} color={colors.white} ls={0} style={{ flex: 1, lineHeight: 18.333 }}>
            Фото не соответствует описанию. Попробуйте ещё раз!
          </T>
        </View>
      )}
      <PressScale
        accessibilityRole="button"
        accessibilityLabel={
          good
            ? 'Демо: получить 5 минут'
            : state === 'analyzing'
              ? 'Демо: показать результат фото'
              : 'Демо: сделать фото'
        }
        accessibilityHint="Предпросмотр макета. Камера и ИИ не подключены"
        onPress={good ? onEarn : () => setState(state === 'analyzing' ? 'good' : 'analyzing')}
        style={styles.action}
      >
        {good && <Icon name="plus" width={14} height={15} color={colors.white} />}
        <T size={box.fontSize['16']} color={colors.white} ls={0}>
          {good ? 'Получить 5мин' : state === 'analyzing' ? 'Анализируем фото…' : 'Сделать фото'}
        </T>
      </PressScale>
    </PlainSettingsSheet>
  );
}
const styles = StyleSheet.create({
  camera: { position: 'absolute', top: 233.333, borderRadius: 34, backgroundColor: colors.black, overflow: 'hidden' },
  proof: {
    position: 'absolute',
    top: 268.333,
    alignSelf: 'center',
    width: 282.333,
    height: 282.333,
    borderRadius: box.radius['28'],
    overflow: 'hidden',
  },
  success: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -24,
    marginTop: -24,
    width: box.size['48'],
    height: box.size['48'],
    borderRadius: box.radius['24'],
    backgroundColor: c.proof,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 13,
    height: 67.333,
    borderRadius: 25,
    backgroundColor: c.error,
    paddingHorizontal: box.spacing['18'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: box.spacing['16'],
  },
  action: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 41.667,
    height: box.size['60'],
    borderRadius: box.radius['32'],
    backgroundColor: c.dark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
});
