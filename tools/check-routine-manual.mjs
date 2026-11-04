// APP-15: ручная привычка отмечается, награда выдаётся один раз, отметка переживает перезапуск и сбрасывается новым днём.
import assert from 'node:assert/strict';
import {openChrome,wait} from './lib/cdp.mjs';
const b=await openChrome({port:9355});const text=()=>b.ev('document.body.innerText');
const has=l=>b.ev(`!!document.querySelector('[aria-label=${JSON.stringify(l)}]')`);
try{
  await b.nav('/onboarding?step=25');await b.click('Добавить расписание');await wait(1500);
  await b.nav('/');await wait(900);await b.click('Ясно');await wait(900);await b.click('Начать блокировку');await wait(500);await b.click('Выполнить привычки');await wait(900);
  await b.click('Разблокировать');await wait(500);await b.click('Категория Социальные сети');await b.click('Сохранить группу приложений');await wait(500);
  await b.click('После');await wait(500);await b.click('Добавить привычку');await wait(700);await b.click('Привычка Принять холодный душ');await b.click('Добавить выбранные привычки');await wait(600);
  await b.click('Расписание');await wait(1800);
  const task='Отметить: Принять холодный душ';assert.ok(await has(task),'Ручная привычка не отмечается');
  await b.click(task);await wait(400);
  assert.ok(await has('Забрать время Рутина'),'Нет кнопки награды');
  await b.reload();await wait(800);assert.ok(await has('Забрать время Рутина'),'Отметка не пережила перезапуск');
  await b.click('Забрать время Рутина');await wait(500);
  assert.ok((await text()).includes('Приложения откроются на 5мин.'),'Нет уведомления о награде');
  assert.ok(!(await has('Забрать время Рутина')),'Награду можно забрать повторно');
  assert.ok((await text()).includes('Открыто'),'Статус не изменился');
  await b.ev(`(()=>{const k='block.state',s=JSON.parse(localStorage.getItem(k));for(const v of Object.values(s.data.routineProgress))v.day='2000-01-01';localStorage.setItem(k,JSON.stringify(s))})()`);
  await b.reload();await wait(800);
  assert.ok(await has(task),'Новый день не сбросил рутину');assert.ok(!(await has('Забрать время Рутина')),'Новый день сохранил награду');
  assert.deepEqual(b.errors,[],'Ошибки консоли');console.log('Routine manual OK');
}catch(e){await b.shot('/tmp/routine-manual-error.png');console.log(String(e));process.exitCode=1}finally{await b.close()}
