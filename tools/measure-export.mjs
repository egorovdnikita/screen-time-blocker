#!/usr/bin/env node
// Рендерит экраны из HTML-выгрузки в Chromium и снимает реальные координаты:
// все тексты (позиция, кегль/насыщенность, цвет) и столбики графика (.bar).
// HTML в выгрузках абсолютный и часто однострочный — так быстрее, чем читать разметку.
//
//   node tools/measure-export.mjs <выходная-папка> <папка-экрана> [ещё экраны…]
//
// На каждый экран пишет <имя>.json: { texts: [...], bars: [[x, y, w, h, color]], bubbles: [...] }.
// Часы на графике: hour = round((x - 37.9) / 11.933), доля высоты = h / 84 (база графика — низ дорожек).
// Нужен playwright (в облачном окружении уже стоит).

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

// playwright в облачном окружении стоит глобально — ESM-импорт его не видит, require видит.
const { chromium } = createRequire(import.meta.url)('playwright');

const [outDir, ...dirs] = process.argv.slice(2);
if (!outDir || !dirs.length) {
  console.error('node tools/measure-export.mjs out/ export/24-home__01-home export/37-rules__01-…');
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 393, height: 852 } });
for (const d of dirs) {
  await page.goto('file://' + path.resolve(d, 'index.html') + '?full');
  await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const hex = (c) => {
      const m = c.match(/[\d.]+/g);
      if (!m) return c;
      const [r, g, b, a] = m.map(Number);
      const h = '#' + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('');
      return a !== undefined && a < 1 ? `${h}@${a}` : h;
    };
    const rect = (e) => {
      const b = e.getBoundingClientRect();
      return [b.x, b.y, b.width, b.height].map((v) => +v.toFixed(1));
    };
    const texts = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) {
      const n = w.currentNode;
      const t = n.textContent.trim();
      if (!t) continue;
      const cs = getComputedStyle(n.parentElement);
      const range = document.createRange();
      range.selectNodeContents(n);
      const b = range.getBoundingClientRect();
      texts.push(`${t} @${b.x.toFixed(1)},${b.y.toFixed(1)} ${cs.fontSize}/${cs.fontWeight} ${hex(cs.color)}`);
    }
    const bars = [...document.querySelectorAll('.bar')].map((e) => [...rect(e), hex(getComputedStyle(e).backgroundColor)]);
    const bubbles = [...document.querySelectorAll('.bubble, .activity-bubble')].map((e) => {
      const img = e.querySelector('img, use');
      return { rect: rect(e), icon: img ? (img.getAttribute('src') || img.getAttribute('href')).split(/[/#]/).pop() : null };
    });
    return { texts, bars, bubbles };
  });
  fs.writeFileSync(path.join(outDir, path.basename(d) + '.json'), JSON.stringify(r, null, 1));
  console.log(path.basename(d), `${r.texts.length} текстов, ${r.bars.length} столбиков`);
}
await browser.close();
