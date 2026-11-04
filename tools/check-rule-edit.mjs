// APP-10: созданные лимит запусков и рутина открываются в редакторе, изменения и удаление сохраняются.
import assert from 'node:assert/strict';
import {openChrome,wait} from './lib/cdp.mjs';
const b=await openChrome({port:9354,demo:true});const text=()=>b.ev('document.body.innerText');
const label=l=>b.ev(`!!document.querySelector('[aria-label=${JSON.stringify(l)}]')`);
const input=(l,v)=>b.ev(`(()=>{const e=document.querySelector('[aria-label=${JSON.stringify(l)}]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(v)});e.dispatchEvent(new Event('input',{bubbles:true}))})()`).then(()=>wait(350));
try{
  await b.nav('/');await b.click('Начать блокировку');await b.click('Лимит запусков');
  await b.click('Приложение для лимита запусков');await b.click('Категория Социальные сети');await b.click('Выбрать BeReal');await b.click('Продолжить выбор приложения');
  await input('Поиск для подтверждения приложения','Bereal');await b.click('Подтвердить BeReal');await b.click('Это BeReal');await wait(600);
  await b.click('Добавить лимит запусков');await wait(1600);
  assert.ok(await label('Изменить правило BeReal'),'Созданный лимит не открывается в редакторе');
  await b.click('Изменить правило BeReal');await wait(900);
  assert.ok(await label('Сохранить лимит запусков'),'Нет кнопки сохранения');
  assert.ok((await text()).includes('15 мин/день'),'Редактор не подхватил значения правила');
  await b.click('Увеличить лимит запусков');await b.click('Сохранить лимит запусков');await wait(1600);
  assert.ok((await text()).includes('Изменения сохранены'),'Нет уведомления о сохранении');
  assert.ok(await b.ev(`[...document.querySelectorAll('[aria-label^="Изменить правило BeReal"]')].length===1`),'Правило задвоилось');
  await b.click('Изменить правило BeReal');await wait(900);
  assert.ok((await text()).includes('20 мин/день'),'Изменение не сохранилось');
  await b.click('Удалить лимит запусков');await wait(600);await b.click('Удалить');await wait(1700);
  assert.ok(!(await label('Изменить правило BeReal')),'Лимит не удалён');
  assert.ok((await text()).includes('Правило удалено'),'Нет уведомления об удалении');

  await b.click('Начать блокировку');await b.click('Выполнить привычки');await wait(350);
  await b.click('Разблокировать');await b.click('Категория Социальные сети');await b.click('Сохранить группу приложений');
  await b.click('После');await b.click('Добавить привычку');await b.click('Привычка Убраться в комнате');await b.click('Добавить выбранные привычки');await wait(500);
  await b.click('Расписание');await wait(1600);
  assert.ok(await label('Изменить правило Рутина'),'Созданная рутина не открывается в редакторе');
  await b.click('Изменить правило Рутина');await wait(900);
  const t=await text();assert.ok(t.includes('Сохранить')&&t.includes('Удалить')&&!t.includes('Новый шаблон'),'Нет действий редактирования');
  await b.click('Сохранить');await wait(1600);
  assert.ok(await label('Изменить правило Рутина'),'Рутина потерялась после сохранения');
  await b.click('Изменить правило Рутина');await wait(900);await b.click('Удалить');await wait(600);
  await b.click('Удалить');await wait(1700);
  assert.ok(!(await label('Изменить правило Рутина')),'Рутина не удалена');
  assert.deepEqual(b.errors,[],'Ошибки консоли');console.log('Rule edit OK');
}catch(e){await b.shot('/tmp/rule-edit-error.png');console.log(String(e));process.exitCode=1}finally{await b.close()}
