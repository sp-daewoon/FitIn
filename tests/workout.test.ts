/// <reference types="node" />
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  announcement,
  applyCommand,
  begin,
  Command,
  countdownCue,
  defaultPlan,
  elapsedAt,
  emptyData,
  finish,
  nextRoutine,
  planSeconds,
  position,
  swapUpcoming,
  TOTAL_SECONDS,
  validatePlan,
  withStarters,
} from '../src/workout';
const fresh = () => begin('fullA', defaultPlan('fullA'), 0, 'test');
function command(
  s: ReturnType<typeof fresh>,
  at: number,
  type: Command['type'],
  source: Command['source'] = 'app',
): Command {
  return {
    id: `${source}:${at}:${s.revision}`,
    sessionId: s.id,
    phaseId: position(s, at).phase!.id,
    revision: s.revision,
    source,
    type,
    at,
  };
}
test('check-in is exactly ten seconds, then first work set without another move/warmup', () => {
  const s = fresh();
  assert.equal(position(s, 0).phase?.kind, 'prepare');
  assert.equal(position(s, 9999).phase?.kind, 'prepare');
  assert.equal(position(s, 10000).phase?.kind, 'work');
  assert.equal(position(s, 10000).phase?.set, 1);
  assert.equal(planSeconds(defaultPlan('fullA')), 2050);
});
test('legacy presets remain stable; longer valid plans are accepted, invalid sets rejected', () => {
  for (const r of ['fullA', 'fullB', 'upper', 'lower', 'push', 'pull', 'legs'] as const)
    assert.ok(planSeconds(defaultPlan(r)) <= TOTAL_SECONDS);
  validatePlan(defaultPlan('fullA').map((x) => ({ ...x, sets: 5 })));
  assert.throws(() => validatePlan(defaultPlan('fullA').map((x) => ({ ...x, sets: 6 }))));
});
test('do not force filler time when routine finishes earlier', () => {
  const s = fresh();
  assert.equal(position(s, 2050000).phase, null);
  assert.equal(finish({ ...emptyData, session: s }, 2050000, 'routine').history[0].elapsed, 2050);
});
test('clock catches up after suspension without counting unconfirmed exercise', () => {
  const s = fresh();
  assert.equal(position(s, 300000).elapsed, 300);
  assert.equal(s.confirmed.length, 0);
});
test('work done early advances to rest; freed time is not appended anywhere', () => {
  const s = fresh(),
    n = applyCommand(s, command(s, 30000, 'next'));
  assert.equal(position(n, 30000).phase?.kind, 'rest');
  assert.equal(position(n, 30000).remaining, 90);
  assert.equal(n.confirmed.length, 1);
  assert.equal(
    n.phases.reduce((a, p) => a + p.seconds, 0),
    2010,
  );
});
test('rest can be skipped instantly, without claiming another completed set', () => {
  const s = fresh(),
    n = applyCommand(s, command(s, 75000, 'next'));
  assert.equal(position(n, 75000).phase?.kind, 'work');
  assert.equal(position(n, 75000).phase?.set, 2);
  assert.equal(n.confirmed.length, 0);
});
test('extra thirty seconds extends current phase, does not shorten following rest', () => {
  const s = fresh(),
    n = applyCommand(s, command(s, 65000, 'extend'));
  assert.equal(position(n, 65000).remaining, 35);
  assert.equal(position(n, 100000).phase?.kind, 'rest');
  assert.equal(position(n, 100000).phase?.seconds, 90);
});
test('pause freezes phase and budget and resume excludes paused wall time', () => {
  let s = fresh();
  s = applyCommand(s, command(s, 65000, 'pause'));
  assert.equal(elapsedAt(s, 500000), 65);
  s = applyCommand(s, command(s, 500000, 'resume'));
  assert.equal(elapsedAt(s, 501000), 66);
});
test('next cannot skip countdown or operate while paused', () => {
  const s = fresh();
  assert.equal(applyCommand(s, command(s, 5000, 'next')), s);
  const paused = applyCommand(s, command(s, 30000, 'pause'));
  assert.equal(applyCommand(paused, command(paused, 40000, 'next')), paused);
});
test('all input sources map to exactly the same state transition', () => {
  for (const source of ['app', 'watch', 'headphones'] as const) {
    const s = fresh(),
      n = applyCommand(s, command(s, 75000, 'next', source));
    assert.equal(position(n, 75000).phase?.set, 2);
    assert.equal(n.revision, 1);
  }
});
test('duplicate remote delivery does not advance twice', () => {
  const s = fresh(),
    c = command(s, 30000, 'next', 'watch'),
    n = applyCommand(s, c);
  assert.equal(applyCommand(n, c), n);
});
test('concurrent app and watch commands based on same revision cannot skip two phases', () => {
  const s = fresh(),
    a = command(s, 30000, 'next', 'app'),
    b = command(s, 30000, 'next', 'watch'),
    n = applyCommand(s, a);
  assert.equal(applyCommand(n, b), n);
});
test('delayed remote command after automatic boundary is rejected', () => {
  const s = fresh(),
    c = command(s, 65000, 'next', 'watch');
  assert.equal(applyCommand(s, { ...c, at: 71000 }), s);
});
test('wrong session command is rejected', () => {
  const s = fresh(),
    c = command(s, 30000, 'next');
  assert.equal(applyCommand(s, { ...c, sessionId: 'previous' }), s);
});
test('beeps are exactly 5,4,3,2,1 and silent during rest/pause', () => {
  const s = fresh();
  assert.equal(countdownCue(s, 64000), null);
  assert.deepEqual(
    [65, 66, 67, 68, 69].map((t) => countdownCue(s, t * 1000)?.seconds),
    [5, 4, 3, 2, 1],
  );
  assert.equal(countdownCue(s, 70000), null);
  const paused = applyCommand(s, command(s, 65000, 'pause'));
  assert.equal(countdownCue(paused, 65000), null);
});
test('extension restarts countdown at the extended boundary', () => {
  const s = fresh(),
    n = applyCommand(s, command(s, 65000, 'extend'));
  assert.equal(countdownCue(n, 65000), null);
  assert.equal(countdownCue(n, 95000)?.seconds, 5);
});
test('swapping future machines preserves their complete phase blocks and settings', () => {
  const plan = defaultPlan('fullA');
  plan[1].sets = 2;
  plan[2].rest = 60;
  const s = begin('fullA', plan, 0),
    n = swapUpcoming(s, 'chestPress', 'latPulldown', 10000);
  assert.deepEqual(
    n.phases.filter((p) => p.machine === 'chestPress'),
    s.phases.filter((p) => p.machine === 'chestPress'),
  );
  assert.ok(
    n.phases.findIndex((p) => p.machine === 'latPulldown') <
      n.phases.findIndex((p) => p.machine === 'chestPress'),
  );
  assert.equal(swapUpcoming(s, 'legPress', 'chestPress', 10000), s);
});
test('legacy 40 minute boundary ends even after repeated extensions', () => {
  let s = fresh();
  s.timeLimit = 2400;
  for (let i = 0; i < 90; i++) s = applyCommand(s, command(s, 11000, 'extend'));
  assert.equal(position(s, 2400000).phase, null);
  assert.equal(elapsedAt(s, 3000000), 2400);
  assert.equal(
    finish({ ...emptyData, session: s }, 2400000, 'routine').history[0].reason,
    'budget',
  );
});
test('separate direct performance records from automatic time and next routine', () => {
  const auto = finish({ ...emptyData, session: fresh() }, 2050000, 'routine');
  assert.equal(auto.history[0].confirmedSets, 0);
  assert.equal(nextRoutine(auto.history), 'fullA');
  let s = fresh();
  s = applyCommand(s, command(s, 30000, 'next'));
  const done = finish({ ...emptyData, session: s }, 2010000, 'routine');
  assert.equal(nextRoutine(done.history), 'fullB');
  assert.deepEqual(done.history[0].performed, ['legPress']);
  assert.equal(finish(done, 3000000, 'routine'), done);
});
test('stop does not advance routine', () => {
  let s = fresh();
  s = applyCommand(s, command(s, 30000, 'next'));
  const data = finish({ ...emptyData, session: s }, 40000, 'stopped');
  assert.equal(nextRoutine(data.history), 'fullA');
});
test('personal starter preference is optional, substitutes rather than appends', () => {
  const plan = defaultPlan('fullA');
  assert.ok(!plan.some((x) => x.machine === 'shoulderPress'));
  const proposal = withStarters(plan, ['shoulderPress', 'reverseGrip']);
  assert.equal(proposal.items.length, 5);
  assert.equal(proposal.items[0].machine, 'shoulderPress');
  assert.equal(proposal.items[1].machine, 'reverseGrip');
  assert.equal(planSeconds(proposal.items), planSeconds(plan));
  assert.ok(proposal.replaced.includes('row'));
  assert.equal(proposal.items.find((x) => x.machine === 'reverseGrip')?.rest, 90);
});
test('voice includes exact exercise name and set ordinal', () => {
  const s = begin('fullA', [{ machine: 'chestPress', sets: 3, work: 60, rest: 90 }], 0);
  assert.equal(
    announcement(position(s, 10000).phase),
    '체스트 프레스, 첫 번째 세트를 시작하겠습니다.',
  );
});
