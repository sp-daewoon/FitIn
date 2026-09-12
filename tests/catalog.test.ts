/// <reference types="node" />
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { decode } from '../src/codec';
import {
  announcement,
  begin,
  defaultPlan,
  emptyData,
  finish,
  MachineId,
  machines,
  planSeconds,
  position,
  TOTAL_SECONDS,
  validatePlan,
  withStarters,
} from '../src/workout';

const additions: MachineId[] = [
  'squat',
  'benchPress',
  'deadlift',
  'barbellRow',
  'overheadPress',
  'dumbbellBenchPress',
  'dumbbellRow',
  'lateralRaise',
  'dumbbellCurl',
];

test('new exercises run through spoken sets and survive saved plans, sessions and history', () => {
  for (const machine of additions) {
    const items = [{ machine, sets: 2, work: 60, rest: 90 }];
    const session = begin('fullA', items, 0);
    assert.equal(
      announcement(position(session, 10000).phase),
      `${machines[machine].name}, 첫 번째 세트를 시작하겠습니다.`,
    );
    const data = {
      ...emptyData,
      session,
      preferences: { ...emptyData.preferences, starters: [machine], savedPlan: items },
    };
    assert.deepEqual(decode(JSON.stringify(data)), data);
    const completed = finish(data, 220000, 'routine');
    assert.deepEqual(decode(JSON.stringify(completed)), completed);
  }
});

test('barbell personalization substitutes within budget without altering beginner default', () => {
  const original = defaultPlan('fullA');
  assert.ok(original.every((item) => machines[item.machine].equipment === '머신'));
  const proposal = withStarters(original, ['squat', 'benchPress', 'barbellRow']);
  assert.deepEqual(
    proposal.items.slice(0, 3).map((item) => item.machine),
    ['squat', 'benchPress', 'barbellRow'],
  );
  validatePlan(proposal.items);
  assert.equal(planSeconds(proposal.items), planSeconds(original));
  assert.ok(planSeconds(proposal.items) <= TOTAL_SECONDS);
  assert.deepEqual(defaultPlan('fullA'), original);
});

test('every exercise points to its own existing atlas cell, including across atlas boundaries', () => {
  const manifest = JSON.parse(
    readFileSync(new URL('../assets/exercises/manifest.json', import.meta.url), 'utf8'),
  );
  const cells: string[] = [];
  for (const asset of manifest.assets) {
    assert.ok(existsSync(new URL(`../${asset.file}`, import.meta.url)));
    assert.equal(asset.cells.length, 9);
    cells.push(...asset.cells);
  }
  assert.equal(new Set(cells).size, cells.length);
  assert.deepEqual([...cells].sort(), Object.keys(machines).sort());
  for (const id of Object.keys(machines) as MachineId[])
    assert.equal(cells[machines[id].atlas], id);
});
