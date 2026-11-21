// Аудит 2026-11-21: экран цели и «28 лет» не зависели от ответа «сколько часов в телефоне».
import assert from 'node:assert/strict';
import { phoneYears, suggestedGoal, usualTimeText, yearsLabel } from '../src/data/onboardingGoal.ts';

// Макет — ответ «Больше 7 часов».
assert.equal(suggestedGoal(0), 300, 'Цель макета 5 ч');
assert.equal(phoneYears(0), 28, '28 лет макета');
assert.equal(usualTimeText(0), 'Обычно вы проводите больше 7 часов в день');

// Мало времени в телефоне — цель меньше обычного, годы меньше.
assert.equal(usualTimeText(4), 'Обычно вы проводите 1–3 часа в день');
assert.ok(suggestedGoal(4) < 120, 'Цель для 1–3 часов меньше двух часов');
assert.equal(suggestedGoal(5), 40, 'Меньше часа → 40 мин');
assert.equal(phoneYears(5), 4);
for (let t = 0; t < 6; t++) {
  assert.equal(suggestedGoal(t) % 20, 0, 'Шаг шкалы 20 минут');
  if (t) assert.ok(suggestedGoal(t) <= suggestedGoal(t - 1), 'Меньше времени — меньше цель');
}
assert.equal(usualTimeText(null), 'Обычно вы проводите около 7 часов в день');

assert.deepEqual([1, 2, 4, 5, 11, 14, 18, 21, 24, 28].map(yearsLabel), [
  '1 год',
  '2 года',
  '4 года',
  '5 лет',
  '11 лет',
  '14 лет',
  '18 лет',
  '21 год',
  '24 года',
  '28 лет',
]);
console.log('Onboarding goal OK');
