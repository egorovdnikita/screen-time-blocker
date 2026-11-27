import { box } from '@/theme/box-ui.generated';
import { SheetScrollView as ScrollView } from '@/components/SheetModal';
import { useRef, useState, type ComponentRef } from 'react';
import { Image } from 'expo-image';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import { PlainSettingsSheet } from '@/components/PlainSettingsSheet';
import { PressScale } from '@/components/motion';
import { Icon } from '@/components/Icon';
import { searchScreenApps, type ScreenApp } from '@/data/blockScreens';
import { T } from '@/theme/typography';
import { colors, blockScreensTheme as c } from '@/theme/tokens';
export function AppScreenSearch({ onClose, onChoose }: { onClose: () => void; onChoose: (app: ScreenApp) => void }) {
  const [query, setQuery] = useState('');
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  return (
    <PlainSettingsSheet
      ink={colors.black}
      title="Поиск приложения"
      top={69}
      onShown={() => requestAnimationFrame(() => input.current?.focus())}
      surface={c.surface}
      onClose={() => {
        Keyboard.dismiss();
        onClose();
      }}
    >
      {close => (
        <KeyboardAvoidingView
          pointerEvents="box-none"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={[styles.field, !!query && { borderColor: c.searchBorder }]}>
            <Icon name="screen-search-magnifier" width={20} height={21} />
            <TextInput
              ref={input}
              accessibilityLabel="Поиск приложения для экрана"
              value={query}
              onChangeText={setQuery}
              placeholder="Название приложения"
              placeholderTextColor={c.inputPlaceholder}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={() => input.current?.blur()}
              style={{ flex: 1, height: 50, padding: 0, fontSize: 14.25, color: colors.black, outlineWidth: 0 }}
            />
            {!!query && (
              <PressScale
                accessibilityRole="button"
                accessibilityLabel="Очистить поиск экрана"
                onPress={() => setQuery('')}
              >
                <Icon name="reflection-close" width={15} height={15} color={c.inputPlaceholder} />
              </PressScale>
            )}
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1, marginTop: 177, marginHorizontal: box.spacing['20'], marginBottom: box.spacing['24'] }}
            contentContainerStyle={{ borderRadius: box.radius['20'], overflow: 'hidden' }}
            showsVerticalScrollIndicator={false}
          >
            {searchScreenApps(query).map((item, index, all) => (
              <PressScale
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`Создать экран приложения ${item.title}`}
                onPress={() => {
                  Keyboard.dismiss();
                  close(() => onChoose(item));
                }}
                style={[styles.row, { borderBottomWidth: index < all.length - 1 ? 1 : 0 }]}
              >
                <Image
                  source={item.image}
                  contentFit="contain"
                  style={{ width: box.size['24'], height: box.size['24'] }}
                />
                <T size={14.25} weight={box.fontWeight['regular']} variant="display" ls={0} style={{ flex: 1 }}>
                  {item.title}
                </T>
                <Icon name="plus" width={14} height={14} color={c.caption} />
              </PressScale>
            ))}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </PlainSettingsSheet>
  );
}
const styles = StyleSheet.create({
  field: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 101,
    height: box.size['52'],
    borderWidth: 1,
    borderColor: c.field,
    borderRadius: box.radius['28'],
    paddingHorizontal: 19,
    gap: box.spacing['12'],
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    height: 56.667,
    paddingHorizontal: box.spacing['16'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: box.spacing['12'],
    backgroundColor: colors.white,
    borderBottomColor: c.line,
  },
});
