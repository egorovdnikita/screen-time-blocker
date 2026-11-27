import { box } from '@/theme/box-ui.generated';
import { NotificationSettings } from './NotificationSettings';
import { LanguageMenu } from './LanguageMenu';
import { useAppState } from '@/state/app';
import { InterfaceSettings } from './InterfaceSettings';
import { SheetScrollView as ScrollView } from '@/components/SheetModal';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, type IconName } from '@/components/Icon';
import { PressScale } from '@/components/motion';
import { T } from '@/theme/typography';
import { colors, mainSettingsTheme as c } from '@/theme/tokens';
import { SettingsStack } from './SettingsStack';
import { ScreenTimeSettings } from './ScreenTimeSettings';
import { RuleSettings } from '../rules/RuleSettings';
import { HelpFeedback } from './HelpFeedback';
import { DataSettings } from './DataSettings';
export function MainSettings({
  onClose,
  initialChild = null,
}: {
  onClose: () => void;
  initialChild?: 'time' | 'rules' | 'help' | 'interface' | 'notifications' | 'language' | 'data' | null;
}) {
  const app = useAppState();
  const [child, setChild] = useState<
    'time' | 'rules' | 'help' | 'interface' | 'notifications' | 'language' | 'data' | null
  >(null);
  const rows: { title: string; icon: IconName; height: number; onPress?: () => void }[] = [
    { title: 'Экранное время', icon: 'settings-phone', height: 53.333, onPress: () => setChild('time') },
    { title: 'Правила', icon: 'lock-keyhole', height: 53.333, onPress: () => setChild('rules') },
    { title: 'Интерфейс', icon: 'settings-palette', height: 54.667, onPress: () => setChild('interface') },
    { title: 'Уведомления', icon: 'settings-bell', height: 53.333, onPress: () => setChild('notifications') },
    // Перевода нет, в меню выбирается только русский: в реальном режиме строка скрыта.
    ...(app.live
      ? []
      : [{ title: 'Язык', icon: 'settings-globe' as IconName, height: 57.333, onPress: () => setChild('language') }]),
  ];
  return (
    <SettingsStack
      onShown={() => {
        if (initialChild) setChild(initialChild);
      }}
      root
      radius={44}
      surface={c.surface}
      offsetTop={59}
      onClose={onClose}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: box.spacing['44'], paddingBottom: 68.667 }}
      >
        <T
          size={box.fontSize['20']}
          color={c.ink}
          center
          ls={0}
          style={{ marginHorizontal: box.spacing['20'], lineHeight: 26 }}
        >
          Настройки
        </T>
        <View style={styles.account}>
          <View style={styles.avatar}>
            <T size={18} color={c.avatar} ls={0}>
              {app.profileName.slice(0, 2).toUpperCase()}
            </T>
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <T size={box.fontSize['24']} color={c.ink} ls={0} style={{ lineHeight: 27 }}>
                {app.profileName}
              </T>
              <Icon name="pencil" width={15} height={15} color={c.caption} />
            </View>
            {!app.live && (
              <T
                size={box.fontSize['12']}
                weight={box.fontWeight['semibold']}
                color={c.caption}
                ls={0.15}
                style={{ lineHeight: box.lineHeight['16'] }}
              >
                Аккаунт screen-time-blocker
              </T>
            )}
          </View>
        </View>
        {!app.live && (
          <View style={styles.plan}>
            <T size={13} color={c.section} ls={0} style={{ position: 'absolute', left: 20, top: 18 }}>
              Текущий план
            </T>
            <T
              size={box.fontSize['20']}
              color={c.planName}
              ls={0.1}
              style={{ position: 'absolute', left: 20, top: 39 }}
            >
              Годовой план
            </T>
            <View
              style={{
                position: 'absolute',
                left: 20,
                top: 68,
                width: box.size['16'],
                height: box.size['16'],
                borderRadius: box.radius['8'],
                backgroundColor: c.money,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <T size={11} color={colors.white} ls={0}>
                ₽
              </T>
            </View>
            <T
              size={13}
              weight={box.fontWeight['medium']}
              color={c.planNote}
              ls={0}
              style={{ position: 'absolute', left: 42, top: 70 }}
            >
              Пробный период активен
            </T>
            <View accessibilityState={{ disabled: true }} style={styles.manage}>
              <T size={box.fontSize['14']} color={c.ink} ls={0}>
                Управлять
              </T>
            </View>
          </View>
        )}
        <PressScale
          accessibilityRole="button"
          accessibilityLabel="Помощь и отзывы"
          onPress={() => setChild('help')}
          style={[styles.help, { marginTop: app.live ? 18 : 32.334 }]}
        >
          <Icon
            name="settings-help"
            width={19}
            height={19}
            color={colors.white}
            style={{ position: 'absolute', left: 18, top: 24 }}
          />
          <T
            size={box.fontSize['16']}
            color={colors.white}
            ls={0}
            style={{ position: 'absolute', left: 52, top: 14, lineHeight: 21 }}
          >
            Помощь и отзывы
          </T>
          <T
            size={13}
            weight={box.fontWeight['regular']}
            variant="text"
            color={colors.white}
            ls={0}
            style={{ position: 'absolute', left: 52, top: 34, lineHeight: box.lineHeight['18'] }}
          >
            Вопросы и обратная связь
          </T>
          <Icon
            name="chevron-right"
            width={10}
            height={14}
            color={colors.white}
            style={{ position: 'absolute', right: 16, top: 26 }}
          />
        </PressScale>
        <T
          size={box.fontSize['20']}
          color={c.section}
          ls={0}
          style={{ marginLeft: box.spacing['20'], marginTop: 30.999, lineHeight: 26 }}
        >
          Основные
        </T>
        <View style={styles.rows}>
          {rows.map((row, index) => (
            <PressScale
              key={row.title}
              accessibilityRole="button"
              accessibilityLabel={`Общие настройки: ${row.title}`}
              disabled={!row.onPress}
              accessibilityState={{ disabled: !row.onPress }}
              onPress={row.onPress}
              style={{
                height: row.height,
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomColor: c.separator,
                borderBottomWidth: index < rows.length - 1 ? 1 : 0,
              }}
            >
              <Icon
                name={row.icon}
                width={23}
                height={24}
                color={c.rowIcon}
                style={{ marginLeft: 15, marginRight: box.spacing['10'] }}
              />
              <T size={14.25} weight={box.fontWeight['regular']} variant="text" color={c.ink} ls={0}>
                {row.title}
              </T>
              {row.title === 'Язык' ? (
                <>
                  <T
                    size={19}
                    weight={box.fontWeight['regular']}
                    ls={0}
                    style={{ marginLeft: 'auto', marginRight: 21 }}
                  >
                    🇷🇺
                  </T>
                  <Icon
                    name="updown"
                    width={13}
                    height={17}
                    color={c.rowIcon}
                    style={{ marginRight: box.spacing['18'] }}
                  />
                </>
              ) : (
                <Icon
                  name="activity-row-chevron"
                  width={13}
                  height={20}
                  style={{ marginLeft: 'auto', marginRight: box.spacing['16'] }}
                />
              )}
            </PressScale>
          ))}
        </View>
        {/* APP-26: в макете нет — отдельная строка под «Основными», в стиле общих строк. */}
        <PressScale
          accessibilityRole="button"
          accessibilityLabel="Общие настройки: Данные на устройстве"
          onPress={() => setChild('data')}
          style={styles.data}
        >
          <Icon
            name="archive"
            width={23}
            height={24}
            color={c.rowIcon}
            style={{ marginLeft: 15, marginRight: box.spacing['10'] }}
          />
          <T size={14.25} weight={box.fontWeight['regular']} variant="text" color={c.ink} ls={0}>
            Данные на устройстве
          </T>
          <Icon
            name="activity-row-chevron"
            width={13}
            height={20}
            style={{ marginLeft: 'auto', marginRight: box.spacing['16'] }}
          />
        </PressScale>
      </ScrollView>
      {child === 'time' && <ScreenTimeSettings nested onClose={() => setChild(null)} />}
      {child === 'rules' && <RuleSettings nested onClose={() => setChild(null)} />}
      {child === 'interface' && <InterfaceSettings onClose={() => setChild(null)} />}
      {child === 'help' && <HelpFeedback onClose={() => setChild(null)} />}
      {child === 'notifications' && <NotificationSettings onClose={() => setChild(null)} />}
      {child === 'language' && <LanguageMenu onClose={() => setChild(null)} />}
      {child === 'data' && <DataSettings onClose={() => setChild(null)} />}
    </SettingsStack>
  );
}
const styles = StyleSheet.create({
  account: {
    marginHorizontal: box.spacing['20'],
    marginTop: 50,
    height: 53,
    flexDirection: 'row',
    alignItems: 'center',
    gap: box.spacing['8'],
  },
  avatar: {
    width: box.size['52'],
    height: box.size['52'],
    borderRadius: 26,
    backgroundColor: colors.white,
    boxShadow: c.avatarShadow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plan: {
    marginHorizontal: box.spacing['20'],
    marginTop: box.spacing['18'],
    height: 104.333,
    borderRadius: 25,
    backgroundColor: colors.white,
    boxShadow: c.planShadow,
  },
  manage: {
    position: 'absolute',
    right: 20,
    top: 37,
    height: box.size['36'],
    borderRadius: box.radius['20'],
    paddingHorizontal: box.spacing['16'],
    backgroundColor: colors.white,
    boxShadow: c.manageShadow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  help: {
    marginHorizontal: box.spacing['20'],
    height: 66.667,
    borderRadius: box.radius['20'],
    backgroundColor: c.help,
    boxShadow: c.helpShadow,
  },
  rows: {
    marginHorizontal: box.spacing['20'],
    marginTop: 11,
    borderRadius: box.radius['20'],
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  data: {
    marginHorizontal: box.spacing['20'],
    marginTop: 23.667,
    height: 53.333,
    borderRadius: box.radius['20'],
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
