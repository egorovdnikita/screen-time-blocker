// APP-13: лимит запусков с перепечатыванием текста открывается только после точного ввода.
import assert from 'node:assert/strict';
import {openChrome,wait} from './lib/cdp.mjs';
const b=await openChrome({port:9357,demo:true});
const has=l=>b.ev(`!!document.querySelector('[aria-label=${JSON.stringify(l)}]')`);
const input=(l,v,tag='HTMLInputElement')=>b.ev(`(()=>{const e=[...document.querySelectorAll('[aria-label=${JSON.stringify(l)}]')].pop();const p=e.tagName==='TEXTAREA'?HTMLTextAreaElement:HTMLInputElement;Object.getOwnPropertyDescriptor(p.prototype,'value').set.call(e,${JSON.stringify(v)});e.dispatchEvent(new Event('input',{bubbles:true}))})()`).then(()=>wait(400));
try{
  await b.nav('/');await b.click('Начать блокировку');await wait(400);await b.click('Лимит запусков');await wait(700);
  await b.click('Приложение для лимита запусков');await b.click('Категория Социальные сети');await b.click('Выбрать BeReal');await b.click('Продолжить выбор приложения');
  await input('Поиск для подтверждения приложения','Bereal');await b.click('Подтвердить BeReal');await b.click('Это BeReal');await wait(600);
  await b.click('Способ открытия по лимиту');await wait(500);await b.click('Указать причину');await b.click('Перепечатать текст');await wait(600);
  await input('Текст для перепечатывания','Я выбираю открыть приложение');await b.click('Сохранить');await wait(700);
  await b.click('Добавить лимит запусков');await wait(1800);
  const open='Открыть BeReal';assert.equal(await b.ev(`document.querySelector('[aria-label=${JSON.stringify(open)}]').getAttribute('aria-disabled')`),null,'Открыть недоступно');
  await b.click(open);await wait(900);
  assert.ok((await b.ev('document.body.innerText')).includes('Перепечатайте текст'),'Нет экрана текста');
  await input('Перепечатайте текст','неправильно');assert.ok(await has('Перепечатайте текст'),'Неверный текст принят');
  await input('Перепечатайте текст','  я   выбираю открыть приложение ');
  assert.ok((await b.ev('document.body.innerText')).includes('Выберите время доступа'),'Верный текст не принят');
  assert.deepEqual(b.errors,[],'Ошибки консоли');console.log('Lock copy text OK');
}catch(e){await b.shot('/tmp/lock-text-error.png');console.log(String(e));process.exitCode=1}finally{await b.close()}
