// Аудит 2026-11-21: после переименования 2026-11-12 в знакомстве осталось «мы создали Block».
// В строках интерфейса название приложения — только screen-time-blocker.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const walk = dir =>
  readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
  );
const root = new URL('../src', import.meta.url).pathname;
const found = [];
for (const file of walk(root).filter(f => /\.tsx?$/.test(f) && !f.endsWith('icons/data.ts'))) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    // Слово Block отдельно (в том числе после \n в строке), кроме имени шрифта и идентификаторов.
    if (/(^|[^A-Za-z]|\\n)Block(?![A-Za-z])/.test(line.replace(/Block Text/g, ''))) {
      found.push(`${path.relative(root, file)}:${i + 1}`);
    }
  });
}
assert.deepEqual(found, [], 'Старое название в интерфейсе');
console.log('App name OK');
