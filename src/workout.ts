/** Platform-independent clock and command engine. All times are active seconds. */
export const TOTAL_SECONDS = 2400;
export const PREPARE_SECONDS = 10;
export const MOVE_SECONDS = 60;
export const DEFAULT_REST = 90;
export const DEFAULT_WORK = 60;
export const WORK_GOAL_SECONDS = 25 * 60;
/** Bounds editable membership and persisted phase count, independent of duration. */
export const MAX_ITEMS = 12;
export const REST_CHOICES = [45, 60, 75, 90, 105, 120, 150, 180];
export const machines = {
  chestPress: {
    name: '체스트 프레스',
    equipment: '머신',
    region: '상체',
    area: '가슴',
    secondary: '삼두 · 앞쪽 어깨',
    pattern: '수평 밀기',
    atlas: 0,
    cue: '등을 붙이고 손목을 곧게 유지하며 앞으로 밀어주세요.',
    setup: '손잡이가 가슴 중앙에 오도록 의자 높이를 맞추세요.',
  },
  latPulldown: {
    name: '랫 풀다운',
    equipment: '머신',
    region: '상체',
    area: '등',
    secondary: '이두',
    pattern: '수직 당기기',
    atlas: 1,
    cue: '어깨를 내리고 팔꿈치를 아래로 당겨주세요.',
    setup: '허벅지 패드를 고정하고 발바닥을 바닥에 붙이세요.',
  },
  row: {
    name: '시티드 로우',
    equipment: '머신',
    region: '상체',
    area: '등',
    secondary: '이두 · 뒤쪽 어깨',
    pattern: '수평 당기기',
    atlas: 2,
    cue: '몸통을 고정하고 팔꿈치를 뒤로 보내세요.',
    setup: '가슴 패드와 의자를 조절하고 손목을 곧게 유지하세요.',
  },
  legPress: {
    name: '레그 프레스',
    equipment: '머신',
    region: '하체',
    area: '허벅지 앞 · 엉덩이',
    secondary: '허벅지 뒤',
    pattern: '하체 밀기',
    atlas: 3,
    cue: '등과 엉덩이를 붙이고 무릎을 발끝 방향으로 움직이세요.',
    setup: '발을 어깨너비로 놓고 안전장치 위치를 먼저 확인하세요.',
  },
  legCurl: {
    name: '시티드 레그 컬',
    equipment: '머신',
    region: '하체',
    area: '허벅지 뒤',
    secondary: '종아리',
    pattern: '무릎 굽히기',
    atlas: 4,
    cue: '허리를 등받이에 붙이고 무릎을 천천히 구부려주세요.',
    setup: '회전축과 무릎을 맞추고 아래 패드가 발목 뒤에 오도록 조절하세요.',
  },
  legExtension: {
    name: '레그 익스텐션',
    equipment: '머신',
    region: '하체',
    area: '허벅지 앞',
    secondary: '대퇴사두근',
    pattern: '무릎 펴기',
    atlas: 5,
    cue: '천천히 무릎을 펴고 끝에서 과하게 잠그지 마세요.',
    setup: '회전축을 무릎에 맞추고 패드를 발목 바로 위 앞쪽에 두세요.',
  },
  shoulderPress: {
    name: '덤벨 숄더 프레스',
    equipment: '덤벨',
    region: '상체',
    area: '어깨',
    secondary: '삼두',
    pattern: '수직 밀기',
    atlas: 6,
    cue: '허리를 젖히지 않고 손목과 팔꿈치를 정렬해 밀어주세요.',
    setup: '가벼운 덤벨을 고르고 발과 등을 안정적으로 지지하세요.',
  },
  reverseGrip: {
    name: '덤벨 리버스 그립 로우',
    equipment: '덤벨',
    region: '상체',
    area: '등',
    secondary: '이두',
    pattern: '수평 당기기',
    atlas: 7,
    cue: '허리의 중립을 유지하고 반동 없이 팔꿈치를 뒤로 당겨주세요.',
    setup: '역그립으로 덤벨을 잡고 무릎을 조금 굽혀 엉덩이를 뒤로 보내세요.',
  },
  pecDeck: {
    name: '펙 덱',
    equipment: '머신',
    region: '상체',
    area: '가슴',
    secondary: '앞쪽 어깨',
    pattern: '가슴 모으기',
    atlas: 8,
    cue: '어깨를 과하게 벌리지 않고 가슴 앞에서 천천히 모아주세요.',
    setup: '좌석 높이와 시작 각도를 직원에게 확인하세요.',
  },
  squat: {
    name: '바벨 스쿼트',
    equipment: '바벨',
    region: '하체',
    area: '허벅지 앞 · 엉덩이',
    secondary: '코어 · 허벅지 뒤',
    pattern: '하체 밀기',
    atlas: 9,
    cue: '발바닥을 안정적으로 지지하고 무릎을 발끝 방향으로 움직이세요.',
    setup: '랙의 안전바 높이를 확인하고, 가벼운 바를 등 위쪽에 안정적으로 올리세요.',
  },
  benchPress: {
    name: '바벨 벤치 프레스',
    equipment: '바벨',
    region: '상체',
    area: '가슴',
    secondary: '삼두 · 앞쪽 어깨',
    pattern: '수평 밀기',
    atlas: 10,
    cue: '발과 등을 안정적으로 지지하고 바를 가슴 쪽으로 천천히 내리세요.',
    setup: '평평한 벤치와 안전장치를 확인하고, 처음에는 직원에게 보조를 요청하세요.',
  },
  deadlift: {
    name: '바벨 데드리프트',
    equipment: '바벨',
    region: '전신',
    area: '엉덩이 · 허벅지 뒤',
    secondary: '척추기립근 · 등 · 코어',
    pattern: '힙 힌지',
    atlas: 11,
    cue: '바를 몸 가까이 두고, 허리의 중립을 유지하며 바닥을 밀어 일어나세요.',
    setup:
      '바를 발 중앙 위에 두고 엉덩이를 뒤로 보내 잡으세요. 처음에는 힙 힌지 자세를 확인받으세요.',
  },
  barbellRow: {
    name: '바벨 로우',
    equipment: '바벨',
    region: '상체',
    area: '등',
    secondary: '승모근 · 뒤쪽 어깨 · 이두 · 코어',
    pattern: '수평 당기기',
    atlas: 12,
    cue: '숙인 몸통을 고정하고 팔꿈치를 뒤로 보내 바를 몸 쪽으로 당기세요.',
    setup: '무릎을 조금 굽히고 엉덩이를 뒤로 보내 상체를 숙이세요. 가벼운 바부터 시작하세요.',
  },
  overheadPress: {
    name: '바벨 오버헤드 프레스',
    equipment: '바벨',
    region: '상체',
    area: '어깨',
    secondary: '삼두 · 코어',
    pattern: '수직 밀기',
    atlas: 13,
    cue: '몸통을 안정적으로 유지하고 허리를 과하게 젖히지 않으며 바를 위로 밀어주세요.',
    setup: '발을 안정적으로 놓고 바를 어깨 앞쪽에 준비하세요. 머리 위 공간을 확인하세요.',
  },
  dumbbellBenchPress: {
    name: '덤벨 벤치 프레스',
    equipment: '덤벨',
    region: '상체',
    area: '가슴',
    secondary: '삼두 · 앞쪽 어깨',
    pattern: '수평 밀기',
    atlas: 14,
    cue: '양쪽 덤벨을 균형 있게 움직이고 어깨가 과하게 뒤로 꺾이지 않게 하세요.',
    setup:
      '평평한 벤치에 등을 지지하고 발을 바닥에 붙이세요. 내려놓기 쉬운 가벼운 무게를 고르세요.',
  },
  dumbbellRow: {
    name: '덤벨 원암 로우',
    equipment: '덤벨',
    region: '상체',
    area: '등',
    secondary: '이두 · 뒤쪽 어깨 · 코어',
    pattern: '수평 당기기',
    atlas: 15,
    cue: '몸통을 비틀지 않고 팔꿈치를 엉덩이 쪽으로 당기세요. 양쪽을 균형 있게 진행하세요.',
    setup:
      '한 손과 무릎을 벤치에 지지하고 반대 발은 바닥에 놓으세요. 한 세트 안에서 좌우를 번갈아 진행해요.',
  },
  lateralRaise: {
    name: '덤벨 사이드 레터럴 레이즈',
    equipment: '덤벨',
    region: '상체',
    area: '옆쪽 어깨',
    secondary: '어깨 안정근',
    pattern: '어깨 벌리기',
    atlas: 16,
    cue: '팔꿈치를 살짝 굽히고 어깨를 으쓱하지 않으며 덤벨을 옆으로 들어주세요.',
    setup: '가벼운 덤벨을 몸 옆에 들고 서세요. 반동 없이 제어할 수 있는 높이까지만 들어요.',
  },
  dumbbellCurl: {
    name: '덤벨 컬',
    equipment: '덤벨',
    region: '상체',
    area: '이두',
    secondary: '상완근 · 전완',
    pattern: '팔꿈치 굽히기',
    atlas: 17,
    cue: '팔꿈치를 몸 옆에 두고 몸통 반동 없이 덤벨을 천천히 올려주세요.',
    setup: '양손에 가벼운 덤벨을 들고 손바닥을 앞쪽으로 향하게 하세요.',
  },
  tricepsPushdown: {
    name: '케이블 삼두 푸시다운',
    equipment: '머신',
    region: '상체',
    area: '삼두',
    secondary: '코어',
    pattern: '팔꿈치 펴기',
    atlas: 18,
    cue: '팔꿈치를 몸 옆에 고정하고 팔꿈치를 펴며 로프를 아래로 밀어주세요.',
    setup: '도르래를 위쪽에 두고 로프를 연결하세요. 가벼운 무게로 시작하고 몸통 반동을 피하세요.',
  },
  facePull: {
    name: '케이블 페이스 풀',
    equipment: '머신',
    region: '상체',
    area: '뒤쪽 어깨 · 등 위쪽',
    secondary: '어깨 회전근',
    pattern: '후면 어깨 당기기',
    atlas: 19,
    cue: '로프를 얼굴 쪽으로 당기며 손을 벌려주세요. 허리를 젖히거나 어깨를 으쓱하지 마세요.',
    setup:
      '도르래를 얼굴 높이에 맞추고 로프를 연결하세요. 처음에는 직원에게 높이와 당기는 방향을 확인받으세요.',
  },
  romanianDeadlift: {
    name: '덤벨 루마니안 데드리프트',
    equipment: '덤벨',
    region: '하체',
    area: '엉덩이 · 허벅지 뒤',
    secondary: '척추기립근 · 코어',
    pattern: '힙 힌지',
    atlas: 20,
    cue: '무릎을 살짝 굽힌 채 엉덩이를 뒤로 보내세요. 허리의 중립을 유지할 수 있는 범위까지만 내려가요.',
    setup:
      '가벼운 덤벨을 허벅지 앞에 들고 서세요. 바닥에 닿는 것이 목표가 아니며, 처음에는 힙 힌지 자세를 확인받으세요.',
  },
  crunch: {
    name: '크런치',
    equipment: '맨몸',
    region: '코어',
    area: '복근',
    secondary: '복부 안정근',
    pattern: '몸통 굽히기',
    atlas: 21,
    cue: '목을 당기지 않고 갈비뼈를 골반 쪽으로 가까이 하며 어깨를 조금 들어주세요.',
    setup: '매트에 누워 무릎을 굽히고 발을 바닥에 둡니다. 팔은 가슴 앞에 교차하고 천천히 움직여요.',
  },
} as const;
export type MachineId = keyof typeof machines;
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Split =
  'full' | 'upperLower' | 'ppl' | 'fixed' | 'mixedFull' | 'torsoLimbs' | 'bodyPart';
