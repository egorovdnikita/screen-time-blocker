// APP-20: у реального пользователя Профиль показывает срок с Block и обратный отсчёт отчёта, а не демо-цифры.
import assert from 'node:assert/strict';
import {openChrome,wait} from './lib/cdp.mjs';
const b=await openChrome({port:9356});const text=()=>b.ev('document.body.innerText');
const setDays=d=>b.ev(`(()=>{const k='block.state',s=JSON.parse(localStorage.getItem(k));s.data.startedAt=Date.now()-${d}*86400000;localStorage.setItem(k,JSON.stringify(s))})()`);
try{
  await b.nav('/onboarding?step=25');await b.click('Добавить расписание');await wait(1500);
  await b.nav('/profile');await wait(900);
  let t=await text();assert.ok(t.includes('1 день')&&t.includes('Доступно через 2 дня'),'Первый день: '+t.slice(0,120));
  assert.ok(!t.includes('Вернули 25 лет'),'Показаны демо-цифры');
  await setDays(1);await b.reload();await wait(800);t=await text();assert.ok(t.includes('2 дня')&&t.includes('Доступно через 1 день'),'Второй день');
  await setDays(9);await b.reload();await wait(800);t=await text();assert.ok(t.includes('10 дней')&&t.includes('Доступно скоро'),'Десятый день');
  assert.deepEqual(b.errors,[],'Ошибки консоли');console.log('Profile real OK');
}catch(e){console.log(String(e));process.exitCode=1}finally{await b.close()}
