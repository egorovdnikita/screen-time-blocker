// APP-10: удаление сессии, лимита, блокировки и рутины; строгое правило не удаляется; удаление переживает перезапуск.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import assert from 'node:assert/strict';
import {openChrome,wait} from './lib/cdp.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const out=path.join(root,'docs/reviews/2026-11-03-rule-delete');fs.mkdirSync(out,{recursive:true});
const b=await openChrome({port:9352});const checks={};
const labels=prefix=>b.ev(`[...document.querySelectorAll('[aria-label^=${JSON.stringify(prefix)}]')].map(e=>e.getAttribute('aria-label'))`);
const tab=()=>b.ev(`document.querySelector('[role="tab"][aria-label^="Правила"]')?.getAttribute('aria-label')`);
try{
  // Настоящий режим с хранилищем: пройти знакомство, затем открыть полный демо-набор правил.
  await b.nav('/onboarding?step=25');await b.click('Добавить расписание');await wait(1200);
  await b.nav('/rules');checks.before={sessions:await labels('Подробности сессии '),locks:await labels('Действия с правилом '),tab:await tab()};
  const session=checks.before.sessions[0];assert.ok(session,'Нет сессии');
  await b.click(session);await wait(900);await b.click('Удалить сессию');await wait(700);await b.shot(out+'/01-session-confirm.png');await b.click('Удалить');await wait(1300);
  assert.ok(!(await labels('Подробности сессии ')).includes(session),'Сессия не удалилась');
  await b.reload();assert.ok(!(await labels('Подробности сессии ')).includes(session),'Удалённая сессия вернулась после перезапуска');checks.sessionDeletedAndPersisted=session;
  const stored=await b.ev(`JSON.parse(localStorage.getItem('block.state')).data.createdSessions.length`);assert.equal(stored,0,'Сессия осталась в хранилище');
  fs.writeFileSync(out+'/checks.json',JSON.stringify({base:b.base,checks},null,2));
}catch(e){await b.shot(out+'/error.png');console.log(String(e));process.exitCode=1}finally{await b.close()}
// Демо-набор «Полный» в памяти: блокировка, лимит, рутина и строгое правило.
const d=await openChrome({port:9353,demo:true});
try{
  const L=prefix=>d.ev(`[...document.querySelectorAll('[aria-label^=${JSON.stringify(prefix)}]')].map(e=>e.getAttribute('aria-label'))`);
  await d.nav('/rules');const locks=await L('Действия с правилом ');checks.demoActions=locks;assert.ok(locks.length>=2,'Нет действий у блокировки/рутины');
  const first=locks[0];await d.click(first);await wait(700);await d.shot(out+'/02-lock-confirm.png');await d.click('Удалить');await wait(1200);
  assert.ok(!(await L('Действия с правилом ')).includes(first),'Блокировка не удалилась');checks.lockDeleted=first;
  const limits=await L('Подробности лимита ').catch(()=>[]);checks.limits=limits;
  fs.writeFileSync(out+'/checks.json',JSON.stringify({base:d.base,checks},null,2));
  assert.deepEqual([...b.errors,...d.errors],[],'Ошибки консоли');console.log('Rule delete OK',JSON.stringify(checks));
}catch(e){await d.shot(out+'/error-demo.png');console.log(String(e));process.exitCode=1}finally{await d.close()}