export type Routine =
  | 'fullA'
  | 'fullB'
  | 'upper'
  | 'lower'
  | 'push'
  | 'pull'
  | 'legs'
  | 'mixedA'
  | 'mixedB'
  | 'torso'
  | 'limbs'
  | 'chestBack'
  | 'shoulderArms';
/**
 * `rest` and `work` are always the effective seconds for this item.
 * `finisher` marks an explicit end-of-session addition: only finishers may repeat a movement.
 * `restOverride` opts the item out of global rest propagation.
 */
export type PlanItem = {
  machine: MachineId;
  sets: number;
  rest: number;
  work: number;
  finisher?: boolean;
  restOverride?: boolean;
};
export type Preferences = {
  level: Level;
  split: Split;
  starters: MachineId[];
  /** Legacy version-2 fixed plan. Kept as the fallback base; never silently discarded. */
  savedPlan: PlanItem[] | null;
  /** Default rest for every set that has no explicit per-exercise override. */
  globalRest: number;
  /** Persistent goal templates per routine. Today's copy is derived, never stored here. */
  templates: Partial<Record<Routine, PlanItem[]>>;
};
export const defaultPreferences: Preferences = {
  level: 'beginner',
  split: 'full',
  starters: [],
  savedPlan: null,
  globalRest: DEFAULT_REST,
  templates: {},
};
export type Phase = {
  id: string;
  kind: 'prepare' | 'move' | 'work' | 'rest';
  seconds: number;
  machine: MachineId;
  set?: number;
  sets?: number;
};
export type Session = {
  /** Missing means a legacy 40-minute session; null means complete the whole routine. */
  timeLimit?: number | null;
  id: string;
  routine: Routine;
  startedAt: number;
  anchor: number;
  elapsed: number;
  paused: boolean;
  phases: Phase[];
  confirmed: string[];
  revision: number;
  commands: string[];
  /**
   * Wall-clock ms when a client last reported driving this session. Backgrounding keeps the JS
   * context and the in-memory session alive, so this only matters across a cold start. A future
   * Watch client updates it the same way, which is what keeps a phone-terminated but watch-driven
   * session from being treated as abandoned.
   */
  lastSeen?: number;
};
export type RecordEntry = {
  id: string;
  routine: Routine;
  endedAt: number;
  elapsed: number;
  confirmedSets: number;
  completed: boolean;
  reason: 'routine' | 'budget' | 'stopped';
  performed: MachineId[];
};
export type Data = {
  version: 4;
  history: RecordEntry[];
  session: Session | null;
  sound: boolean;
  preferences: Preferences;
};
export const emptyData: Data = {
  version: 4,
  history: [],
  session: null,
  sound: true,
  preferences: defaultPreferences,
};
const plans: Record<Routine, MachineId[]> = {
  fullA: ['legPress', 'chestPress', 'latPulldown', 'legCurl', 'row'],
  fullB: ['legCurl', 'row', 'chestPress', 'legExtension', 'latPulldown'],
  upper: ['chestPress', 'row', 'latPulldown', 'pecDeck'],
  lower: ['legPress', 'legCurl', 'legExtension'],
  push: ['chestPress', 'shoulderPress', 'pecDeck', 'lateralRaise', 'tricepsPushdown'],
  pull: ['latPulldown', 'row', 'facePull', 'dumbbellCurl'],
  legs: ['legPress', 'romanianDeadlift', 'legCurl', 'legExtension', 'crunch'],
  mixedA: ['squat', 'dumbbellBenchPress', 'latPulldown', 'legCurl', 'facePull'],
  mixedB: ['romanianDeadlift', 'legPress', 'shoulderPress', 'row', 'crunch'],
  torso: ['chestPress', 'latPulldown', 'row', 'shoulderPress', 'facePull'],
  limbs: ['legPress', 'romanianDeadlift', 'legCurl', 'tricepsPushdown', 'dumbbellCurl'],
  chestBack: ['benchPress', 'latPulldown', 'dumbbellRow', 'pecDeck', 'facePull'],
  shoulderArms: ['shoulderPress', 'lateralRaise', 'facePull', 'tricepsPushdown', 'dumbbellCurl'],
};
export const routineNames: Record<Routine, string> = {
  fullA: '전신 A',
  fullB: '전신 B',
  upper: '상체',
  lower: '하체',
  push: '밀기',
  pull: '당기기',
  legs: '하체',
  mixedA: '혼합 전신 A',
  mixedB: '혼합 전신 B',
  torso: '몸통',
  limbs: '하체·팔',
  chestBack: '가슴·등',
  shoulderArms: '어깨·팔',
};
export function routineCycle(split: Split): Routine[] {
  if (split === 'mixedFull') return ['mixedA', 'mixedB'];
  if (split === 'torsoLimbs') return ['torso', 'limbs'];
  if (split === 'bodyPart') return ['chestBack', 'shoulderArms', 'legs'];
  return split === 'upperLower'
    ? ['upper', 'lower']
    : split === 'ppl'
      ? ['push', 'pull', 'legs']
      : split === 'fixed'
        ? ['fullA']
        : ['fullA', 'fullB'];
}
export function nextRoutine(history: RecordEntry[], split: Split = 'full'): Routine {
  const cycle = routineCycle(split);
  const last = [...history]
    .reverse()
    .find((r) => r.completed && r.confirmedSets > 0 && cycle.includes(r.routine));
  return last ? cycle[(cycle.indexOf(last.routine) + 1) % cycle.length] : cycle[0];
}
export function routineOrder(routine: Routine) {
  return [...plans[routine]];
}
export function defaultPlan(routine: Routine): PlanItem[] {
  return plans[routine].map((machine) => ({
    machine,
    sets: 3,
    work: DEFAULT_WORK,
    rest: DEFAULT_REST,
  }));
}
/** User's 25-minute work-window target, not a minimum physiological training dose. */
export function recommendedPlan(routine: Routine): PlanItem[] {
  const order: MachineId[] =
    routine === 'upper'
      ? ['chestPress', 'latPulldown', 'row', 'shoulderPress', 'facePull']
      : routine === 'lower'
        ? ['legPress', 'romanianDeadlift', 'legCurl', 'legExtension', 'crunch']
        : routine === 'pull'
          ? ['latPulldown', 'row', 'facePull', 'dumbbellCurl', 'crunch']
          : plans[routine];
  return order.map((machine) => ({ machine, sets: 5, work: DEFAULT_WORK, rest: DEFAULT_REST }));
}
/** The persistent goal template: stored template, else the legacy fixed plan, else the default. */
export function resolveTemplate(routine: Routine, preferences: Preferences): PlanItem[] {
  const stored = preferences.templates?.[routine];
  if (stored?.length) return stored.map((x) => ({ ...x }));
  // A version-2 fixed plan already carries rest values the user chose explicitly; global rest
  // never overwrites them. Only a generated default inherits the global value.
  const legacy = preferences.savedPlan;
  if (legacy?.length) return legacy.map((x) => ({ ...x }));
  return applyGlobalRest(recommendedPlan(routine), preferences.globalRest ?? DEFAULT_REST);
}
/** One resolver for today's plan and future previews; legacy saved plans retain their behavior. */
export function resolvePlan(routine: Routine, preferences: Preferences): PlanItem[] {
  const plan = resolveTemplate(routine, preferences);
  if (!preferences.starters.length || ['lower', 'legs'].includes(routine)) return plan;
  try {
    return withStarters(plan, preferences.starters).items;
  } catch {
    return plan;
  }
}
/** Global rest reaches every set that has not been explicitly overridden. */
export function applyGlobalRest(items: PlanItem[], rest: number): PlanItem[] {
  return items.map((x) => (x.restOverride ? { ...x } : { ...x, rest }));
}
/**
 * Marks any item whose rest already differs from the global value as an explicit override, so an
 * editor labels it honestly and a later global-rest change cannot silently discard it. Used when
 * loading a legacy or hand-edited plan into an editor, never on a plan that is about to run.
 */
