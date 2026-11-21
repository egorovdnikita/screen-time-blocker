// Регрессии аудита UI/UX 2026-11-21 на собранной веб-версии в реальном режиме.
// Запуск: EXPO_WEB_URL=http://localhost:8108 node tools/check-audit-20261121.mjs
import assert from 'node:assert/strict';
import { openChrome } from './lib/cdp.mjs';

const b = await openChrome({ port: 9383 });
const text = () => b.ev('document.body.innerText');
try {
  // Нет согласия с несуществующими документами.
  await b.nav('/onboarding');
  assert.ok(!(await text()).includes('Политикой конфиденциальности'), 'Строка о документах скрыта');

  // Обещания не противоречат следующему экрану «Это прототип».
  await b.nav('/onboarding?step=15');
  for (const promise of ['Блокируя приложения', '14 лет']) {
    assert.ok(!(await text()).includes(promise), `Нет обещания «${promise}»`);
  }

  // Цель и годы следуют ответу «сколько часов», а не цифрам макета.
  await b.nav('/onboarding?step=7');
  await b.click('1–3 часа');
  await b.click('Продолжить');
  assert.match(await text(), /Обычно вы проводите 1–3 часа в день/);
  assert.ok(!(await text()).includes('5 ч'), 'Цель меньше обычного времени');
  await b.click('Продолжить');
  await new Promise(r => setTimeout(r, 2600)); // экран подсчёта переходит сам
  await b.click('Расскажу подробнее');
  assert.match(await text(), /(^|\D)8 лет/);
  assert.ok(!(await text()).includes('28 лет'));

  // Нерабочий флаг языка скрыт в реальном режиме.
  await b.nav('/onboarding?step=1');
  assert.ok(!(await b.has('Язык: русский', 300)), 'Флаг языка скрыт');

  await b.nav('/onboarding?step=17');
  await b.click('Продолжить настройку');
  await b.click('Блокировать на работе');

  // P1: в реальном режиме видна только рабочая категория.
  assert.ok(await b.has('Категория знакомства: Социальные сети'));
  for (const hidden of ['Приложения и категории', 'Игры', 'Развлечения', 'Образование']) {
    assert.ok(!(await b.has(`Категория знакомства: ${hidden}`, 300)), `Скрыта категория ${hidden}`);
  }
  await b.click('Категория знакомства: Социальные сети');
  await b.click('Знакомство: FaceTime');
  await b.click('Продолжить');
  await b.click('Продолжить');
  await b.click('Выбрать');

  // P1: «на работе» — 8:00–17:00 и на подтверждении.
  assert.match(await text(), /8:00–17:00/);
  await b.click('Добавить расписание');
  assert.match(await text(), /8:00/);

  // Название не рвётся по дефису: в тексте интерфейса дефисы неразрывные.
  await b.nav('/');
  assert.match(await text(), /screen\u2011time\u2011blocker/);
  assert.ok(!(await text()).includes('screen-time-blocker'), 'Нет переносимых дефисов в названии');

  assert.deepEqual(b.errors, []);
  console.log('Аудит 2026-11-21: регрессии OK');
} finally {
  await b.close();
}
