# Устройство проекта

## Папки

```
src/app/            маршруты Expo Router; (tabs)/ — четыре вкладки, onboarding, session, lock, limit, routine, remaining
src/screens/        экраны по разделам: home, rules, session, limits, locks, routines, unlocking,
                    onboarding, settings, profile, overview, previews (системные демо)
src/components/     TabBar, StartButton, Glass, Dashed, Rule, Icon, DemoMenu, motion (анимации)
src/theme/          tokens.ts (токены из tokens.css макетов), typography.tsx (компонент T)
src/icons/data.ts   SVG-иконки из макетов (генерируется tools/gen-icons.mjs)
src/data/           данные экранов (home.ts, rules.ts, mock.ts) и реестр растра (art.ts)
src/state/          состояние приложения, демо-сценарии и хранилище (persist.ts, AsyncStorage)
assets/art/         растр из макетов (@3x)
tools/              скрипты для HTML-выгрузок (иконки, замеры, блюр) и проверки check-*.mjs
```

## Шрифты

В макете SF Pro Rounded. На iOS он берётся из системы (`ui-rounded`), на вебе используется локальный SF Pro Rounded, если он установлен. На Android пока системный Roboto.

Подробнее об архитектуре, связях между экранами и процессе вёрстки — в [`HANDOFF.md`](HANDOFF.md).