export function markRestOverrides(items: PlanItem[], rest: number): PlanItem[] {
  return items.map((x) =>
    x.restOverride || x.rest === rest ? { ...x } : { ...x, restOverride: true },
  );
}
/** Exercise time, rest and equipment transitions are reported separately, never merged. */
export function planBreakdown(items: PlanItem[]) {
  const work = items.reduce((n, x) => n + x.sets * x.work, 0);
  const rest = items.reduce((n, x) => n + (x.sets - 1) * x.rest, 0);
  const move = Math.max(0, items.length - 1) * MOVE_SECONDS;
  return { setup: PREPARE_SECONDS, work, rest, move, total: PREPARE_SECONDS + work + rest + move };
}
export function planSeconds(items: PlanItem[]) {
  return planBreakdown(items).total;
}
function checkItems(items: PlanItem[]): void {
  const shapeError = Error(
    '종목은 1–12개, 세트 1–5개, 운동 20–180초, 휴식 30–180초로 설정하세요. 같은 운동은 마무리 종목으로만 반복할 수 있어요.',
  );
  if (
    !Array.isArray(items) ||
    items.length < 1 ||
    items.length > MAX_ITEMS ||
    items.some(
      (x) =>
        !x ||
        !Object.hasOwn(machines, x.machine) ||
        !Number.isInteger(x.sets) ||
        x.sets < 1 ||
        x.sets > 5 ||
        !Number.isInteger(x.work) ||
        x.work < 20 ||
        x.work > 180 ||
        !Number.isInteger(x.rest) ||
        x.rest < 30 ||
        x.rest > 180 ||
        (x.finisher !== undefined && typeof x.finisher !== 'boolean') ||
        (x.restOverride !== undefined && typeof x.restOverride !== 'boolean'),
    )
  )
    throw shapeError;
  const seen = new Set<MachineId>();
  for (const x of items) {
    if (seen.has(x.machine) && !x.finisher) throw shapeError;
    seen.add(x.machine);
  }
}
/** Templates and new sessions share shape validation, without a total-duration cap. */
export function validateTemplate(items: PlanItem[]): void {
  checkItems(items);
}
export function validatePlan(items: PlanItem[]): void {
  checkItems(items);
}
/** A visible substitution proposal; never silently cuts rest to squeeze in preferences. */
export function withStarters(
  items: PlanItem[],
  starters: MachineId[],
): { items: PlanItem[]; replaced: MachineId[] } {
  const result = items.map((x) => ({ ...x }));
  const replaced: MachineId[] = [];
  const open = (x: PlanItem) => !starters.includes(x.machine) && !x.finisher;
  for (const machine of [...new Set(starters)]) {
    if (result.some((x) => x.machine === machine)) continue;
    let index = result.findIndex(
      (x) => open(x) && machines[x.machine].pattern === machines[machine].pattern,
    );
    if (index < 0)
      index = result.findIndex(
        (x) => open(x) && machines[x.machine].area === machines[machine].area,
      );
    if (index < 0) index = result.findLastIndex(open);
    if (index < 0) throw Error('시작 운동 수를 줄여주세요.');
    replaced.push(result[index].machine);
    result[index] = { ...result[index], machine };
  }
  // Finishers stay pinned at the end; a starter preference never pulls one forward.
  const rank = (x: PlanItem) => {
    if (x.finisher) return 1000;
    const at = starters.indexOf(x.machine);
    return at < 0 ? 99 : at;
  };
  result.sort((a, b) => rank(a) - rank(b));
  validateTemplate(result);
  return { items: result, replaced };
}
export function buildPhases(items: PlanItem[]): Phase[] {
  validatePlan(items);
  const phases: Phase[] = [
    { id: 'prepare', kind: 'prepare', seconds: 10, machine: items[0].machine },
  ];
  // The plan index prefixes every id so a repeated finisher keeps distinct phases and records.
  items.forEach((x, i) => {
    if (i > 0)
      phases.push({
        id: `${i}:${x.machine}:move`,
        kind: 'move',
        seconds: MOVE_SECONDS,
        machine: x.machine,
      });
    for (let set = 1; set <= x.sets; set++) {
      phases.push({
        id: `${i}:${x.machine}:work:${set}`,
        kind: 'work',
        seconds: x.work,
        machine: x.machine,
        set,
        sets: x.sets,
      });
      if (set < x.sets)
        phases.push({
          id: `${i}:${x.machine}:rest:${set}`,
          kind: 'rest',
          seconds: x.rest,
          machine: x.machine,
          set,
          sets: x.sets,
        });
    }
  });
  return phases;
}
export function begin(routine: Routine, items: PlanItem[], now: number, id = String(now)): Session {
  return {
    timeLimit: null,
    id,
    routine,
    startedAt: now,
    anchor: now,
    elapsed: 0,
    paused: false,
    phases: buildPhases(items),
    confirmed: [],
    revision: 0,
    commands: [],
    lastSeen: now,
  };
}
export function sessionLimit(s: Session) {
  return s.timeLimit === null ? Infinity : (s.timeLimit ?? TOTAL_SECONDS);
}
/** Silence longer than this is not credited as workout time unless the user says it was real. */
export const ABANDON_SECONDS = 180;
/** The later of the explicit heartbeat and the last accepted command. */
export function lastSeenAt(s: Session) {
  return Math.max(s.lastSeen ?? 0, s.anchor);
}
export function touch(s: Session, now: number): Session {
  return { ...s, lastSeen: Math.max(lastSeenAt(s), now) };
}
/**
 * Cold-start reconciliation. Turning the screen off or backgrounding the app leaves the process
 * alive, so the clock keeps running and this never runs. Relaunching after the process died does
 * run it: no client was driving that gap, so it is frozen out rather than counted, and the caller
 * must ask the user what actually happened. Neither answer records a set as performed.
 */
