import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyCommand,
  begin,
  defaultPreferences,
  emptyData,
  finish,
  position,
  recommendedPlan,
  resolvePlan,
  sessionLimit,
} from '../src/workout';
import { decode } from '../src/codec';

test('long sessions reload after 40 minutes and preserve guarded pause/resume and final records', () => {
  let session = begin('mixedA', recommendedPlan('mixedA'), 0);
  const command = {
    id: 'pause-long',
    sessionId: session.id,
    phaseId: position(session, 2500000).phase!.id,
    revision: 0,
    source: 'app' as const,
    type: 'pause' as const,
    at: 2500000,
  };
  session = applyCommand(session, command);
  const back = decode(JSON.stringify({ ...emptyData, session }));
  assert.equal(back.session!.elapsed, 2500);
  assert.equal(sessionLimit(back.session!), Infinity);
  assert.equal(applyCommand(back.session!, command), back.session);
  session = applyCommand(back.session!, {
    ...command,
    id: 'resume-long',
    type: 'resume',
    revision: 1,
    at: 3000000,
  });
  assert.equal(position(session, 3001000).elapsed, 2501);
  const done = finish({ ...back, session }, 5000000, 'routine');
  assert.ok(done.history[0].elapsed > 2400);
  assert.deepEqual(decode(JSON.stringify(done)), done);
});

test('version 3 paused sessions keep their original cap, phase identifiers and saved templates', () => {
  let session = begin('fullA', recommendedPlan('fullA'), 0);
  session = applyCommand(session, {
    id: 'pause',
    sessionId: session.id,
    phaseId: position(session, 15000).phase!.id,
    revision: 0,
    source: 'app',
    type: 'pause',
    at: 15000,
  });
  delete session.timeLimit;
  const legacy = {
    ...emptyData,
    version: 3,
    session,
    preferences: {
      ...defaultPreferences,
      globalRest: 120,
      templates: { fullA: [{ machine: 'squat', sets: 2, work: 45, rest: 120 }] },
    },
  };
  const back = decode(JSON.stringify(legacy));
  assert.equal(back.session!.paused, true);
  assert.equal(sessionLimit(back.session!), 2400);
  assert.deepEqual(back.session!.phases, session.phases);
  assert.deepEqual(back.preferences, legacy.preferences);
  assert.deepEqual(resolvePlan('fullA', back.preferences), legacy.preferences.templates.fullA);
});

test('legacy difficulty labels never change equipment or erase shorter customized goals', () => {
  for (const level of ['beginner', 'intermediate', 'advanced'] as const) {
    assert.deepEqual(
      resolvePlan('mixedB', { ...defaultPreferences, level }),
      recommendedPlan('mixedB'),
    );
    const short = [{ machine: 'deadlift' as const, sets: 2, work: 45, rest: 90 }];
    assert.deepEqual(
      resolvePlan('mixedB', { ...defaultPreferences, level, templates: { mixedB: short } }),
      short,
    );
  }
});
