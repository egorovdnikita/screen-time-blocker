import { box } from '@/theme/box-ui.generated';
import { QrPass } from './QrPass';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialBlur } from '@/components/MaterialBlur';
import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/motion';
import { art } from '@/data/art';
import type { UnlockSettings } from '@/data/session';
import { colors, unlockMethodTheme as m } from '@/theme/tokens';
import { T } from '@/theme/typography';

export function ScanMethodSettings({
  type,
  onChange,
}: {
  type: UnlockSettings['scanType'];
  onChange: (type: UnlockSettings['scanType']) => void;
}) {
  const [pass, setPass] = useState(false);
  const [menu, setMenu] = useState(false);
  const nfc = type === 'nfc';
  return (
    <>
      <View pointerEvents="none" style={styles.illustration}>
        <Image source={nfc ? art.scanNfcDevice : art.scanQrDevice} style={{ width: 248, height: 218 }} />
      </View>
      {nfc ? (
        <T
          size={box.fontSize['14']}
          weight={box.fontWeight['semibold']}
          color={m.scanHint}
          ls={0}
          center
          style={styles.nfcCopy}
        >
          Сканируйте{' '}
          <T size={box.fontSize['14']} weight={box.fontWeight['black']} color={m.scanLink} ls={0}>
            AirTag
          </T>
        </T>
      ) : (
        <T
          size={box.fontSize['12']}
          weight={box.fontWeight['semibold']}
          color={colors.white}
          ls={0}
          center
          style={styles.scanCopy}
        >
          Сканируйте для входа
        </T>
      )}
      <View style={styles.options}>
        <PressScale
          accessibilityRole="button"
          accessibilityLabel="Тип сканирования"
          accessibilityState={{ expanded: menu }}
          onPress={() => setMenu(v => !v)}
          style={[styles.option, styles.first]}
        >
          <T size={15} weight={box.fontWeight['regular']} ls={0}>
            Сканирование
          </T>
          <T size={15} color={m.scanValue} ls={0} style={{ marginLeft: 'auto' }}>
            {nfc ? 'NFC-метка' : 'QR-код'}
          </T>
          <Icon name="session-up-down" width={12} height={16} color={m.scanChevron} />
        </PressScale>
        <PressScale
          accessibilityRole="button"
          onPress={() => setPass(true)}
          disabled={nfc}
          accessibilityLabel={nfc ? 'Сканирование NFC недоступно в Expo Go' : 'Экспорт QR-кода'}
          accessibilityState={{ disabled: nfc }}
          style={styles.option}
        >
          <T size={15} weight={box.fontWeight['regular']} ls={0}>
            {nfc ? 'Метка' : 'Экспорт QR-кода'}
          </T>
          {nfc ? (
            <View style={styles.pill}>
              <T size={box.fontSize['12']} color={m.scanWarning} ls={0}>
                ❕ Сканировать
              </T>
            </View>
          ) : (
            <Icon name="chevron-right" width={10} height={15} color={m.scanChevron} style={{ marginLeft: 'auto' }} />
          )}
        </PressScale>
      </View>
      {pass && <QrPass onClose={() => setPass(false)} />}
      {nfc && (
        <T size={box.fontSize['12']} weight={box.fontWeight['semibold']} color={m.scanNote} ls={0} style={styles.note}>
          Где найти NFC-метку? ↗
        </T>
      )}
      {menu && (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Закрыть типы сканирования"
            onPress={() => setMenu(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.menu} accessibilityRole="menu">
            <MaterialBlur
              pointerEvents="none"
              blurPx={12}
              nativeIntensity={28}
              tint="light"
              style={[StyleSheet.absoluteFill, { borderRadius: m.scanMenuRadius }]}
            />
            {(['qr', 'nfc'] as const).map(value => (
              <PressScale
                key={value}
                accessibilityRole="menuitem"
                accessibilityLabel={value === 'qr' ? 'QR-код' : 'NFC-метка'}
                onPress={() => {
                  setMenu(false);
                  onChange(value);
                }}
                style={styles.menuRow}
              >
                <Icon name={value === 'qr' ? 'scan-qr' : 'scan-nfc'} width={20} height={20} color={colors.black} />
                <T size={17} weight={box.fontWeight['regular']} ls={0}>
                  {value === 'qr' ? 'QR-код' : 'NFC-метка'}
                </T>
              </PressScale>
            ))}
          </View>
        </>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  illustration: { position: 'absolute', left: 52, top: 58, width: 248, height: 218 },
  scanCopy: { position: 'absolute', top: 208, left: 50, right: 50, lineHeight: box.lineHeight['16'] },
  nfcCopy: { position: 'absolute', top: 90, left: 50, right: 50, lineHeight: box.lineHeight['18'] },
  options: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 280,
    height: 102,
    borderRadius: m.gridRadius,
    backgroundColor: m.scanGrid,
    overflow: 'hidden',
  },
  option: {
    height: 51,
    paddingHorizontal: box.spacing['16'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: box.spacing['8'],
  },
  first: { borderBottomWidth: 1, borderBottomColor: m.scanLine },
  pill: {
    marginLeft: 'auto',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: m.scanPillRadius,
    backgroundColor: m.scanWarningFill,
  },
  note: { position: 'absolute', top: 397, left: 16, right: 16, lineHeight: box.lineHeight['16'] },
  menu: {
    position: 'absolute',
    top: 213,
    right: 32,
    width: 249,
    height: 103,
    paddingVertical: 9,
    paddingHorizontal: 27,
    borderRadius: m.scanMenuRadius,
    backgroundColor: m.scanMenu,
    borderWidth: 1,
    borderColor: m.scanMenuBorder,
    boxShadow: m.scanMenuShadow,
    overflow: 'hidden',
  },
  menuRow: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: box.spacing['14'],
    position: 'relative',
    zIndex: 1,
  },
});
