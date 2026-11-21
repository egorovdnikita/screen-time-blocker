// P1 аудита 2026-11-21: «Блокировать на работе» обещал 8:00–17:00, а создавал 9:00–17:00.
// Подпись варианта и часы правила берутся из одного места и обязаны совпадать.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/data/onboarding.ts', import.meta.url), 'utf8');
const block = source.slice(source.indexOf('const onboardingScheduleData'), source.indexOf('} as const;') + 1);
const data = Object.fromEntries(
  [...block.matchAll(/(\w+): \{ name: '([^']+)', start: (\d+), end: (\d+) \}/g)].map(([, id, name, start, end]) => [
    id,
    { name, start: Number(start), end: Number(end) },
  ]),
);
assert.deepEqual(Object.keys(data), ['limit', 'morning', 'work', 'evening'], 'Все четыре варианта знакомства');
assert.deepEqual(data.work, { name: 'Рабочие часы', start: 8, end: 17 }, 'На работе: 8:00–17:00, как в подписи');
assert.notDeepEqual(data.limit, data.work, 'Два варианта не создают одинаковое правило');
for (const file of [
  '../src/screens/onboarding/OnboardingScreen.tsx',
  '../src/screens/onboarding/OnboardingSetup.tsx',
]) {
  const text = readFileSync(new URL(file, import.meta.url), 'utf8');
  assert.ok(text.includes('onboardingSchedule(draft.preference)'), `${file}: часы из общего источника`);
  assert.ok(!/['"]\d{1,2}:00–\d{1,2}:00['"]/.test(text), `${file}: нет своих строк с часами`);
}
console.log('Onboarding schedule OK');
