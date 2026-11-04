// Серия считается только по выполненным дням (P1 аудита 2026-11-05). Node 24 читает TS напрямую.
import assert from 'node:assert/strict';
import {bestStreak,currentStreak,withDay} from '../src/data/streak.ts';
assert.equal(currentStreak(undefined,'2026-11-5'),0,'Новое правило без серии');
assert.equal(currentStreak(['2026-11-5'],'2026-11-5'),1);
assert.equal(currentStreak(['2026-11-3','2026-11-4'],'2026-11-5'),2,'Сегодня ещё не выполнено: серия жива');
assert.equal(currentStreak(['2026-11-2','2026-11-3'],'2026-11-5'),0,'Пропуск обрывает серию');
assert.equal(currentStreak(['2026-10-31','2026-11-1'],'2026-11-1'),2,'Переход через месяц');
assert.equal(currentStreak(['2026-12-31','2027-1-1'],'2027-1-1'),2,'Переход через год');
assert.equal(bestStreak({}),0);
assert.equal(bestStreak({a:['2026-11-1','2026-11-2','2026-11-5'],b:['2026-11-5']}),2);
assert.deepEqual(withDay(['2026-11-5'],'2026-11-5'),['2026-11-5'],'День не удваивается');
console.log('Streak OK');
