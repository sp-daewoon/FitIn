import test from 'node:test';
import assert from 'node:assert/strict';
import { setLanguage, getLanguage, t } from '../src/i18n';
import { announcement, begin, emptyData, machines, recommendedPlan } from '../src/workout';
import { decode } from '../src/codec';
import english from '../src/locales/en.json';

test('English default and language switching preserve the workout and saved preferences', () => {
  assert.equal(getLanguage(), 'en');
  const plan = recommendedPlan('fullA');
  const session = begin('fullA', plan, 1000);
  const work = session.phases.find((p) => p.kind === 'work')!;
  const en = announcement(work);
  assert.match(en, /set/i);
  for (const language of ['ko', 'en'] as const) {
    setLanguage(language);
    assert.deepEqual(recommendedPlan('fullA'), plan);
    assert.deepEqual(begin('fullA', plan, 1000), session);
    const data = { ...emptyData, preferences: { ...emptyData.preferences, language }, session };
    assert.deepEqual(decode(JSON.stringify(data)), data);
    for (const machine of Object.values(machines)) {
      for (const key of ['name', 'area', 'secondary', 'cue', 'setup'] as const) {
        assert(machine[key].length > 0);
        if (language === 'en') assert.doesNotMatch(machine[key], /[가-힣]/);
      }
    }
  }
  setLanguage('ko');
  assert.match(announcement(work), /첫 번째 세트/);
  setLanguage('en');
  assert.equal(announcement(work), en);
});

test('translation placeholders never introduce unknown parameters', () => {
  for (const [key, value] of Object.entries(english)) {
    const placeholders = new Set(key.match(/\{\d+\}/g));
    for (const token of value.match(/\{\d+\}/g) ?? []) assert(placeholders.has(token), key);
  }
  assert.equal(t('{0} / {1}세트', 2, 5), 'Set 2 of 5');
});
