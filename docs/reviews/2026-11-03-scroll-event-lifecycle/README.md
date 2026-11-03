# Окончание касаний и прокрутки модальных окон

Правки внесены в общий SheetScrollView и NativeScrollGate. Новых экранов нет.

Ранее учитывались touchStart/touchEnd, но не отмена касания и окончание scroll drag. Последовательность touchStart → touchCancel → scroll drag → возврат к нулю → scrollEndDrag оставляла gate заблокированным. Тест tools/check-sheet-scroll-events.mjs воспроизводит ошибку на предыдущем исходнике; исправленный проходит.

Теперь SheetScrollView отслеживает начало и конец scroll drag. touchCancel/touchEnd завершают только касание, не прерывая активную прокрутку. Повторный begin не снимает уже установленный запрет посреди одного жеста. Оригинальные callbacks сохраняются; горизонтальные карусели не меняют вертикальный gate.

Проверены оба порядка отмены/начала прокрутки, окончание касания до/во время drag, отмена без drag, повторный begin и горизонтальная карусель. Lifecycle, typecheck, lint, web export и iOS JS bundle проходят.

Chrome 393×852: свайп по содержимому вложенных окон, прокрученная справка, барабаны времени и 7 открытий/закрытий профиля проходят. scrolled-help.png просмотрен визуально. Результаты сохранены рядом. Один предварительный браузерный запуск не нашёл кнопку перехода; повторный полный запуск без изменения кода прошёл.

Expo Go на физическом iPhone недоступен в inspector: /json/list вернул пустой список. Нативные последовательности событий проверены через реальный компонент с mock runtime; это не проверка пальцем на устройстве. Metro8082 продолжает обслуживать текущий исходник.

Сверено с Expo SDK58 и исходником установленного RN0.88 ScrollView: node_modules/react-native/Libraries/Components/ScrollView/ScrollView.js (_handleTouchCancel, _handleScrollBeginDrag, _handleScrollEndDrag). Документация: https://docs.expo.dev/versions/v58.0.0/.
