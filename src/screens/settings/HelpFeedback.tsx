import { box } from '@/theme/box-ui.generated';
import { EmergencyMode } from './EmergencyMode';
import { SheetScrollView as ScrollView } from '@/components/SheetModal';
import { useState } from 'react';
import { PressScale } from '@/components/motion';
import { Troubleshoot } from './Troubleshoot';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { Icon, type IconName } from '@/components/Icon';
import { art } from '@/data/art';
import { useAppState } from '@/state/app';
import { T } from '@/theme/typography';
import { colors, mainSettingsTheme as c } from '@/theme/tokens';
import { SettingsStack } from './SettingsStack';
const topics = [
  'Ошибки и проблемы',
  'Первые шаги в screen-time-blocker',
  'Дополнительные возможности',
  'Строгий режим',
  'Команды, фокус и виджеты',
  'Удалить screen-time-blocker',
];
const images = [art.helpTopic0, art.helpTopic1, art.helpTopic2, art.helpTopic3, art.helpTopic4, art.helpTopic5];
export function HelpFeedback({ onClose }: { onClose: () => void }) {
  const { live } = useAppState();
  const [troubleshoot, setTroubleshoot] = useState(false);
  const [emergency, setEmergency] = useState(false);
  return (
    <SettingsStack onClose={onClose} surface={c.surface} radius={44}>
      <T
        size={box.fontSize['20']}
        color={c.ink}
        center
        ls={0}
        style={{ position: 'absolute', left: 20, right: 20, top: 44, lineHeight: 26 }}
      >
        Помощь и отзывы
      </T>
      <ScrollView
        accessibilityLabel="Содержание справки"
        showsVerticalScrollIndicator={false}
        style={{ position: 'absolute', top: 90, left: 0, right: 0, bottom: 0 }}
        contentContainerStyle={{ paddingTop: box.spacing['10'], paddingBottom: live ? 40 : 128 }}
      >
        <T size={box.fontSize['20']} color={c.section} ls={0} style={{ marginLeft: box.spacing['20'], lineHeight: 26 }}>
          Найдите в справке
        </T>
        <View style={styles.topics}>
          {topics
            .filter((_, index) => !live || index === 0)
            .map((title, index) => (
              <PressScale
                accessibilityRole="button"
                accessibilityLabel={title}
                disabled={index !== 0}
                accessibilityState={{ disabled: index !== 0 }}
                onPress={() => setTroubleshoot(true)}
                key={title}
                style={styles.topic}
              >
                <Image
                  source={images[index]}
                  contentFit="contain"
                  style={{ width: box.size['24'], height: box.size['24'] }}
                />
                <T size={14.25} weight={box.fontWeight['regular']} variant="text" color={c.ink} ls={0}>
                  {title}
                </T>
                <Icon
                  name="activity-row-chevron"
                  width={13}
                  height={20}
                  style={{ marginLeft: 'auto', marginRight: box.spacing['2'] }}
                />
              </PressScale>
            ))}
        </View>
        <T
          size={box.fontSize['20']}
          color={c.section}
          ls={0}
          style={{ marginTop: 35.667, marginLeft: box.spacing['20'], lineHeight: 26 }}
        >
          Дополнительно
        </T>
        <View style={styles.further}>
          {!live && (
            <>
              <HelpRow title="Все статьи (+75)" icon="help-articles" />
              <HelpRow title="Предложить идею" icon="help-idea" />
            </>
          )}
          <HelpRow
            onPress={() => setEmergency(true)}
            title="Экстренный режим"
            icon="help-emergency"
            description="Нужно отключить строгий режим в экстренной ситуации? Нажмите здесь."
          />
        </View>
        {!live && (
          <>
            <View style={styles.contact}>
              <HelpRow title="Связаться с нами" icon="help-contact" />
            </View>
            <T
              size={11.5}
              weight={box.fontWeight['semibold']}
              color={c.helpNote}
              ls={0}
              style={{
                marginTop: box.spacing['8'],
                marginHorizontal: box.spacing['20'],
                lineHeight: box.lineHeight['14'],
              }}
            >
              Перед тем как написать нам, загляните в статьи. Там уже есть ответы на большинство вопросов!
            </T>
          </>
        )}
      </ScrollView>
      {emergency && <EmergencyMode onClose={() => setEmergency(false)} />}
      {troubleshoot && <Troubleshoot onClose={() => setTroubleshoot(false)} />}
    </SettingsStack>
  );
}
function HelpRow({
  title,
  icon,
  description,
  onPress,
}: {
  title: string;
  icon: IconName;
  description?: string;
  onPress?: () => void;
}) {
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      disabled={!onPress}
      accessibilityState={{ disabled: !onPress }}
      style={{
        height: description ? 84 : 52.667,
        paddingTop: description ? 4 : 0,
        paddingLeft: 15,
        paddingRight: box.spacing['16'],
        flexDirection: 'row',
        alignItems: 'center',
        gap: 11,
        borderBottomWidth: description ? 0 : 1,
        borderBottomColor: c.separator,
      }}
    >
      <Icon name={icon} width={22} height={23} color={c.rowIcon} />
      <View style={{ flex: 1 }}>
        <T
          size={14.25}
          weight={box.fontWeight['regular']}
          variant="text"
          color={c.ink}
          ls={0}
          style={{ lineHeight: box.lineHeight['20'] }}
        >
          {title}
        </T>
        {description && (
          <T
            size={13}
            weight={box.fontWeight['regular']}
            variant="text"
            color={c.helpNote}
            ls={0}
            style={{ lineHeight: 17, marginTop: box.spacing['2'] }}
          >
            {description}
          </T>
        )}
      </View>
      <Icon name="activity-row-chevron" width={13} height={20} />
    </PressScale>
  );
}
const styles = StyleSheet.create({
  topics: { marginTop: 11.333, marginHorizontal: box.spacing['20'], gap: box.spacing['8'] },
  topic: {
    height: box.size['56'],
    borderRadius: box.radius['20'],
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: box.spacing['14'],
    paddingRight: box.spacing['14'],
    gap: box.spacing['10'],
  },
  further: {
    marginTop: 7,
    marginHorizontal: box.spacing['20'],
    borderRadius: box.radius['20'],
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  contact: {
    marginTop: 32.667,
    marginHorizontal: box.spacing['20'],
    height: box.size['52'],
    borderRadius: box.radius['20'],
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
});
