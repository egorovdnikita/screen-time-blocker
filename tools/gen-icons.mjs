#!/usr/bin/env node
// Собирает src/icons/data.ts из папок icons/ HTML-выгрузок макетов.
//
//   node tools/gen-icons.mjs <папка-с-выгрузками> [ещё папки…]
//
// Ищет рекурсивно все */icons/*.svg (кроме */assets/*), убирает width/height,
// склеивает в один модуль. Иконки из MANUAL не перезаписываются — они поправлены
// руками (см. комментарии в data.ts). Иконки, которых нет в выгрузке, сохраняются.

import fs from 'node:fs';
import path from 'node:path';

const OUT = new URL('../src/icons/data.ts', import.meta.url).pathname;
const MANUAL = new Set(['clock-fill', 'period-tip', 'ogonek-scene-green']);

const roots = process.argv.slice(2);
if (!roots.length) {
  console.error('Укажи папку с выгрузками: node tools/gen-icons.mjs ~/Downloads/block-screens');
  process.exit(1);
}

const found = {};
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '__MACOSX' || e.name === 'assets' || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (!e.isDirectory()) continue;
    if (e.name === 'icons') {
      for (const f of fs.readdirSync(p)) {
        if (!f.endsWith('.svg')) continue;
        found[f.slice(0, -4)] = fs
          .readFileSync(path.join(p, f), 'utf8')
          .trim()
          .replace(/\sdata-[\w-]+="[^"]*"/g, '')
          .replace(/\s(width|height)="[^"]*"/g, '')
          .replace(/\n\s*/g, ' ');
      }
    } else walk(p);
  }
}
roots.forEach(walk);

// Текущие записи, вместе с комментариями над ними.
const current = {};
const src = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
for (const m of src.matchAll(/((?:  \/\/[^\n]*\n)*)  "([^"]+)": (".*"),\n/g)) {
  current[m[2]] = { comment: m[1], value: m[3] };
}

const names = [...new Set([...Object.keys(current), ...Object.keys(found)])].sort();
let out = '// Сгенерировано tools/gen-icons.mjs из макетов (*/icons). fill="currentColor" — цвет задаётся через проп color.\n\nexport const icons = {\n';
let added = 0;
let changed = 0;
for (const n of names) {
  const keep = current[n] && (MANUAL.has(n) || !(n in found));
  if (keep) {
    out += `${current[n].comment}  ${JSON.stringify(n)}: ${current[n].value},\n`;
    continue;
  }
  const value = JSON.stringify(found[n]);
  if (!current[n]) added++;
  else if (current[n].value !== value) changed++;
  out += `${current[n]?.comment ?? ''}  ${JSON.stringify(n)}: ${value},\n`;
}
out += '} as const;\n\nexport type IconName = keyof typeof icons;\n';
fs.writeFileSync(OUT, out);
console.log(`icons: ${names.length} всего, ${added} новых, ${changed} изменено`);
