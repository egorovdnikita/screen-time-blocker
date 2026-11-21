// Запись промо-ролика: настоящая веб-сборка screen-time-blocker в headless Chrome, кадр за кадром.
// Время подменено часами Playwright, поэтому анимации идут ровно 30 кадров/с независимо от скорости машины.
// Использование: node scripts/promo/record.mjs ПАПКА  (переменная PROMO_ENV — папка с установленным playwright)
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = path.resolve(process.argv[2] ?? '/tmp/block-promo');
const env = process.env.PROMO_ENV ?? '/tmp/block-promo-env';
const {chromium} = await import(pathToFileURL(path.join(env, 'node_modules/playwright/index.mjs')).href);

const FPS = 30;
const SCALE = 2; // кадр экрана 786×1704 px, при монтаже уменьшается
const W = 393, H = 852;

// Статический сервер для dist/ (npx expo export -p web)
const dist = path.join(root, 'dist');
if (!fs.existsSync(path.join(dist, 'index.html'))) throw Error('Нет dist/: сначала npx expo export -p web');
const types = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.otf': 'font/otf', '.json': 'application/json', '.ico': 'image/x-icon', '.webp': 'image/webp', '.svg': 'image/svg+xml'};
const server = http.createServer((req, res) => {
  let file = path.join(dist, decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(dist) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dist, 'index.html');
  res.writeHead(200, {'Content-Type': types[path.extname(file)] ?? 'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
}).listen(0);
const base = `http://localhost:${server.address().port}/`;

fs.rmSync(out, {recursive: true, force: true});
fs.mkdirSync(path.join(out, 'frames'), {recursive: true});

const browser = await chromium.launch({channel: 'chrome'});
const page = await browser.newPage({viewport: {width: W, height: H}, deviceScaleFactor: SCALE});
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
// Демо-режим: состояние только в памяти, знакомство не открывается, данные вымышленные.
await page.addInitScript('globalThis.__BLOCK_DEMO__=1');
await page.clock.install({time: new Date('2026-06-24T14:30:00')});
await page.goto(base);
await page.clock.runFor(4000);
for (let i = 0; i < 60; i++) {
  if (await page.locator('[aria-label="Начать блокировку"]').count()) break;
  await page.waitForTimeout(100);
  await page.clock.runFor(100);
}
await page.clock.runFor(2000);

let frame = 0;
const clicks = [];
const capture = async () => {
  await page.screenshot({path: path.join(out, 'frames', `${String(frame).padStart(5, '0')}.png`)});
  frame++;
  // Ровная сетка: время кадра n — round(n*1000/30) мс
  await page.clock.runFor(Math.round(frame * 1000 / FPS) - Math.round((frame - 1) * 1000 / FPS));
};
const hold = async seconds => { const n = Math.round(seconds * FPS); for (let i = 0; i < n; i++) await capture(); };

const center = label => page.evaluate(l => {
  const els = [...document.querySelectorAll('[role="button"],[role="tab"],[role="switch"],[aria-label]')];
  const e = els.findLast(e => e.getAttribute('aria-label') === l || e.textContent.trim() === l);
  if (!e) return null;
  const r = e.getBoundingClientRect();
  return {x: r.x + r.width / 2, y: r.y + r.height / 2, rect: [r.x, r.y, r.width, r.height]};
}, label);

// Касание: кольцо появляется до нажатия (как в промо Agent Pulse), палец держится 0,1 с.
const tap = async (label, after) => {
  const c = await center(label);
  if (!c) throw Error('Нет кнопки: ' + label);
  clicks.push({t: frame / FPS, x: c.x, y: c.y, rect: c.rect, label});
  await page.mouse.move(c.x, c.y);
  await page.mouse.down();
  await hold(.1);
  await page.mouse.up();
  await hold(after);
};

const scenario = [
  [null, 1.6],
  ['Период', 1.0], ['Вчера', 1.7],
  ['Период', 0.9], ['Сегодня', 1.3],
  ['Начать блокировку', 1.2], ['Прямо сейчас', 1.9], ['Начать', 2.3],
  ['Подробности сессии Сессия', 1.5], ['Удалить сессию', 1.1], ['Удалить', 2.1],
  ['Профиль', 2.2], ['Главная', 2.0],
];
try {
  for (const [label, after] of scenario) {
    if (label) await tap(label, after);
    else await hold(after);
  }
  const final = await page.evaluate(() => document.querySelector('[role="tab"][aria-label^="Правила"]')?.getAttribute('aria-label'));
  if (final !== 'Правила, активных: 3') throw Error('Состояние не вернулось к началу: ' + final);
  if (errors.length) throw Error('Ошибки страницы: ' + errors.join('\n'));
  fs.writeFileSync(path.join(out, 'record.json'), JSON.stringify({fps: FPS, scale: SCALE, width: W, height: H, frames: frame, clicks}, null, 2));
  console.log(`Записано ${frame} кадров (${(frame / FPS).toFixed(2)} с), касаний: ${clicks.length}`);
} finally {
  await browser.close();
  server.close();
}
