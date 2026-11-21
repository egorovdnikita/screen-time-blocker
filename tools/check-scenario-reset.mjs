// Аудит 2026-11-21: сброс в setScenario вручную повторяет таблицу persisted в src/state/app.tsx.
// Новое сохраняемое поле обязано сбрасываться, иначе демо-сценарий унаследует данные пользователя.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/state/app.tsx', import.meta.url), 'utf8');
const table = source.slice(source.indexOf('const persisted'), source.indexOf('};', source.indexOf('const persisted')));
const setters = [...table.matchAll(/\[\s*\w+,\s*(\w+)\s*\]/g)].map(m => m[1]);
assert.ok(setters.length > 40, `Таблица persisted прочитана: ${setters.length} полей`);

const start = source.indexOf('const setScenario = useCallback');
const reset = source.slice(start, source.indexOf('}, []);', start));
// Эти поля сценарий не трогает намеренно: признак завершённого знакомства и снимок данных на время демо.
const kept = ['setOnboardingCompleted', 'setDemoBackup'];
const missing = setters.filter(name => !kept.includes(name) && !reset.includes(`${name}(`));
assert.deepEqual(missing, [], 'setScenario не сбрасывает поля');
console.log(`Scenario reset OK: ${setters.length} полей`);
