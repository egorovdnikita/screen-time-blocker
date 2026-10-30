# Block — screen time blocker

Мобильное приложение на Expo (SDK 58, Expo Router). Свёрстаны экраны из макетов: «Главная», «Правила», «Профиль». «Обзор» — заглушка, макета пока нет.

## Запуск

```bash
npm install
npx expo start
```

Отсканируй QR-код в Expo Go (iOS/Android). Все нативные модули (svg, blur, linear-gradient, image) входят в Expo Go, отдельная dev-сборка не нужна.

Веб-превью: `npx expo start --web`.

## Структура

```
src/app/            маршруты Expo Router; (tabs)/ — четыре вкладки
src/screens/        экраны: home, rules, profile, overview
src/components/     TabBar, StartButton, Glass, Dashed, Rule-элементы, Icon
src/theme/          tokens.ts (цвета, радиусы, тени из tokens.css), typography.tsx
src/icons/data.ts   SVG-иконки из макета (fill=currentColor)
src/data/           мок-данные и реестр растровой графики
assets/art/         растр из макета (@3x)
```

## Шрифты

В макете используется SF Pro Rounded. На iOS он берётся из системы (`ui-rounded`), на вебе — локальный SF Pro Rounded, если установлен. На Android сейчас стоит системный Roboto.
