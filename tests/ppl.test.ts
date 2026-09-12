/// <reference types="node" />
import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultPlan, planSeconds, machines, begin, emptyData } from '../src/workout';
import { scheduleExample } from '../src/programGuidance';
import { decode } from '../src/codec';

test('PPL covers missing movement roles without redundant row variants or exceeding the time budget', () => {
  const patterns = (routine: 'push' | 'pull' | 'legs') =>
    defaultPlan(routine).map((item) => machines[item.machine].pattern);
  assert.ok(patterns('push').includes('팔꿈치 펴기'));
  assert.ok(patterns('push').includes('어깨 벌리기'));
  assert.ok(patterns('pull').includes('후면 어깨 당기기'));
  assert.ok(patterns('pull').includes('팔꿈치 굽히기'));
  assert.equal(patterns('pull').filter((pattern) => pattern === '수평 당기기').length, 1);
  assert.ok(patterns('legs').includes('힙 힌지'));
  assert.ok(patterns('legs').includes('몸통 굽히기'));
  for (const routine of ['push', 'pull', 'legs'] as const)
    assert.ok(planSeconds(defaultPlan(routine)) <= 2400);
  assert.equal(planSeconds(defaultPlan('push')), 2050);
  assert.equal(planSeconds(defaultPlan('pull')), 1630);
  assert.equal(planSeconds(defaultPlan('legs')), 2050);
});
test('weekly examples distinguish one vs two exposures and rolling cycles include their own rest days', () => {
  const three = scheduleExample('ppl', 'three');
  const six = scheduleExample('ppl', 'six');
  for (const label of ['밀기', '당기기', '하체']) {
    assert.equal(three.filter((day) => day.label === label).length, 1);
    assert.equal(six.filter((day) => day.label === label).length, 2);
  }
  assert.equal(three.filter((day) => day.label === '휴식').length, 4);
  assert.equal(six[6].label, '휴식');
  assert.deepEqual(
    scheduleExample('ppl', 'rolling').map((day) => day.label),
    ['밀기', '당기기', '하체', '휴식', '밀기', '당기기', '하체', '휴식'],
  );
});
test('existing two-exercise pull session and saved overrides survive expanded defaults unchanged', () => {
  const oldPlan = [
    { machine: 'latPulldown' as const, sets: 3, work: 60, rest: 90 },
    { machine: 'row' as const, sets: 3, work: 60, rest: 90 },
  ];
  const session = begin('pull', oldPlan, 0);
  const data = {
    ...emptyData,
    session,
    preferences: { ...emptyData.preferences, savedPlan: oldPlan },
  };
  assert.deepEqual(decode(JSON.stringify(data)), data);
  assert.equal(new Set(session.phases.map((phase) => phase.machine)).size, 2);
});
