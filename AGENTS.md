This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Этот проект (Block)

Перед работой прочитай `docs/HANDOFF.md`, раздел «Текущая задача». Вёрстка 267 HTML-состояний закрыта; сейчас — готовность приложения по `docs/audits/2026-11-03-app-readiness.md` и приёмка 1:1 по `docs/audits/2026-11-03-ui-full.md`. Там же история, решения, отклонения от макетов и известные проблемы.

- **Язык.** Интерфейс, комментарии в коде и коммиты — на русском. Заказчик — продуктовый дизайнер: отвечать коротко, без вводных, давать одну рекомендацию и прямую критику макетов.
- **Хранение.** Пользовательские данные сохраняются снимком в AsyncStorage (`src/state/persist.ts`); новое поле состояния добавь в таблицу `persisted` в `src/state/app.tsx`, при смене формата — подними `STORAGE_VERSION` и допиши миграцию.
- **Только Expo Go.** Не добавляй библиотеки с нативным кодом вне набора Expo Go (reanimated, masked-view и т. п. — только по согласованию: это требует dev-сборки). Анимации — через `src/components/motion.tsx`.
- **Текст** — только через компонент `T` (`src/theme/typography.tsx`), цвета/радиусы/тени — только из `src/theme/tokens.ts` (имена как в `tokens.css` макета без `--c-`). Новые токены добавлять туда же.
- **Иконки** — `Icon` + `src/icons/data.ts`; обновлять через `node tools/gen-icons.mjs <выгрузки>`. Ручные правки иконок помечать комментарием и вносить в `MANUAL` в скрипте.
- **Состояния** экранов — данными в `src/data/*` и `src/state/app.tsx`, а не копиями экранов. Новые демо-состояния — в `DemoMenu`; всё, что показывает цифры макета или не работает, скрывай при `app.live`.
- **Нажатия** — `PressScale` (сжатие) или `Pressable`; позиционирующий стиль кладётся прямо на `PressScale`.
- **Пиксель-перфект.** Отступы и кегли — из макета (393×852 pt), раскладка — flex, абсолют только там, где он в природе компонента (график, оверлеи).
- **Проверка перед коммитом:** `npx tsc --noEmit`, веб-сборка и скриншоты Playwright 393×852 против `screen@3x.png` макета. `expo lint` не настроен.
- **Git.** Основная ветка — `main`. Не пушь в `main` без согласия заказчика, работай в своей ветке.
