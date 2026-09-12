/** Platform-independent clock and command engine. All times are active seconds. */
export const TOTAL_SECONDS = 2400;
export const PREPARE_SECONDS = 10;
export const machines = {
  chestPress: {
    name: '체스트 프레스',
    area: '가슴',
    secondary: '삼두 · 앞쪽 어깨',
    pattern: '수평 밀기',
    atlas: 0,
    cue: '등을 붙이고 손목을 곧게 유지하며 앞으로 밀어주세요.',
    setup: '손잡이가 가슴 중앙에 오도록 의자 높이를 맞추세요.',
  },
  latPulldown: {
    name: '랫 풀다운',
    area: '등',
    secondary: '이두',
    pattern: '수직 당기기',
    atlas: 1,
    cue: '어깨를 내리고 팔꿈치를 아래로 당겨주세요.',
    setup: '허벅지 패드를 고정하고 발바닥을 바닥에 붙이세요.',
  },
  row: {
    name: '시티드 로우',
    area: '등',
    secondary: '이두 · 뒤쪽 어깨',
    pattern: '수평 당기기',
    atlas: 2,
    cue: '몸통을 고정하고 팔꿈치를 뒤로 보내세요.',
    setup: '가슴 패드와 의자를 조절하고 손목을 곧게 유지하세요.',
  },
  legPress: {
    name: '레그 프레스',
    area: '허벅지 앞 · 엉덩이',
    secondary: '허벅지 뒤',
    pattern: '하체 밀기',
    atlas: 3,
    cue: '등과 엉덩이를 붙이고 무릎을 발끝 방향으로 움직이세요.',
    setup: '발을 어깨너비로 놓고 안전장치 위치를 먼저 확인하세요.',
  },
  legCurl: {
    name: '시티드 레그 컬',
    area: '허벅지 뒤',
    secondary: '종아리',
    pattern: '무릎 굽히기',
    atlas: 4,
    cue: '허리를 등받이에 붙이고 무릎을 천천히 구부려주세요.',
    setup: '회전축과 무릎을 맞추고 아래 패드가 발목 뒤에 오도록 조절하세요.',
  },
  legExtension: {
    name: '레그 익스텐션',
    area: '허벅지 앞',
    secondary: '대퇴사두근',
    pattern: '무릎 펴기',
    atlas: 5,
    cue: '천천히 무릎을 펴고 끝에서 과하게 잠그지 마세요.',
    setup: '회전축을 무릎에 맞추고 패드를 발목 바로 위 앞쪽에 두세요.',
  },
  shoulderPress: {
    name: '덤벨 숄더 프레스',
    area: '어깨',
    secondary: '삼두',
    pattern: '수직 밀기',
    atlas: 6,
    cue: '허리를 젖히지 않고 손목과 팔꿈치를 정렬해 밀어주세요.',
    setup: '가벼운 덤벨을 고르고 발과 등을 안정적으로 지지하세요.',
  },
  reverseGrip: {
    name: '덤벨 리버스 그립 로우',
    area: '등',
    secondary: '이두',
    pattern: '수평 당기기',
    atlas: 7,
    cue: '허리의 중립을 유지하고 반동 없이 팔꿈치를 뒤로 당겨주세요.',
    setup: '역그립으로 덤벨을 잡고 무릎을 조금 굽혀 엉덩이를 뒤로 보내세요.',
  },
  pecDeck: {
    name: '펙 덱',
    area: '가슴',
    secondary: '앞쪽 어깨',
    pattern: '가슴 모으기',
    atlas: 8,
    cue: '어깨를 과하게 벌리지 않고 가슴 앞에서 천천히 모아주세요.',
    setup: '좌석 높이와 시작 각도를 직원에게 확인하세요.',
  },
} as const;
export type MachineId = keyof typeof machines;
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Split = 'full' | 'upperLower' | 'ppl' | 'fixed';
export type Routine = 'fullA' | 'fullB' | 'upper' | 'lower' | 'push' | 'pull' | 'legs';
export type PlanItem = { machine: MachineId; sets: number; rest: number; work: number };
export type Preferences = {
  level: Level;
  split: Split;
  starters: MachineId[];
  savedPlan: PlanItem[] | null;
};
export const defaultPreferences: Preferences = {
  level: 'beginner',
  split: 'full',
  starters: [],
  savedPlan: null,
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
  version: 2;
  history: RecordEntry[];
  session: Session | null;
  sound: boolean;
  preferences: Preferences;
};
export const emptyData: Data = {
  version: 2,
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
  push: ['chestPress', 'pecDeck', 'shoulderPress'],
  pull: ['latPulldown', 'row'],
  legs: ['legPress', 'legCurl', 'legExtension'],
};
export const routineNames: Record<Routine, string> = {
  fullA: '전신 A',
  fullB: '전신 B',
  upper: '상체',
  lower: '하체',
  push: '밀기',
  pull: '당기기',
  legs: '하체',
};
export function nextRoutine(history: RecordEntry[], split: Split = 'full'): Routine {
  const cycle: Routine[] =
    split === 'upperLower'
      ? ['upper', 'lower']
      : split === 'ppl'
        ? ['push', 'pull', 'legs']
        : split === 'fixed'
          ? ['fullA']
          : ['fullA', 'fullB'];
  const last = [...history]
    .reverse()
    .find((r) => r.completed && r.confirmedSets > 0 && cycle.includes(r.routine));
  return last ? cycle[(cycle.indexOf(last.routine) + 1) % cycle.length] : cycle[0];
}
export function routineOrder(routine: Routine) {
  return [...plans[routine]];
}
export function defaultPlan(routine: Routine): PlanItem[] {
  return plans[routine].map((machine) => ({ machine, sets: 3, work: 60, rest: 90 }));
}
export function planSeconds(items: PlanItem[]) {
  return (
    PREPARE_SECONDS +
    Math.max(0, items.length - 1) * 60 +
    items.reduce((s, x) => s + x.sets * x.work + (x.sets - 1) * x.rest, 0)
  );
}
export function validatePlan(items: PlanItem[]): void {
  if (
    !Array.isArray(items) ||
    items.length < 1 ||
    items.length > 8 ||
    new Set(items.map((x) => x.machine)).size !== items.length ||
    items.some(
      (x) =>
        !Object.hasOwn(machines, x.machine) ||
        !Number.isInteger(x.sets) ||
        x.sets < 1 ||
        x.sets > 5 ||
        !Number.isInteger(x.work) ||
        x.work < 20 ||
        x.work > 180 ||
        !Number.isInteger(x.rest) ||
        x.rest < 30 ||
        x.rest > 180,
    )
  )
    throw Error('종목은 중복 없이 1–8개, 세트 1–5개, 운동 20–180초, 휴식 30–180초로 설정하세요.');
  if (planSeconds(items) > TOTAL_SECONDS)
    throw Error('40분을 넘었어요. 운동이나 세트를 줄여주세요.');
}
/** A visible substitution proposal; never silently cuts rest to squeeze in preferences. */
export function withStarters(
  items: PlanItem[],
  starters: MachineId[],
): { items: PlanItem[]; replaced: MachineId[] } {
  let result = items.map((x) => ({ ...x }));
  const replaced: MachineId[] = [];
  for (const machine of [...new Set(starters)]) {
    if (result.some((x) => x.machine === machine)) continue;
    let index = result.findIndex(
      (x) =>
        !starters.includes(x.machine) && machines[x.machine].pattern === machines[machine].pattern,
    );
    if (index < 0)
      index = result.findIndex(
        (x) => !starters.includes(x.machine) && machines[x.machine].area === machines[machine].area,
      );
    if (index < 0) index = result.findLastIndex((x) => !starters.includes(x.machine));
    if (index < 0) throw Error('시작 운동 수를 줄여주세요.');
    replaced.push(result[index].machine);
    result[index] = { ...result[index], machine };
  }
  result.sort((a, b) => {
    const ai = starters.indexOf(a.machine),
      bi = starters.indexOf(b.machine);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  });
  validatePlan(result);
  return { items: result, replaced };
}
export function buildPhases(items: PlanItem[]): Phase[] {
  validatePlan(items);
  const phases: Phase[] = [
    { id: 'prepare', kind: 'prepare', seconds: 10, machine: items[0].machine },
  ];
  items.forEach((x, i) => {
    if (i > 0)
      phases.push({ id: `${x.machine}:move`, kind: 'move', seconds: 60, machine: x.machine });
    for (let set = 1; set <= x.sets; set++) {
      phases.push({
        id: `${x.machine}:work:${set}`,
        kind: 'work',
        seconds: x.work,
        machine: x.machine,
        set,
        sets: x.sets,
      });
      if (set < x.sets)
        phases.push({
          id: `${x.machine}:rest:${set}`,
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
  };
}
export function elapsedAt(s: Session, now: number) {
  return Math.min(TOTAL_SECONDS, s.elapsed + (s.paused ? 0 : Math.max(0, now - s.anchor) / 1000));
}
export function position(s: Session, now: number) {
  const elapsed = elapsedAt(s, now);
  let start = 0;
  if (elapsed >= TOTAL_SECONDS)
    return { phase: null, index: s.phases.length, remaining: 0, elapsed, start: elapsed };
  for (let index = 0; index < s.phases.length; index++) {
    const phase = s.phases[index];
    if (elapsed < start + phase.seconds)
      return {
        phase,
        index,
        remaining: Math.min(start + phase.seconds - elapsed, TOTAL_SECONDS - elapsed),
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
      Math.max(0, TOTAL_SECONDS - p.elapsed - p.remaining),
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
  const firstIndex = s.phases.findIndex((x) => x.machine === first),
    secondIndex = s.phases.findIndex((x) => x.machine === second);
  if (first === second || firstIndex <= p.index || secondIndex <= p.index) return s;
  const order = [...new Set(s.phases.filter((x) => x.kind !== 'prepare').map((x) => x.machine))];
  const a = order.indexOf(first),
    b = order.indexOf(second);
  [order[a], order[b]] = [order[b], order[a]];
  return {
    ...s,
    revision: s.revision + 1,
    phases: [
      s.phases[0],
      ...order.flatMap((id) => s.phases.filter((x) => x.kind !== 'prepare' && x.machine === id)),
    ],
  };
}
export function finish(data: Data, now: number, reason: RecordEntry['reason']): Data {
  const s = data.session;
  if (!s) return data;
  const elapsed = Math.min(
    elapsedAt(s, now),
    s.phases.reduce((n, p) => n + p.seconds, 0),
  );
  const actualReason =
    reason === 'stopped' ? 'stopped' : elapsedAt(s, now) >= TOTAL_SECONDS ? 'budget' : 'routine';
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
