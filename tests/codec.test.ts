/// <reference types="node" />
import test from 'node:test';
import assert from 'node:assert/strict';
import { decode } from '../src/codec';
import { applyCommand, begin, defaultPlan, emptyData } from '../src/workout';
test('round trip preserves a paused session and command deduplication', () => {
  let session = begin('fullA', defaultPlan('fullA'), 0);
  session = applyCommand(session, {
    id: 'pause',
    sessionId: session.id,
    phaseId: 'legPress:work:1',
    revision: 0,
    source: 'app',
    type: 'pause',
    at: 15000,
  });
  const data = { ...emptyData, session };
  assert.deepEqual(decode(JSON.stringify(data)), data);
});
test('corrupt and future snapshots are rejected rather than cleared', () => {
  assert.throws(() => decode('{'));
  assert.throws(() => decode(JSON.stringify({ ...emptyData, version: 4 })));
  assert.throws(() =>
    decode(
      JSON.stringify({
        ...emptyData,
        preferences: { ...emptyData.preferences, starters: ['missing'] },
      }),
    ),
  );
});
test('invalid phases, forged completion and negative clock are rejected', () => {
  for (const mutate of [
    (s: any) => (s.elapsed = -1),
    (s: any) => (s.phases[1].machine = 'missing'),
    (s: any) => (s.confirmed = ['prepare']),
    (s: any) => (s.phases[1].id = 'prepare'),
    (s: any) => (s.phases[1].set = 99),
  ]) {
    const session = begin('fullA', defaultPlan('fullA'), 0);
    mutate(session);
    assert.throws(() => decode(JSON.stringify({ ...emptyData, session })));
  }
});
test('shortened zero-second phases from early completion remain reloadable', () => {
  const session = begin('fullA', defaultPlan('fullA'), 0);
  session.phases[1].seconds = 0;
  session.confirmed = [session.phases[1].id];
  assert.deepEqual(decode(JSON.stringify({ ...emptyData, session })).session, session);
});
