/// <reference types="node" />
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkHarness,
  contractDocs,
  readinessFailures,
  undatedSnapshots,
} from '../scripts/check-harness.mjs';
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

test('a document describing current code without a date is rejected as a stale-prone snapshot', () => {
  // The real failure: a code map was added to docs/ and promoted as a starting point. It read as a
  // rule, carried no date, and would have gone silently wrong on the next refactor.
  assert.deepEqual(
    undatedSnapshots([
      {
        path: 'docs/CODEBASE.html',
        head: '<title>FitIn 코드 지도</title>\n지금 구조는 이렇습니다.',
      },
    ]),
    ['docs/CODEBASE.html'],
  );
  // Stamping the moment it describes makes it honest, and it passes.
  assert.deepEqual(
    undatedSnapshots([
      { path: 'docs/CODEBASE.html', head: 'Snapshot of commit 74f5d2a · 2026-09-13' },
    ]),
    [],
  );
  // A contract states a rule that holds until the rule changes, so it carries no date by design.
  assert.deepEqual(
    undatedSnapshots([...contractDocs].map((path: string) => ({ path, head: 'A rule.' }))),
    [],
  );
  // An unlisted contract is not silently exempt: it has to be declared as one.
  assert.deepEqual(undatedSnapshots([{ path: 'docs/architecture/NEW.md', head: 'A rule.' }]), [
    'docs/architecture/NEW.md',
  ]);
});
