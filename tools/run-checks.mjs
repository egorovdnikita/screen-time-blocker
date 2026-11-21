// Запуск проверок, которым не нужен браузер: логика данных, расписания, жесты листов.
// Браузерные сценарии (CDP) запускаются отдельно на собранной веб-версии.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const checks = [
  'check-chart-interaction.mjs',
  'check-app-name.mjs',
  'check-block-screen-data.mjs',
  'check-icon-generator.mjs',
  'check-gallery-presets.mjs',
  'check-notification-plan.mjs',
  'check-modal-lifecycle.mjs',
  'check-onboarding-goal.mjs',
  'check-onboarding-schedule.mjs',
  'check-reflection-summary.mjs',
  'check-rule-count.mjs',
  'check-sheet-scroll-events.mjs',
  'check-streak.mjs',
  'check-session-schedule.mjs',
  'check-sheet-layout-animation.mjs',
  'check-status-bar.mjs',
  'check-switch-native.mjs',
  'check-unlock-day.mjs',
];

let failed = 0;
for (const name of checks) {
  const run = spawnSync(process.execPath, ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', path.join(dir, name)], {
    encoding: 'utf8',
  });
  const ok = run.status === 0;
  if (!ok) failed++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}`);
  if (!ok) console.log((run.stdout + run.stderr).trim().split('\n').slice(-15).join('\n'));
}
console.log(`\n${checks.length - failed}/${checks.length} проверок прошли`);
process.exit(failed ? 1 : 0);
