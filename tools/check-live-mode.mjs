// Реальный режим: новый пользователь не видит цифр макета и заглушек; демо не трогает его данные (P0 аудита 2026-11-05).
// На Metro проверяет меню разработчика, на сборке (PRODUCTION=1, EXPO_WEB_URL) — что меню не открывается.
import assert from 'node:assert/strict';
import {openChrome,wait} from './lib/cdp.mjs';
const b=await openChrome({port:9371});
const text=()=>b.ev('document.body.innerText');
const stored=()=>b.ev(`JSON.parse(localStorage.getItem('block.state')).data`);
const hold=async()=>{const r=await b.ev(`(()=>{const e=document.querySelector('[aria-label="Ещё"]');const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await b.cdp('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...r});await wait(900);await b.cdp('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...r});await wait(1100)};
try{
  // Выдуманные цифры и отзывы знакомства не видны реальному пользователю.
  const noFake=async(step,list)=>{await b.nav('/onboarding?step='+step);await wait(800);const t=await text();for(const f of list)assert.ok(!t.includes(f),'Знакомство '+step+': '+f)};
  await noFake(0,['300 000','12 часов','Маша','Спасибо']);
  await noFake(2,['301 500','7000','Алекс']);
  await noFake(14,['2022']);
  await noFake(15,['Выбор App Store']);
  await b.nav('/onboarding?step=1');await wait(800);await b.click('Продолжить');await wait(800);
  assert.equal(await b.ev(`JSON.parse(localStorage.getItem('block.state')).data.onboardingDraft.step`),3,'Шаг 002 не пропущен');
  await b.nav('/onboarding?step=25');await b.click('Добавить расписание');await wait(1500);
  await b.click('Главная');await wait(1200);
  let t=await text();
  if(t.includes('Ясно')){await b.click('Понятно');await wait(2200);t=await text()}
  for(const fake of ['8 мин','6ч52','20с','Phia'])assert.ok(!t.includes(fake),'Главная: цифры макета: '+fake);
  assert.ok(t.includes('Данные появятся'),'Главная: нет пустого состояния');
  assert.ok(!t.includes('Чаще всего'),'Главная: пустая секция');
  const gap=await b.ev(`(()=>{const box=t=>{const e=[...document.querySelectorAll('div,span')].filter(n=>n.textContent.trim().startsWith(t)).sort((x,y)=>x.textContent.length-y.textContent.length)[0];return e.getBoundingClientRect()};return box('Блокировать').top-box('Данные появятся').bottom})()`);
  assert.ok(gap>=0,'Главная: текст уходит под кнопку на '+-gap);
  assert.ok(!await b.ev(`!!document.querySelector('[aria-label="Обновить"]')`),'Главная: «Обновить» ничего не меняет');
  await b.click('Профиль');await wait(1000);t=await text();
  assert.ok(!t.includes('Подробнее')&&!await b.ev(`!!document.querySelector('[aria-label="Обновить отчёт"]')`),'Профиль: заглушки');
  assert.match(t,/Лучшая серия\s+0/,'Профиль: серия у нового пользователя 0');
  await b.click('Настройки профиля');await wait(1000);t=await text();
  for(const fake of ['Годовой план','Пробный период','Аккаунт Block','Управлять','Язык'])assert.ok(!t.includes(fake),'Настройки: '+fake);
  await b.click('Помощь и отзывы');await wait(1000);t=await text();
  for(const fake of ['+75','Связаться','Предложить идею','Строгий режим'])assert.ok(!t.includes(fake),'Помощь: '+fake);
  await b.click('Ошибки и проблемы');await wait(1000);t=await text();
  for(const fake of ['Другие настройки','Скрывать иконки','Учёт в реальном времени'])assert.ok(!t.includes(fake),'Решение проблем: '+fake);
  await b.nav('/rules');await wait(1200);t=await text();
  assert.ok(t.includes('Рабочие часы')&&t.includes('9:00 – 17:00')&&t.includes('По будням'),'Карточка правила: '+t.slice(0,160));
  assert.ok(!t.includes('Apple Music'),'Правила: чужие демо-правила');
  assert.ok(!await b.ev(`!!document.querySelector('[aria-label^="Серия"]')`),'Серия у правила без данных');
  const before=await stored();assert.equal(before.createdSessions.length,1);
  await hold();
  if(process.env.PRODUCTION){
    assert.ok(!(await text()).includes('Обычный день'),'В сборке открылось меню разработчика');
    console.log('Live mode production OK');
  }else{
    await b.click('Обычный день');await wait(1200);
    let s=await stored();assert.ok(s.demoBackup,'Нет снимка данных');assert.equal(s.createdSessions.length,0);
    await b.nav('/profile');await wait(1000);assert.ok((await text()).includes('Вернули 25 лет'),'Демо: нет профиля макета');
    await b.reload();await wait(800);assert.ok((await text()).includes('Вернули 25 лет'),'Демо не пережило перезапуск');
    await b.nav('/rules');await wait(1200);await hold();await b.click('Вернуться к моим данным');await wait(1200);
    s=await stored();assert.equal(s.demoBackup,null);assert.equal(s.createdSessions.length,1,'Данные не вернулись');
    assert.equal(s.startedAt,before.startedAt,'Срок с Block не вернулся');assert.equal(s.rulesVariant,'onboarding');
    t=await text();assert.ok(t.includes('Рабочие часы')&&!t.includes('Apple Music'),'После выхода из демо');
    console.log('Live mode OK');
  }
  assert.deepEqual(b.errors,[],'Ошибки консоли');
}catch(e){console.log(String(e));await b.shot('/tmp/live-fail.png');process.exitCode=1}finally{await b.close()}
