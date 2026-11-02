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
const { searchScreenApps, resolveScreenText, screenApps } = load(fileURLToPath(new URL('../src/data/blockScreens.ts', import.meta.url)));
assert.equal(searchScreenApps('').length, 0); assert.equal(searchScreenApps('   ').length, 0);
assert.equal(searchScreenApps('SUBSTACK').length, 9); assert.equal(searchScreenApps('medium')[0].title, 'Medium'); assert.equal(searchScreenApps('unknown').length, 0);
assert.equal(new Set(screenApps.map(app => app.id)).size, screenApps.length);
assert.equal(resolveScreenText('{shielded_activity_name}: {total_screen_time}', { shielded_activity_name: 'XChat', total_screen_time: '12 мин' }), 'XChat: 12 мин');
assert.equal(resolveScreenText('{first_name} / {unknown}', {}), '{first_name} / {unknown}');
assert.equal(resolveScreenText('{total_shielded_activity_opens_count}', { total_shielded_activity_opens_count: '5' }), '5');
console.log('Block screen data OK');
