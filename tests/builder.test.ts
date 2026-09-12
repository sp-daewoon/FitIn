/// <reference types="node" />
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyCommand,
  applyGlobalRest,
  begin,
  buildPhases,
  capPlan,
  DEFAULT_REST,
  defaultPlan,
  defaultPreferences,
  emptyData,
  MachineId,
  markRestOverrides,
  PlanItem,
  planBreakdown,
  planSeconds,
  position,
  resolvePlan,
  resolveTemplate,
  TOTAL_SECONDS,
  validatePlan,
  validateTemplate,
  withStarters,
} from '../src/workout';
import { decode } from '../src/codec';

const item = (machine: MachineId, extra: Partial<PlanItem> = {}): PlanItem => ({
  machine,
  sets: 3,
  work: 60,
  rest: 90,
  ...extra,
});

test('multiple end finishers persist in order and may repeat a movement only as finishers', () => {
  const template = [
    ...defaultPlan('fullA'),
    item('deadlift', { finisher: true }),
    item('facePull', { finisher: true }),
    item('crunch', { finisher: true }),
  ];
  validateTemplate(template);
  const preferences = { ...defaultPreferences, templates: { fullA: template } };
  const stored = resolveTemplate('fullA', preferences);
  assert.deepEqual(
    stored.slice(-3).map((x) => x.machine),
    ['deadlift', 'facePull', 'crunch'],
  );
  // A repeat is legal as an explicit finisher.
  validateTemplate([...defaultPlan('fullA'), item('legPress', { finisher: true })]);
  // The same repeat inside the default sequence is still rejected.
  assert.throws(() => validateTemplate([...defaultPlan('fullA'), item('legPress')]));
  assert.throws(() => validateTemplate(Array.from({ length: 13 }, () => item('squat'))));
});

test('a repeated finisher keeps distinct phases, so its sets are recorded separately', () => {
  const plan = [item('legPress', { sets: 1 }), item('legPress', { sets: 1, finisher: true })];
  const phases = buildPhases(plan);
  const ids = phases.map((x) => x.id);
  assert.equal(new Set(ids).size, ids.length);
  let session = begin('fullA', plan, 0);
  const first = position(session, 11000).phase!;
  assert.equal(first.kind, 'work');
  session = applyCommand(session, {
    id: 'c1',
    sessionId: session.id,
    phaseId: first.id,
    revision: 0,
    source: 'app',
    type: 'next',
    at: 11000,
  });
  assert.deepEqual(session.confirmed, [first.id]);
  const second = position(session, 80000).phase!;
  assert.equal(second.kind, 'work');
  assert.notEqual(second.id, first.id);
  assert.equal(second.machine, 'legPress');
});

test('global rest reaches every set except an explicitly overridden exercise', () => {
  const plan = [item('legPress'), item('deadlift', { rest: 150, restOverride: true })];
  const applied = applyGlobalRest(plan, 120);
  assert.equal(applied[0].rest, 120);
  assert.equal(applied[1].rest, 150);
  assert.equal(plan[0].rest, 90, 'input is not mutated');
  const fresh = resolveTemplate('fullA', { ...defaultPreferences, globalRest: 120 });
  assert.ok(fresh.every((x) => x.rest === 120));
  assert.equal(defaultPreferences.globalRest, DEFAULT_REST);
});

test('per-exercise work duration changes only that exercise time', () => {
  const before = [item('legPress'), item('deadlift')];
  const after = [item('legPress'), item('deadlift', { work: 90 })];
  const a = planBreakdown(before),
    b = planBreakdown(after);
  assert.equal(b.work - a.work, 90);
  assert.equal(a.rest, b.rest);
  assert.equal(a.move, b.move);
  assert.equal(a.move, 60);
  assert.equal(a.setup + a.work + a.rest + a.move, planSeconds(before));
});

test('new execution accepts long templates; legacy capping helper reports dropped items', () => {
  const overCap = [
    ...defaultPlan('fullA'),
    item('deadlift', { finisher: true, sets: 4, work: 90, rest: 150 }),
    item('barbellRow', { finisher: true, sets: 4, work: 90, rest: 150 }),
  ];
  assert.ok(planSeconds(overCap) > TOTAL_SECONDS);
  validateTemplate(overCap);
  validatePlan(overCap);
  assert.ok(position(begin('fullA', overCap, 0), 2400000).phase);
  const capped = capPlan(overCap);
  assert.ok(planSeconds(capped.items) <= TOTAL_SECONDS);
  assert.ok(capped.dropped.length > 0, 'dropped items are reported, not silently removed');
  assert.deepEqual(
    [...capped.items, ...capped.dropped].map((x) => x.machine),
    overCap.map((x) => x.machine),
  );
  capped.items.forEach((x, i) => assert.equal(x.rest, overCap[i].rest, 'rest is never compressed'));
  validatePlan(capped.items);
  // A plan that already fits is returned untouched.
  assert.deepEqual(capPlan(defaultPlan('fullA')).dropped, []);
});

