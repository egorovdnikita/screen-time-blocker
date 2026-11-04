// Результат нативного листа нельзя применять с animateLayout: это одно обновление с удалением Modal, и приложение падает на iOS.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const editors = ['src/screens/routines/RoutineEditor.tsx', 'src/screens/limits/TimeLimitEditor.tsx'];
for (const file of editors) {
  const unsafe = readFileSync(file, 'utf8').split('\n').filter(line => /^\s*\{\(?modal === /.test(line) && /\b(patch|setMinutes|toggle|animateLayout)\(/.test(line));
  assert.deepEqual(unsafe, [], `${file}: анимация вместе с закрытием листа`);
}
console.log('Sheet layout animation OK');