export function reconcileOnLaunch(
  s: Session,
  now: number,
  gapSeconds = ABANDON_SECONDS,
): { session: Session; excluded: number } {
  const seen = lastSeenAt(s);
  const gap = Math.max(0, now - seen) / 1000;
  if (s.paused || gap <= gapSeconds) return { session: s, excluded: 0 };
  const elapsed = Math.min(sessionLimit(s), s.elapsed + Math.max(0, seen - s.anchor) / 1000);
  return {
    session: { ...s, elapsed, anchor: now, lastSeen: now, paused: true, revision: s.revision + 1 },
    excluded: gap,
  };
}
/**
 * The user's answer to the launch gap question. `creditSeconds` is the excluded gap when they
 * confirm the session really was running, for example on a watch, and zero when it was not.
 * Either way this re-anchors like an explicit resume and bumps the revision.
 */
export function resumeAfterGap(s: Session, now: number, creditSeconds: number): Session {
  const elapsed = Math.min(sessionLimit(s), s.elapsed + Math.max(0, creditSeconds));
  return { ...s, elapsed, paused: false, anchor: now, lastSeen: now, revision: s.revision + 1 };
}
export function elapsedAt(s: Session, now: number) {
  return Math.min(sessionLimit(s), s.elapsed + (s.paused ? 0 : Math.max(0, now - s.anchor) / 1000));
}
export function position(s: Session, now: number) {
  const elapsed = elapsedAt(s, now);
  let start = 0;
  if (elapsed >= sessionLimit(s))
    return { phase: null, index: s.phases.length, remaining: 0, elapsed, start: elapsed };
  for (let index = 0; index < s.phases.length; index++) {
    const phase = s.phases[index];
    if (elapsed < start + phase.seconds)
      return {
        phase,
        index,
        remaining: Math.min(start + phase.seconds - elapsed, sessionLimit(s) - elapsed),
        elapsed,
        start,
      };
    start += phase.seconds;
  }
  return { phase: null, index: s.phases.length, remaining: 0, elapsed, start };
}
export type Command = {
  id: string;
  sessionId: string;
  phaseId: string;
  revision: number;
  source: 'app' | 'watch' | 'headphones' | 'harness';
  type: 'next' | 'extend' | 'pause' | 'resume';
  at: number;
};
export function applyCommand(s: Session, c: Command): Session {
  const p = position(s, c.at);
  // Session + phase + revision guard delayed taps, reconnect delivery, and double taps.
  if (
    !p.phase ||
    c.sessionId !== s.id ||
    c.phaseId !== p.phase.id ||
    c.revision !== s.revision ||
    s.commands.includes(c.id) ||
    !Number.isFinite(c.at)
  )
    return s;
  if (
    (c.type === 'pause' && s.paused) ||
    (c.type === 'resume' && !s.paused) ||
    (s.paused && c.type !== 'resume')
  )
    return s;
  if (c.type === 'next' && p.phase.kind === 'prepare') return s;
  const next: Session = {
    ...s,
    elapsed: p.elapsed,
    anchor: c.at,
    revision: s.revision + 1,
    commands: [...s.commands.slice(-63), c.id],
    phases: s.phases.map((x) => ({ ...x })),
    confirmed: [...s.confirmed],
  };
  if (c.type === 'pause' || c.type === 'resume') next.paused = c.type === 'pause';
  if (c.type === 'next') {
    next.phases[p.index].seconds = Math.max(0, p.elapsed - p.start);
    if (p.phase.kind === 'work') next.confirmed.push(p.phase.id);
  }
  if (c.type === 'extend')
    next.phases[p.index].seconds += Math.min(
      30,
      Math.max(0, sessionLimit(s) - p.elapsed - p.remaining),
    );
  return next;
}
export function swapUpcoming(
  s: Session,
  first: MachineId,
  second: MachineId,
  now: number,
): Session {
  const p = position(s, now);
  if (first === second) return s;
  // Each block is one plan item: a leading move phase plus its work/rest phases.
  const blocks: { start: number; phases: Phase[] }[] = [];
  s.phases.forEach((phase, index) => {
    if (phase.kind === 'prepare') return;
    if (phase.kind === 'move' || !blocks.length) blocks.push({ start: index, phases: [phase] });
    else blocks[blocks.length - 1].phases.push(phase);
  });
  // Block 0 has no move phase, so it is never reordered into the middle of the session.
  const find = (machine: MachineId) =>
    blocks.findIndex(
      (block, index) => index > 0 && block.start > p.index && block.phases[0].machine === machine,
    );
  const a = find(first),
    b = find(second);
  if (a < 0 || b < 0) return s;
  const order = blocks.map((block) => block.phases);
  [order[a], order[b]] = [order[b], order[a]];
  return { ...s, revision: s.revision + 1, phases: [s.phases[0], ...order.flat()] };
}
export function finish(data: Data, now: number, reason: RecordEntry['reason']): Data {
  const s = data.session;
  if (!s) return data;
  const elapsed = Math.min(
    elapsedAt(s, now),
    s.phases.reduce((n, p) => n + p.seconds, 0),
  );
  const actualReason =
    reason === 'stopped' ? 'stopped' : elapsedAt(s, now) >= sessionLimit(s) ? 'budget' : 'routine';
  const performed = [
    ...new Set(s.phases.filter((p) => s.confirmed.includes(p.id)).map((p) => p.machine)),
  ];
  return {
    ...data,
    session: null,
    history: [
      ...data.history.filter((r) => r.id !== s.id),
      {
        id: s.id,
        routine: s.routine,
        endedAt: now,
        elapsed,
        confirmedSets: s.confirmed.length,
        completed: actualReason === 'routine',
        reason: actualReason,
        performed,
      },
    ],
  };
}
/**
 * Deleting records is local and irreversible; the caller must confirm first. An active session is
 * never touched, and the next routine is recomputed from whatever records remain, so removing the
 * latest record can move the cycle back a step. Nothing is rewritten to make the order look tidy.
 */
