import { MachineId, Routine, Split } from './workout';

export const routinePurpose: Record<Routine, string> = {
  fullA: '하체 + 상체 밀기·당기기',
  fullB: '하체 + 상체 당기기·밀기',
  upper: '상체 밀기·당기기',
  lower: '허벅지 앞·뒤',
  push: 'A일 · 가슴 / 어깨 / 삼두',
  pull: 'B일 · 등 / 후면 어깨 / 이두',
  legs: 'C일 · 하체 전·후면 / 복근',
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