test('starter preferences never replace or reorder a finisher', () => {
  const template = [...defaultPlan('upper'), item('deadlift', { finisher: true })];
  const proposal = withStarters(template, ['shoulderPress']);
  assert.equal(proposal.items[0].machine, 'shoulderPress');
  assert.equal(proposal.items[proposal.items.length - 1].machine, 'deadlift');
  assert.ok(!proposal.replaced.includes('deadlift'));
  const preferences = {
    ...defaultPreferences,
    starters: ['shoulderPress' as const],
    templates: { upper: template },
  };
  assert.equal(resolvePlan('upper', preferences).at(-1)!.machine, 'deadlift');
});

test('a saved template survives a storage roundtrip and a version-2 snapshot still opens', () => {
  const template = [...defaultPlan('fullA'), item('deadlift', { finisher: true, work: 90 })];
  const saved = {
    ...emptyData,
    preferences: { ...defaultPreferences, globalRest: 120, templates: { fullA: template } },
  };
  const back = decode(JSON.stringify(saved));
  assert.equal(back.version, 4);
  assert.equal(back.preferences.globalRest, 120);
  assert.deepEqual(back.preferences.templates.fullA, template);

  const legacy = {
    version: 2,
    history: [],
    session: null,
    sound: true,
    preferences: {
      level: 'beginner',
      split: 'fixed',
      starters: [],
      savedPlan: [{ machine: 'squat', sets: 2, work: 60, rest: 120 }],
    },
  };
  const upgraded = decode(JSON.stringify(legacy));
  assert.equal(upgraded.version, 4);
  assert.equal(upgraded.preferences.globalRest, DEFAULT_REST);
  assert.deepEqual(upgraded.preferences.templates, {});
  assert.equal(upgraded.preferences.savedPlan![0].rest, 120, 'explicit version-2 rest is kept');
  assert.equal(resolveTemplate('fullB', upgraded.preferences)[0].rest, 120);

  assert.throws(() =>
    decode(
      JSON.stringify({
        ...saved,
        preferences: { ...saved.preferences, globalRest: 20 },
      }),
    ),
  );
  assert.throws(() =>
    decode(
      JSON.stringify({
        ...saved,
        preferences: { ...saved.preferences, templates: { nope: template } },
      }),
    ),
  );
});

test('in-session reorder targets the first upcoming block and leaves the current one alone', async () => {
  const { swapUpcoming } = await import('../src/workout');
  const plan = [
    item('legPress', { sets: 1 }),
    item('chestPress', { sets: 1 }),
    item('latPulldown', { sets: 1 }),
    item('chestPress', { sets: 1, finisher: true }),
  ];
  const session = begin('fullA', plan, 0);
  const swapped = swapUpcoming(session, 'chestPress', 'latPulldown', 5000);
  const order = swapped.phases.filter((x) => x.kind === 'work').map((x) => x.machine);
  assert.deepEqual(order, ['legPress', 'latPulldown', 'chestPress', 'chestPress']);
  // The block already started or finished is not reordered.
  assert.equal(swapUpcoming(session, 'legPress', 'chestPress', 5000), session);
  assert.equal(swapUpcoming(session, 'chestPress', 'chestPress', 5000), session);
});

test('a hand-edited rest value is kept as a labeled override, not overwritten by global rest', () => {
  const edited = [item('legPress'), item('deadlift', { rest: 120 }), item('crunch', { rest: 90 })];
  const marked = markRestOverrides(edited, 90);
  assert.deepEqual(
    marked.map((x) => !!x.restOverride),
    [false, true, false],
  );
  // The global control still reaches the untouched items and leaves the explicit one alone.
  const after = applyGlobalRest(marked, 60);
  assert.deepEqual(
    after.map((x) => x.rest),
    [60, 120, 60],
  );
  assert.equal(edited[1].restOverride, undefined, 'input is not mutated');
  // An item already overridden keeps its flag, and a matching value is not falsely marked.
  assert.equal(
    markRestOverrides([item('squat', { rest: 90, restOverride: true })], 90)[0].restOverride,
    true,
  );
});
