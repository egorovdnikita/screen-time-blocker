// Регрессии трёх подтверждённых P1 из аудита b905397. Проверяем пользовательский путь на сборке.
import assert from 'node:assert/strict';
import { openChrome } from './lib/cdp.mjs';
const b = await openChrome({port:9382});
const text = () => b.ev('document.body.innerText');
try {
  await b.nav('/onboarding?step=17');
  assert.match(await text(), /Это прототип/);
  assert.match(await text(), /Блокировка приложений.*пока не подключены/s);
  assert.ok(!await b.has('Подключить экранное время',300));
  await b.shot('.expo/audit-connect-mobile.png');
  await b.click('Продолжить настройку');
  assert.ok(!await b.has('Ограничить приложения',300));
  await b.click('Настроить расписание');
  await b.click('Категория знакомства: Социальные сети');
  await b.click('Знакомство: FaceTime');
  await b.click('Продолжить');
  await b.click('Продолжить');
  await b.click('Выбрать');
  assert.match(await text(), /Рабочие часы/);
  assert.match(await text(), /Сохранится на устройстве/);
  assert.match(await text(), /9:00–17:00/);
  await b.click('Добавить расписание');
  assert.match(await text(), /Рабочие часы/);
  assert.ok(await b.has('FaceTime'));
  await b.click('Профиль');
  await b.shot('.expo/audit-profile-mobile.png');
  await b.click('Настройки профиля');
  await b.click('Общие настройки: Экранное время');
  assert.ok(!await b.has('Настроить напоминания',300));
  assert.ok(await b.has('Настроить дни цели'));
  await b.shot('.expo/audit-time-mobile.png');
  await b.nav('/');
  assert.match(await text(), /Прототип: правила сохраняются/);
  assert.match(await text(), /screen[-\u2011]time[-\u2011]blocker/);
  assert.deepEqual(b.errors,[]);
  console.log('Аудит: расписание соответствует выбору, прототип обозначен, напоминания скрыты — OK');
} finally { await b.close(); }
