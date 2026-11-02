import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';
const cache = new Map();
function load(file) {
  if (/\.(png|webp|jpg)$/.test(file)) return 0;
  if (!path.extname(file)) file += '.ts';
  if (cache.has(file)) return cache.get(file);
  const exports = {}; cache.set(file, exports);
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  new Function('require', 'exports', js)(id => load(path.resolve(path.dirname(file), id)), exports);
  return exports;
}
const { gallerySession } = load(fileURLToPath(new URL('../src/data/gallery.ts', import.meta.url)));
const work = gallerySession('work');
assert.deepEqual([work.start, work.end, work.days.length, work.scheduled], [9, 17, 5, true]);
const focus = gallerySession('focus'); assert.equal(focus.end - focus.start, 2);
const wind = gallerySession('wind'); assert.equal((wind.end - wind.start + 24) % 24, 8); assert.equal(wind.days.length, 7);
const morning = gallerySession('morning'); assert.deepEqual([morning.start, morning.end], [6, 9]);
const intention = gallerySession('intention'); assert.equal(intention.allDay, true); assert.equal(intention.unlockMethod, 'reason'); assert.equal(intention.days.length, 7);
work.appGroup.selectedApps[0] = false; work.days.pop(); assert.equal(gallerySession('work').days.length, 5); assert.notDeepEqual(work.appGroup.selectedApps, gallerySession('work').appGroup.selectedApps);
assert.equal(gallerySession('unknown'), null); assert.equal(gallerySession('limit'), null); assert.equal(gallerySession(), null);
console.log('Gallery preset scenarios OK');
