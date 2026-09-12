import { MachineId, Routine, Split } from './workout';

export const routinePurpose: Record<Routine, string> = {
  fullA: '하체 + 상체 밀기·당기기',
  fullB: '하체 + 상체 당기기·밀기',
  upper: '상체 밀기·당기기',
  lower: '허벅지 앞·뒤',
  push: 'A일 · 가슴 / 어깨 / 삼두',
  pull: 'B일 · 등 / 후면 어깨 / 이두',
  legs: 'C일 · 하체 전·후면 / 복근',
  mixedA: '스쿼트 · 가슴 · 등',
  mixedB: '힙 힌지 · 하체 · 상체',
  torso: '가슴 · 등 · 어깨',
  limbs: '하체 · 이두 · 삼두',
  chestBack: '가슴 · 등 번갈아 훈련',
  shoulderArms: '어깨 · 팔',
};
export const alternatives: Partial<Record<MachineId, MachineId[]>> = {
  chestPress: ['benchPress', 'dumbbellBenchPress'],
  shoulderPress: ['overheadPress'],
  latPulldown: [],
  row: ['dumbbellRow', 'barbellRow', 'reverseGrip'],
  legPress: ['squat'],
  romanianDeadlift: [],
};
export function repetitionGuide(id: MachineId) {
  return [
    'pecDeck',
    'lateralRaise',
    'tricepsPushdown',
    'facePull',
    'dumbbellCurl',
    'legCurl',
    'legExtension',
    'crunch',
  ].includes(id)
    ? '12–15회'
    : '8–12회';
}
export type Attendance = 'three' | 'six' | 'rolling';
export function scheduleExample(
  split: Split,
  attendance: Attendance,
): { day: string; label: string }[] {
  const extra: Partial<Record<Split, string[]>> = {
    mixedFull: ['혼합 A', '휴식', '혼합 B', '휴식', '혼합 A', '휴식', '휴식'],
    torsoLimbs: ['몸통', '하체·팔', '휴식', '몸통', '하체·팔', '휴식', '휴식'],
    bodyPart: ['가슴·등', '휴식', '어깨·팔', '휴식', '하체', '휴식', '휴식'],
  };
  if (extra[split])
    return extra[split]!.map((label, i) => ({
      day: ['월', '화', '수', '목', '금', '토', '일'][i],
      label,
    }));
  if (split === 'ppl' && attendance === 'rolling')
    return ['밀기', '당기기', '하체', '휴식', '밀기', '당기기', '하체', '휴식'].map(
      (label, index) => ({ day: `${index + 1}일차`, label }),
    );
  const labels =
    split === 'ppl'
      ? attendance === 'six'
        ? ['밀기', '당기기', '하체', '밀기', '당기기', '하체', '휴식']
        : ['밀기', '휴식', '당기기', '휴식', '하체', '휴식', '휴식']
      : split === 'upperLower'
        ? ['상체', '하체', '휴식', '상체', '하체', '휴식', '휴식']
        : split === 'fixed'
          ? ['전신', '휴식', '전신', '휴식', '전신', '휴식', '휴식']
          : ['전신 A', '휴식', '전신 B', '휴식', '전신 A', '휴식', '휴식'];
  return labels.map((label, index) => ({
    day: ['월', '화', '수', '목', '금', '토', '일'][index],
    label,
  }));
}
