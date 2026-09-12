/// <reference types="node" />
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkHarness, readinessFailures } from '../scripts/check-harness.mjs';
test('AI harness resolves canonical docs, role routes, skills and contract ownership', () =>
  assert.deepEqual(checkHarness(), []));
test('release gate rejects simulated/unverified capability even with a fake evidence entry', () => {
  assert.deepEqual(
    readinessFailures(
      { checks: [{ id: 'airpods', status: 'unverified', evidence: ['unit-pass'] }] },
      { assets: [] },
    ),
    ['airpods'],
  );
});
test('release gate rejects verified status without evidence and draft anatomy', () => {
  assert.deepEqual(
    readinessFailures(
      { checks: [{ id: 'phone', status: 'verified', evidence: [] }] },
      { assets: [{ file: 'atlas', status: 'draft' }] },
    ),
    ['phone', 'atlas'],
  );
});
test('release readiness requires verified evidence and reviewed assets', () =>
  assert.deepEqual(
    readinessFailures(
      { checks: [{ id: 'phone', status: 'verified', evidence: ['device-test.md'] }] },
      { assets: [{ file: 'atlas', status: 'verified' }] },
    ),
    [],
  ));
