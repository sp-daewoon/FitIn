import { t } from './i18n';
import { MachineId, Routine, Split } from './workout';

export const routinePurpose: Record<Routine, string> = {
  get fullA() {
    return t('하체 + 상체 밀기·당기기');
  },
  get fullB() {
    return t('하체 + 상체 당기기·밀기');
  },
  get upper() {
    return t('상체 밀기·당기기');
  },
  get lower() {
    return t('허벅지 앞·뒤');
  },
  get push() {
    return t('A일 · 가슴 / 어깨 / 삼두');
  },
  get pull() {
    return t('B일 · 등 / 후면 어깨 / 이두');
  },
  get legs() {
    return t('C일 · 하체 전·후면 / 복근');
  },
  get mixedA() {
    return t('스쿼트 · 가슴 · 등');
  },
  get mixedB() {
    return t('힙 힌지 · 하체 · 상체');
  },
  get torso() {
    return t('가슴 · 등 · 어깨');
  },
  get limbs() {
    return t('하체 · 이두 · 삼두');
  },
  get chestBack() {
    return t('가슴 · 등 번갈아 훈련');
  },
  get shoulderArms() {
    return t('어깨 · 팔');
  },
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
    ? t('12–15회')
    : t('8–12회');
}
export type Attendance = 'three' | 'six' | 'rolling';
export function scheduleExample(
  split: Split,
  attendance: Attendance,
): { day: string; label: string }[] {
  const extra: Partial<Record<Split, string[]>> = {
    mixedFull: [t('혼합 A'), t('휴식'), t('혼합 B'), t('휴식'), t('혼합 A'), t('휴식'), t('휴식')],
    torsoLimbs: [t('몸통'), t('하체·팔'), t('휴식'), t('몸통'), t('하체·팔'), t('휴식'), t('휴식')],
    bodyPart: [t('가슴·등'), t('휴식'), t('어깨·팔'), t('휴식'), t('하체'), t('휴식'), t('휴식')],
  };
  if (extra[split])
    return extra[split]!.map((label, i) => ({
      day: [t('월'), t('화'), t('수'), t('목'), t('금'), t('토'), t('일')][i],
      label,
    }));
  if (split === 'ppl' && attendance === 'rolling')
    return [
      t('밀기'),
      t('당기기'),
      t('하체'),
      t('휴식'),
      t('밀기'),
      t('당기기'),
      t('하체'),
      t('휴식'),
    ].map((label, index) => ({ day: t('{0}일차', index + 1), label }));
  const labels =
    split === 'ppl'
      ? attendance === 'six'
        ? [t('밀기'), t('당기기'), t('하체'), t('밀기'), t('당기기'), t('하체'), t('휴식')]
        : [t('밀기'), t('휴식'), t('당기기'), t('휴식'), t('하체'), t('휴식'), t('휴식')]
      : split === 'upperLower'
        ? [t('상체'), t('하체'), t('휴식'), t('상체'), t('하체'), t('휴식'), t('휴식')]
        : split === 'fixed'
          ? [t('전신'), t('휴식'), t('전신'), t('휴식'), t('전신'), t('휴식'), t('휴식')]
          : [t('전신 A'), t('휴식'), t('전신 B'), t('휴식'), t('전신 A'), t('휴식'), t('휴식')];
  return labels.map((label, index) => ({
    day: [t('월'), t('화'), t('수'), t('목'), t('금'), t('토'), t('일')][index],
    label,
  }));
}
