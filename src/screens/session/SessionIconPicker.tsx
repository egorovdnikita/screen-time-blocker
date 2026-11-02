import { SheetScrollView as ScrollView, SheetGrabber, SheetModal } from '@/components/SheetModal';
import { Image } from 'expo-image';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { Icon } from '@/components/Icon';
import { PressScale } from '@/components/motion';
import { sessionIcons, type SessionIconId } from '@/data/sessionIcons';
import { colors, modalTheme, sessionIconTheme as c } from '@/theme/tokens';
import { T } from '@/theme/typography';

export function SessionIconPicker({ selected, onSelect, onClose }: { selected: SessionIconId; onSelect: (id: SessionIconId) => void; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const { width, height } = useWindowDimensions();
  const search = query.trim().toLocaleLowerCase();
  const results = sessionIcons.filter(item => search ? `${item.glyph} ${item.label} ${item.keywords}`.toLocaleLowerCase().includes(search) : item.id.startsWith('face-'));
  const tileWidth = (width - 16 - 39 - 32) / 5;
  return <SheetModal animateClose onClose={onClose} backdrop={close => <Pressable accessibilityLabel="Закрыть выбор иконки" onPress={() => close()} style={[StyleSheet.absoluteFill, { backgroundColor: modalTheme.dim }]} />}>
    {close => <View pointerEvents="box-none" style={{ flex: 1 }}>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} pointerEvents="box-none" style={{ flex: 1 }}>
        <View pointerEvents="none" style={{ height: Math.min(220, height * .3) }} />
        <View style={styles.sheet} accessibilityViewIsModal>
          <SheetGrabber style={styles.handle} />
          <View style={styles.search}>
            <Icon name="session-search" width={22} height={22} color={c.searchIcon} />
            <TextInput accessibilityLabel="Поиск иконок" value={query} onChangeText={setQuery} placeholder="Поиск (английский или emoji)" placeholderTextColor={c.placeholder} autoCorrect={false} autoCapitalize="none" returnKeyType="search" style={styles.input} />
            {!!query && <PressScale accessibilityRole="button" accessibilityLabel="Очистить поиск иконок" onPress={() => setQuery('')} style={styles.clear}><Icon name="session-clear" width={17} height={17} color={c.searchIcon} /></PressScale>}
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={{ marginTop: 18 }} contentContainerStyle={styles.grid}>
            {results.map(item => <PressScale key={item.id} accessibilityRole="button" accessibilityLabel={`Выбрать иконку ${item.label}`} accessibilityState={{ selected: selected === item.id }} onPress={() => close(() => onSelect(item.id))} style={[styles.tile, { width: tileWidth }]}>
              <Image source={item.image} contentFit="contain" style={{ width: 46, height: 46 }} />
            </PressScale>)}
            {!results.length && <T size={14} weight={400} color={c.placeholder} center style={{ flex: 1, marginTop: 20 }}>Ничего не найдено</T>}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  }</SheetModal>;
}
const styles = StyleSheet.create({
  sheet: { flex: 1, marginHorizontal: 8, marginBottom: 8, backgroundColor: c.surface, borderTopLeftRadius: c.sheetTopRadius, borderTopRightRadius: c.sheetTopRadius, borderBottomLeftRadius: c.sheetBottomRadius, borderBottomRightRadius: c.sheetBottomRadius, overflow: 'hidden' },
  handle: { position: 'absolute', top: 11, alignSelf: 'center', width: 60, height: 5, borderRadius: 4, backgroundColor: c.handle },
  search: { marginTop: 73, marginHorizontal: 18, height: 52, borderRadius: c.searchRadius, borderWidth: 1, borderColor: c.searchBorder, flexDirection: 'row', alignItems: 'center', paddingLeft: 19, paddingRight: 12, gap: 7 },
  input: { flex: 1, height: 50, padding: 0, fontSize: 14, fontWeight: '400', color: colors.black, outlineWidth: 0, outlineStyle: 'solid', outlineColor: c.focusOutline },
  clear: { width: 24, height: 40, alignItems: 'center', justifyContent: 'center' },
  grid: { paddingLeft: 19, paddingRight: 20, paddingBottom: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { height: 61.333, borderRadius: c.tileRadius, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
});
