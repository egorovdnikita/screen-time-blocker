// APP-07: разблокировки блокировки сбрасываются в полночь (чистая функция).
import fs from 'node:fs';import assert from 'node:assert/strict';import ts from 'typescript';
const code=ts.transpileModule(fs.readFileSync(new URL('../src/data/unlockDay.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const exports={};new Function('exports',code)(exports);const {unlocksUsedToday,localDay}=exports;
const day1=new Date(2026,10,3,22,0).getTime(),day2=new Date(2026,10,4,8,0).getTime();
assert.equal(unlocksUsedToday(undefined,day1),0);
assert.equal(unlocksUsedToday({until:day1+600000,used:2,reason:'',day:localDay(day1)},day1+60000),2);
assert.equal(unlocksUsedToday({until:day1+600000,used:3,reason:'',day:localDay(day1)},day2),0,'Новый день — счётчик с нуля');
assert.equal(unlocksUsedToday({until:day1,used:3,reason:''},day1+1000),3,'Старая запись без day считается по until');
assert.equal(unlocksUsedToday({until:day1,used:3,reason:''},day2),0);
console.log('Unlock day reset OK');
