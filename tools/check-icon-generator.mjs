import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'block-icon-generator-'));
try {
  for (const name of ['tools', 'src/icons', 'exports/icons']) fs.mkdirSync(path.join(root, name), { recursive: true });
  fs.copyFileSync(new URL('./gen-icons.mjs', import.meta.url), path.join(root, 'tools/gen-icons.mjs'));
  fs.writeFileSync(path.join(root, 'exports/icons/fixture.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><rect x="2" y="3" width="17" height="18"/><image href="data:image/png;base64," width="8" height="9"/></svg>');
  const result = spawnSync(process.execPath, [path.join(root, 'tools/gen-icons.mjs'), path.join(root, 'exports')], { encoding: 'utf8' });
  if (result.status !== 0) throw Error(result.stderr || result.stdout);
  const line = fs.readFileSync(path.join(root, 'src/icons/data.ts'), 'utf8').split('\n').find(line => line.startsWith('  "fixture":'));
  const xml = JSON.parse(line.slice(line.indexOf(':') + 1).trim().replace(/,$/, ''));
  if (/\b(?:width|height)=/.test(xml.match(/^<svg\b[^>]*>/)[0])) throw Error('Размеры корня не удалены');
  if (!xml.includes('width="17" height="18"') || !xml.includes('width="8" height="9"')) throw Error('Потеряны размеры вложенных фигур');
  console.log('Icon generator OK: root dimensions removed, rect/image preserved');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
