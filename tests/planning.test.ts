/// <reference types="node" />
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultPreferences,
  defaultPlan,
  nextRoutine,
  planSeconds,
  resolvePlan,
  routineCycle,
  Split,
  validatePlan,
  begin,
  finish,
  emptyData,
  applyCommand,
  position,
} from '../src/workout';
import { exerciseVideos, videoSearch } from '../src/videos';
import { machines, MachineId } from '../src/workout';

test('each selectable program exposes its complete valid cycle, and previews preserve the 40 minute cap', () => {
  for (const split of ['full', 'upperLower', 'ppl', 'fixed'] as Split[]) {
    const preferences = { ...defaultPreferences, split };
    const cycle = routineCycle(split);
    assert.equal(nextRoutine([], split), cycle[0]);
    for (const routine of cycle) {
      const plan = resolvePlan(routine, preferences);
      validatePlan(plan);
      assert.ok(planSeconds(plan) <= 2400);
      assert.deepEqual(plan, defaultPlan(routine));
    }
  }
});
test('future previews use saved custom exercise settings without mutating persisted data', () => {
  const preferences = {
    ...defaultPreferences,
    savedPlan: [{ machine: 'squat' as const, sets: 2, work: 60, rest: 120 }],
  };
  const plan = resolvePlan('fullB', preferences);
  assert.deepEqual(plan, preferences.savedPlan);
  plan[0].rest = 30;
  assert.equal(preferences.savedPlan[0].rest, 120);
});
test('personal starters apply to upper sessions while lower-session preview stays lower', () => {
  const preferences = { ...defaultPreferences, starters: ['shoulderPress' as const] };
  assert.equal(resolvePlan('upper', preferences)[0].machine, 'shoulderPress');
  assert.deepEqual(resolvePlan('lower', preferences), defaultPlan('lower'));
});
test('days passing and stopping never advance cycle; explicit performed routine completion does', () => {
  let session = begin('upper', defaultPlan('upper'), 0);
  session = applyCommand(session, {
    id: 'next',
    sessionId: session.id,
    phaseId: position(session, 15000).phase!.id,
    revision: 0,
    source: 'app',
    type: 'next',
    at: 15000,
  });
  assert.equal(
    nextRoutine(finish({ ...emptyData, session }, 16000, 'stopped').history, 'upperLower'),
    'upper',
  );
  const done = finish({ ...emptyData, session }, 1600000, 'routine');
  assert.equal(nextRoutine(done.history, 'upperLower'), 'lower');
});
test('every exercise has a correctly encoded search fallback and direct references stay on YouTube', () => {
  for (const machine of Object.keys(machines) as MachineId[]) {
    const url = new URL(videoSearch(machine));
    assert.equal(url.hostname, 'www.youtube.com');
    assert.ok(url.searchParams.get('search_query')?.startsWith(machines[machine].name));
  }
  for (const video of Object.values(exerciseVideos))
    assert.ok(['youtube.com', 'youtu.be'].includes(new URL(video.url).hostname));
});
