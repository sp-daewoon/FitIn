import {
  Data,
  DEFAULT_REST,
  machines,
  PlanItem,
  Preferences,
  TOTAL_SECONDS,
  validateTemplate,
} from './workout';
const object = (v: unknown): v is Record<string, any> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const strings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');
const machine = (v: unknown) => typeof v === 'string' && Object.hasOwn(machines, v);
const routines = ['fullA', 'fullB', 'upper', 'lower', 'push', 'pull', 'legs'];
/**
 * Version 2 stays readable and is upgraded in memory only. The version-2 snapshot on disk is
 * never rewritten or cleared, so a downgrade still finds its original record.
 */
function upgrade(d: Record<string, any>): Data {
  if (d.version === 3) return d as Data;
  const pref: Preferences = {
    ...(d.preferences as Preferences),
    globalRest: DEFAULT_REST,
    templates: {},
  };
  return { ...d, version: 3, preferences: pref } as Data;
}
/** Unknown/future/corrupt data fails closed. The caller must not overwrite the original. */
export function decode(raw: string): Data {
  const d: unknown = JSON.parse(raw);
  if (
    !object(d) ||
    (d.version !== 2 && d.version !== 3) ||
    typeof d.sound !== 'boolean' ||
    !Array.isArray(d.history) ||
    !object(d.preferences)
  )
    throw Error('지원하지 않는 저장 형식입니다.');
  const pref = d.preferences;
  if (
    !['beginner', 'intermediate', 'advanced'].includes(pref.level) ||
    !['full', 'upperLower', 'ppl', 'fixed'].includes(pref.split) ||
    !Array.isArray(pref.starters) ||
    pref.starters.length > 3 ||
    !pref.starters.every(machine) ||
    new Set(pref.starters).size !== pref.starters.length
  )
    throw Error('개인 설정을 읽을 수 없습니다.');
  if (pref.savedPlan !== null) validateTemplate(pref.savedPlan);
  if (d.version === 3) {
    if (
      !Number.isInteger(pref.globalRest) ||
      pref.globalRest < 30 ||
      pref.globalRest > 180 ||
      !object(pref.templates) ||
      Object.keys(pref.templates).some((key) => !routines.includes(key))
    )
      throw Error('개인 설정을 읽을 수 없습니다.');
    for (const template of Object.values(pref.templates) as PlanItem[][])
      validateTemplate(template);
  }
  if (
    !d.history.every(
      (r: unknown) =>
        object(r) &&
        typeof r.id === 'string' &&
        routines.includes(r.routine) &&
        finite(r.endedAt) &&
        finite(r.elapsed) &&
        r.elapsed <= TOTAL_SECONDS &&
        Number.isInteger(r.confirmedSets) &&
        r.confirmedSets >= 0 &&
        r.confirmedSets <= 60 &&
        typeof r.completed === 'boolean' &&
        ['routine', 'budget', 'stopped'].includes(r.reason) &&
        Array.isArray(r.performed) &&
        r.performed.every(machine),
    )
  )
    throw Error('기록을 읽을 수 없습니다.');
  const s = d.session;
  if (s !== null) {
    if (
      !object(s) ||
      typeof s.id !== 'string' ||
      !routines.includes(s.routine) ||
      !finite(s.startedAt) ||
      !finite(s.anchor) ||
      !finite(s.elapsed) ||
      s.elapsed > TOTAL_SECONDS ||
      typeof s.paused !== 'boolean' ||
      !Number.isInteger(s.revision) ||
      s.revision < 0 ||
      !strings(s.commands) ||
      s.commands.length > 64 ||
      !strings(s.confirmed) ||
      !Array.isArray(s.phases) ||
      s.phases.length < 2 ||
      s.phases.length > 160
    )
      throw Error('진행 중인 세션을 읽을 수 없습니다.');
    if (
      !s.phases.every(
        (p: unknown) =>
          object(p) &&
          typeof p.id === 'string' &&
          ['prepare', 'move', 'work', 'rest'].includes(p.kind) &&
          finite(p.seconds) &&
          p.seconds <= TOTAL_SECONDS &&
          machine(p.machine) &&
          (p.kind === 'work' || p.kind === 'rest'
            ? Number.isInteger(p.set) &&
              p.set >= 1 &&
              p.set <= 5 &&
              Number.isInteger(p.sets) &&
              p.sets >= p.set &&
              p.sets <= 5
            : true),
      ) ||
      s.phases[0].kind !== 'prepare' ||
      s.phases.slice(1).some((p: any) => p.kind === 'prepare') ||
      new Set(s.phases.map((p: any) => p.id)).size !== s.phases.length ||
      new Set(s.confirmed).size !== s.confirmed.length ||
      !s.confirmed.every((id: string) =>
        s.phases.some((p: any) => p.id === id && p.kind === 'work'),
      )
    )
      throw Error('운동 단계가 손상됐습니다.');
  }
  return upgrade(d);
}
