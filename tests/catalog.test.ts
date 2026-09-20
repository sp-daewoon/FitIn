/// <reference types="node" />
import test, { beforeEach } from 'node:test';
import { setLanguage } from '../src/i18n';
beforeEach(() => setLanguage('ko'));
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
  'tricepsPushdown',
  'facePull',
  'romanianDeadlift',
  'crunch',
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
    assert.equal(asset.cells.length, (asset.columns ?? 3) ** 2);
    cells.push(...asset.cells);
  }
  assert.equal(new Set(cells).size, cells.length);
  assert.deepEqual([...cells].sort(), Object.keys(machines).sort());
  for (const id of Object.keys(machines) as MachineId[])
    assert.equal(cells[machines[id].atlas], id);
});

test('every exercise has a measured image frame, and no two figures share space', () => {
  const manifest = JSON.parse(
    readFileSync(new URL('../assets/exercises/manifest.json', import.meta.url), 'utf8'),
  );
  // The atlases are generated art and the generator does not keep figures inside equal cells, so
  // the app positions each one from a measured rectangle. A missing or overlapping rectangle means
  // a figure would be cut off or a neighbour would show in the corner.
  for (const asset of manifest.assets) {
    assert.ok(asset.imageSize > 0, `${asset.file} has no recorded image size`);
    const frames: [string, number[]][] = asset.cells.map((id: string) => [id, asset.frames?.[id]]);
    for (const [id, box] of frames) {
      assert.ok(Array.isArray(box) && box.length === 4, `${id} has no frame`);
      assert.ok(box[2] > box[0] && box[3] > box[1], `${id} has an empty frame`);
      assert.ok(
        box[0] >= 0 && box[1] >= 0 && box[2] <= asset.imageSize && box[3] <= asset.imageSize,
        `${id} reaches outside its atlas`,
      );
    }
    for (let i = 0; i < frames.length; i++)
      for (let j = i + 1; j < frames.length; j++) {
        const a = frames[i][1],
          b = frames[j][1];
        assert.ok(
          !(a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3]),
          `${frames[i][0]} and ${frames[j][0]} overlap in ${asset.file}`,
        );
      }
  }
  // Every catalog entry must be placeable, or it renders as an empty white box.
  const placed = new Set(manifest.assets.flatMap((a: { cells: string[] }) => a.cells));
  for (const id of Object.keys(machines)) assert.ok(placed.has(id), `${id} has no atlas frame`);
});
