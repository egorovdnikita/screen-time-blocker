import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
// Выполняем реальную модель TypeScript без RN-рендера; только изображения
// заменены идентификаторами, чтобы Node не пытался исполнять PNG.
const modules = new Map();
function load(name) {
 if(modules.has(name))return modules.get(name);
 if(name==='art')return {art:new Proxy({}, {get:(_,key)=>key})};
 const source=fs.readFileSync(new URL(`../src/data/${name}.ts`,import.meta.url),'utf8');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const exports={};modules.set(name,exports);new Function('require','exports',code)(path=>load(path.replace('./','')),exports);return exports;
}
const {usageSeconds,usageLabel,reflectedDay}=load('reflectionSummary');const {dayToday}=load('home');const {reflectionKey}=load('reflection');
assert.equal(usageSeconds('1ч08'),4080);assert.equal(usageSeconds('2 ч 05'),7500);assert.equal(usageSeconds('37с'),37);assert.equal(usageSeconds('35 мин'),2100);assert.equal(usageLabel(4080),'1ч08');assert.equal(usageLabel(37),'37с');
const record=(mood='productive',activity='tasks')=>({mood,activity,always:false});
const records={[reflectionKey('today','block')]:record(),[reflectionKey('today','photos')]:record()};
assert.equal(reflectedDay(dayToday,records,[],[],false),dayToday);
let day=reflectedDay(dayToday,records,[],[],true);assert.equal(day.activities.length,1);assert.equal(day.activities[0].time,'42 мин');assert.deepEqual(day.activities[0].apps,['block','photos']);assert.deepEqual(day.quality.pct,[95,5,0]);
day=reflectedDay(dayToday,{...records,[reflectionKey('today','photos')]:record('distracting')},[],[],true);assert.equal(day.activities.length,2);assert.deepEqual(day.quality.pct,[80,4,16]);assert.equal(day.quality.pct.reduce((a,b)=>a+b),100);
day=reflectedDay(dayToday,records,[reflectionKey('today','block')],[],true);assert.equal(day.activities[0].time,'7 мин');assert.deepEqual(day.activities[0].apps,['photos']);assert.deepEqual(day.quality.pct,[78,22,0]);
assert.equal(reflectedDay(dayToday,{},[],[],true).activities.length,0);
assert.deepEqual(reflectedDay(dayToday,records,dayToday.apps.map(a=>reflectionKey('today',a.id)),[],true).quality.pct,[0,0,0]);
assert.equal(reflectedDay({...dayToday,id:'today-refreshed'},records,[],[],true).activities[0].time,'42 мин');
const thirds={...dayToday,screenTime:'3с',apps:dayToday.apps.slice(0,3).map(a=>({...a,time:'1с'}))};assert.deepEqual(reflectedDay(thirds,{[reflectionKey('today','block')]:record(),[reflectionKey('today','photos')]:record('distracting')},[],[],true).quality.pct,[34,33,33]);
console.log('Reflection summary domain OK');