export function removeRecords(data: Data, ids: string[]): Data {
  const drop = new Set(ids);
  return { ...data, history: data.history.filter((r) => !drop.has(r.id)) };
}
export function clearHistory(data: Data): Data {
  return { ...data, history: [] };
}
export function phaseTitle(p: Phase | null) {
  return !p
    ? '오늘 운동 완료'
    : p.kind === 'prepare'
      ? '10초 후 시작합니다'
      : p.kind === 'rest'
        ? '잠깐, 쉬어가요'
        : p.kind === 'move'
          ? `${machines[p.machine].name} 준비`
          : machines[p.machine].name;
}
export function announcement(p: Phase | null) {
  if (!p) return '오늘 운동을 마쳤습니다. 수고하셨습니다.';
  if (p.kind === 'prepare') return '운동을 시작하겠습니다. 10초 후 첫 번째 세트를 시작합니다.';
  if (p.kind === 'move') return `사용한 기구를 정리하고 ${machines[p.machine].name}를 준비하세요.`;
  if (p.kind === 'rest')
    return `세트가 끝났습니다. ${Math.ceil(p.seconds)}초 동안 쉬세요. 준비되면 다음 세트를 눌러주세요.`;
  return `${machines[p.machine].name}, ${['', '첫', '두', '세', '네', '다섯'][p.set!]} 번째 세트를 시작하겠습니다.`;
}
export function countdownCue(s: Session, now: number) {
  const p = position(s, now);
  const seconds = Math.ceil(p.remaining);
  return !s.paused && p.phase?.kind === 'work' && seconds <= 5 && seconds > 0
    ? { key: `${s.id}:${p.phase.id}:${s.revision}:${seconds}`, seconds }
    : null;
}
export function formatTime(seconds: number) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)
    .toString()
    .padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}
