import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'docs/screen-coverage.json'),'utf8'));
const source=fs.readFileSync(path.join(root,'../block/index.html'),'utf8');
const originals=[...source.matchAll(/<article class="d">([\s\S]*?)<\/article>/g)].map(m=>{const id=m[1].match(/<b>(\d+) ·/);return id?Number(id[1]):null}).filter(x=>x!==null);
assert.deepEqual(catalog.screens.map(x=>x.id).sort((a,b)=>a-b),originals.sort((a,b)=>a-b),'Каталог должен содержать все HTML-экраны ровно по одному разу');
for(const item of catalog.screens){assert.ok(['missing','layout_present'].includes(item.status));if(item.status==='layout_present'){assert.ok(fs.existsSync(path.join(root,item.component)),`Нет компонента ${item.id}`);assert.ok(fs.existsSync(path.join(root,item.evidence)),`Нет отчёта ${item.id}`);}}
const missing=catalog.screens.filter(x=>x.status==='missing');
const report=`# Остаток переноса HTML в Expo\n\nДата: ${catalog.date}. База инвентаризации: ${catalog.baseCommit}.\n\nВсего **${originals.length} HTML-состояний**. Вёрстка есть для **${originals.length-missing.length}**, ещё не перенесено **${missing.length}**.\n\n«Вёрстка есть» не означает полное совпадение 1:1, проверку на iPhone или работающую системную интеграцию. Доработки уже перенесённых состояний учитываются в отчётах пакетов отдельно и не добавляют новых экранов в остаток.\n\n| Номер | Экран |\n|---|---|\n${missing.length ? missing.map(x=>`| ${String(x.id).padStart(3,'0')} | ${x.name} |`).join('\n') : '| — | Неперенесённых состояний нет; приёмка 1:1 предстоит. |'}\n\nИсточник списка: соседний HTML-каталог. Каждый из 267 пунктов записан в [screen-coverage.json](screen-coverage.json). Проверка/обновление отчёта: \`node tools/screen-coverage.mjs --write\`. Номера с пропусками доходят до 344; 344 не является количеством экранов.\n`;
if(process.argv.includes('--write'))fs.writeFileSync(path.join(root,'docs/SCREEN_COVERAGE.md'),report);
console.log(JSON.stringify({total:originals.length,layoutPresent:originals.length-missing.length,missing:missing.length,ids:missing.map(x=>x.id)}));
