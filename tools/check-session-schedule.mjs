// APP-06: живой статус сессии по расписанию (чистые функции, без браузера).
import fs from 'node:fs';import assert from 'node:assert/strict';import ts from 'typescript';
const source=fs.readFileSync(new URL('../src/data/sessionSchedule.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const exports={};new Function('exports',code)(exports);const {liveSession,weeklyRemaining,nextStartLabel,remainingLabel}=exports;
const at=(day,h,m=0)=>new Date(2026,10,2+day,h,m); // 2026-11-02 — понедельник, day 0 = пн
const work={kind:'weekly',start:540,end:1020,days:[0,1,2,3,4]};
assert.equal(weeklyRemaining(work,at(1,10)),420);assert.equal(weeklyRemaining(work,at(1,8,59)),null);assert.equal(weeklyRemaining(work,at(1,17)),null);assert.equal(weeklyRemaining(work,at(5,10)),null);
assert.equal(nextStartLabel(work,at(1,8)),'Сегодня в 9:00');assert.equal(nextStartLabel(work,at(1,18)),'Завтра в 9:00');assert.equal(nextStartLabel(work,at(4,18)),'пн в 9:00');
const night={kind:'weekly',start:1260,end:360,days:[4]}; // пт 21:00 – сб 6:00
assert.equal(weeklyRemaining(night,at(4,22)),480);assert.equal(weeklyRemaining(night,at(5,5)),60);assert.equal(weeklyRemaining(night,at(5,7)),null);assert.equal(weeklyRemaining(night,at(3,23)),null);
const allDay={kind:'weekly',start:0,end:0,days:[6]};assert.equal(weeklyRemaining(allDay,at(6,12)),720);assert.equal(nextStartLabel(allDay,at(4,12)),'вс');
assert.equal(remainingLabel(90),'1 ч 30 мин');assert.equal(remainingLabel(1605),'1 д 2 ч 45 мин','Дни как в редакторе');assert.equal(remainingLabel(1440),'1 д');assert.equal(remainingLabel(0.2),'1 мин');
const base={id:'s',emoji:'zap',title:'С',apps:'first-rule',strict:true,status:{kind:'upcoming'},meta:{kind:'schedule',time:'9:00 – 17:00'}};
const t0=at(1,10).getTime();const now={...base,schedule:{kind:'now',startedAt:t0,minutes:30}};
let live=liveSession(now,new Date(t0+10*60000));assert.deepEqual(live.status,{kind:'blocking',strict:true});assert.equal(live.meta.text,'Осталось 20 мин');
live=liveSession(now,new Date(t0+31*60000));assert.equal(live.status.text,'Завершена');
live=liveSession({...base,schedule:work},at(1,10));assert.equal(live.status.kind,'blocking');assert.equal(live.remaining,'7 ч');
live=liveSession({...base,schedule:work},at(1,18));assert.equal(live.status.kind,'upcoming');assert.equal(live.nextStart,'Завтра в 9:00');
assert.equal(liveSession(base,at(1,10)),base,'Демо-сессия без расписания не меняется');
console.log('Session schedule OK');
