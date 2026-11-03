// APP-01/APP-02: первый вход, восстановление шага знакомства, сохранение правил после перезапуска, повреждённая запись.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import assert from 'node:assert/strict';
import {openChrome,wait} from './lib/cdp.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const out=path.join(root,'docs/reviews/2026-11-03-persistence');fs.mkdirSync(out,{recursive:true});
const b=await openChrome({port:9351});const checks={};
try{
  await b.nav('/');assert.ok(await b.has('Знакомство: экран 000'),'Новая установка не открыла знакомство 000');await b.shot(out+'/01-first-launch-000.png');checks.firstLaunchOnboarding=true;
  await b.click('Начать');await b.click('Продолжить');assert.ok(await b.has('Знакомство: экран 002'));await b.reload();assert.ok(await b.has('Знакомство: экран 002'),'Шаг знакомства не восстановился после перезапуска');checks.resumeStep=true;
  await b.nav('/onboarding?step=25');await b.click('Добавить расписание');await wait(1200);
  const count=async()=>b.ev(`document.querySelectorAll('[aria-label^="Подробности сессии "]').length`);
  const before=await count();assert.equal(before,1,'После знакомства ожидается одна сессия');
  const tabBefore=await b.ev(`document.querySelector('[role="tab"][aria-label^="Правила"]')?.getAttribute('aria-label')`);
  await b.nav('/rules');assert.ok(!(await b.has('Знакомство: экран 000',1500)),'После завершения знакомство открылось снова');
  assert.equal(await count(),1,'Созданная сессия потерялась после перезапуска');
  assert.equal(await b.ev(`document.querySelector('[role="tab"][aria-label^="Правила"]')?.getAttribute('aria-label')`),tabBefore,'Счётчик правил изменился после перезапуска');
  await b.shot(out+'/02-rules-after-restart.png');checks.rulesSurviveRestart={sessions:1,tab:tabBefore};
  const stored=await b.ev(`JSON.parse(localStorage.getItem('block.state'))`);assert.equal(stored.version,1);assert.equal(stored.data.onboardingCompleted,true);checks.storedVersion=stored.version;
  await b.ev(`localStorage.setItem('block.state','{повреждено')`);await b.reload();
  assert.ok(await b.has('Знакомство: экран 000'),'Повреждённая запись не привела к чистому старту');
  const backups=await b.ev(`Object.keys(localStorage).filter(k=>k.startsWith('block.state.backup-')).map(k=>localStorage.getItem(k))`);assert.deepEqual(backups,['{повреждено'],'Повреждённая запись удалена без резервной копии');checks.corruptBackup=true;
  assert.deepEqual(b.errors,[],'Ошибки в консоли: '+JSON.stringify(b.errors));
  fs.writeFileSync(out+'/checks.json',JSON.stringify({base:b.base,checks},null,2));console.log('Persistence OK',JSON.stringify(checks));
}catch(e){await b.shot(out+'/error.png');console.log(String(e));process.exitCode=1}finally{await b.close()}
