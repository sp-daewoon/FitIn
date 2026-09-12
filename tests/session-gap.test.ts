/// <reference types="node" />
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ABANDON_SECONDS,
  applyCommand,
  begin,
  elapsedAt,
  emptyData,
  lastSeenAt,
  MachineId,
  PlanItem,
  position,
  reconcileOnLaunch,
  resumeAfterGap,
  touch,
} from '../src/workout';
import { decode } from '../src/codec';

const item = (machine: MachineId): PlanItem => ({ machine, sets: 3, work: 60, rest: 90 });
const plan = [item('legPress'), item('chestPress'), item('latPulldown')];
const running = () => begin('fullA', plan, 0);

test('turning the screen off keeps the clock running: a short gap is not reconciled', () => {
  const alive = touch(running(), 200_000);
  const short = reconcileOnLaunch(alive, 200_000 + (ABANDON_SECONDS - 1) * 1000);
  assert.equal(short.excluded, 0);
  assert.equal(short.session, alive, 'the session is returned untouched');
  // Wall-clock time since the session began is still credited in full.
  assert.equal(elapsedAt(alive, 300_000), 300);
});

test('relaunching after the process died freezes the unattended gap instead of counting it', () => {
  const alive = touch(running(), 200_000);
  const { session, excluded } = reconcileOnLaunch(alive, 500_000);
  assert.equal(excluded, 300, 'the gap since the last heartbeat is reported');
  assert.equal(session.elapsed, 200, 'time is frozen at the last moment a client was driving');
  assert.equal(session.paused, true);
  assert.equal(session.anchor, 500_000);
  assert.equal(session.lastSeen, 500_000);
  assert.equal(session.revision, alive.revision + 1, 'stale commands cannot apply afterwards');
  // A paused session is left alone; it was already not accruing time.
  const paused = { ...alive, paused: true };
  assert.equal(reconcileOnLaunch(paused, 500_000).excluded, 0);
});

test('the launch answer either credits the gap or discards it, and never invents sets', () => {
  const alive = touch(running(), 200_000);
  const { session, excluded } = reconcileOnLaunch(alive, 500_000);

  const discarded = resumeAfterGap(session, 500_000, 0);
  assert.equal(discarded.elapsed, 200);
  assert.equal(discarded.paused, false);
  assert.equal(elapsedAt(discarded, 500_000), 200, 'the clock restarts from the frozen point');

  // The watch case: the user confirms the session really was running while the app was dead.
  const credited = resumeAfterGap(session, 500_000, excluded);
  assert.equal(credited.elapsed, 500);
  assert.equal(credited.paused, false);

  for (const s of [discarded, credited]) {
    assert.deepEqual(s.confirmed, alive.confirmed, 'explicit set records are untouched');
    assert.deepEqual(s.phases, alive.phases, 'the plan is not truncated or reordered');
    assert.ok(position(s, 500_000).phase, 'the session is still running');
  }
});

test('the heartbeat only moves forward and never overrides a newer command', () => {
  const started = running();
  assert.equal(lastSeenAt(started), 0);
  const beat = touch(started, 200_000);
  assert.equal(lastSeenAt(beat), 200_000);
  assert.equal(lastSeenAt(touch(beat, 100_000)), 200_000, 'a late heartbeat cannot rewind');

  // An accepted command re-anchors the session, and that counts as being seen.
  // The command must name the phase that is current at the moment it is issued.
  const phase = position(beat, 300_000).phase!;
  const commanded = applyCommand(beat, {
    id: 'c1',
    sessionId: beat.id,
    phaseId: phase.id,
    revision: beat.revision,
    source: 'app',
    type: 'next',
    at: 300_000,
  });
  assert.equal(commanded.anchor, 300_000);
  assert.equal(lastSeenAt(commanded), 300_000, 'the last command outranks an older heartbeat');
  assert.equal(reconcileOnLaunch(commanded, 400_000).excluded, 0, 'only 100s passed since then');
});

test('a stored session carries its heartbeat, and one saved before the field falls back', () => {
  const saved = { ...emptyData, session: touch(running(), 200_000) };
  const back = decode(JSON.stringify(saved));
  assert.equal(back.session!.lastSeen, 200_000);

  const { lastSeen, ...withoutField } = saved.session;
  assert.equal(lastSeen, 200_000);
  const legacy = decode(JSON.stringify({ ...saved, session: { ...withoutField, anchor: 90_000 } }));
  assert.equal(legacy.session!.lastSeen, undefined);
  assert.equal(lastSeenAt(legacy.session!), 90_000, 'the last anchor is the floor');

  assert.throws(() =>
    decode(JSON.stringify({ ...saved, session: { ...saved.session, lastSeen: -1 } })),
  );
});

test('deleting records leaves the active session alone and recomputes the next routine', async () => {
  const { clearHistory, nextRoutine, removeRecords } = await import('../src/workout');
  const record = (id: string, routine: 'fullA' | 'fullB') => ({
    id,
    routine,
    endedAt: Number(id),
    elapsed: 600,
    confirmedSets: 6,
    completed: true,
    reason: 'routine' as const,
    performed: ['legPress' as const],
  });
  const session = touch(running(), 200_000);
  const data = {
    ...emptyData,
    session,
    history: [record('1', 'fullA'), record('2', 'fullB'), record('3', 'fullA')],
  };

  assert.equal(nextRoutine(data.history, 'full'), 'fullB', 'fullA was last, so fullB is next');
  const trimmed = removeRecords(data, ['3']);
  assert.deepEqual(
    trimmed.history.map((r) => r.id),
    ['1', '2'],
  );
  assert.equal(nextRoutine(trimmed.history, 'full'), 'fullA', 'the cycle follows what remains');
  assert.equal(trimmed.session, session, 'a running session is untouched');
  assert.deepEqual(
    data.history.map((r) => r.id),
    ['1', '2', '3'],
    'input is not mutated',
  );

  const cleared = clearHistory(data);
  assert.deepEqual(cleared.history, []);
  assert.equal(cleared.session, session);
  assert.equal(nextRoutine(cleared.history, 'full'), 'fullA', 'an empty history starts the cycle');
  // Deleting an id that is not present is a no-op rather than an error.
  assert.deepEqual(removeRecords(data, ['nope']).history.length, 3);
});
