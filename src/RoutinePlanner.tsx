import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  recommendedPlan as defaultPlan,
  planBreakdown,
  sessionLimit,
  formatTime,
  MachineId,
  machines,
  PlanItem,
  planSeconds,
  Preferences,
  RecordEntry,
  resolvePlan,
  Routine,
  routineCycle,
  routineNames,
  Split,
  Session,
} from './workout';
import {
  alternatives,
  Attendance,
  repetitionGuide,
  routinePurpose,
  scheduleExample,
} from './programGuidance';
import { RoutineBuilder } from './RoutineBuilder';

const programs: { split: Split; name: string; forWho: string; why: string; rhythm: string }[] = [
  {
    split: 'full',
    name: '머신 전신 A / B',
    forWho: '처음 시작하거나 방문일이 불규칙할 때',
    why: '한 번의 방문에 하체와 상체 밀기·당기기를 함께 구성해요.',
    rhythm: '주 2~3회 예시 · 운동일 사이 쉬는 날 배치',
  },
  {
    split: 'upperLower',
    name: '상체 / 하체 나누기',
    forWho: '부위별로 집중하고 싶은 분',
    why: '상체 날에는 밀기·당기기, 하체 날에는 허벅지 앞·뒤를 나눠 살펴봐요.',
    rhythm: '주 4회 예시 · 상체 → 하체 → 휴식 → 상체 → 하체',
  },
  {
    split: 'ppl',
    name: '밀기 / 당기기 / 하체',
    forWho: '분할 운동에 익숙하고 꾸준히 방문하는 분',
    why: '함께 쓰이는 근육별로 묶어요. 주 3회만 하면 부위별 빈도가 낮아 전신 방식이 더 편할 수 있어요.',
    rhythm: '밀기 → 당기기 → 하체 · 회복에 맞춰 사이에 휴식',
  },
  {
    split: 'fixed',
    name: '익숙한 전신 반복',
    forWho: '동작을 바꾸기보다 같은 순서를 익히고 싶을 때',
    why: '전신 A를 반복하고 필요한 운동을 바꿔 저장할 수 있어요.',
    rhythm: '주 2~3회 예시 · 같은 부위의 연일 운동은 피하기',
  },
  {
    split: 'mixedFull',
    name: '머신 + 프리웨이트 전신',
    forWho: '스쿼트·덤벨 동작에 익숙할 때',
    why: '스쿼트 중심 날과 힙 힌지 중심 날을 나눠 상체 밀기·당기기를 함께 구성해요.',
    rhythm: '주 2~3회 · A/B 사이에 휴식',
  },
  {
    split: 'torsoLimbs',
    name: '몸통 / 하체·팔 2분할',
    forWho: '가슴·등을 함께, 팔은 별도 날에',
    why: '몸통 날은 가슴·등·어깨, 다음 날은 하체와 팔을 함께 구성해요. 어깨·팔의 간접 부하도 고려해 휴식일을 둡니다.',
    rhythm: '주 4회 예시 · 몸통 → 하체·팔 → 휴식',
  },
  {
    split: 'bodyPart',
    name: '가슴·등 / 어깨·팔 / 하체',
    forWho: '부위별 집중을 선호할 때',
    why: '가슴과 등을 번갈아 훈련하고 어깨·팔과 하체를 다른 방문으로 나눠요. 연속 상체 훈련 사이 회복을 고려하세요.',
    rhythm: '주 3회 예시 · 각 운동일 사이 휴식',
  },
];
const visitLabels = ['오늘', '다음 방문', '다다음 방문'];

export function RoutinePlanner({
  preferences,
  history,
  routine,
  today,
  session,
  onChoose,
  onGuide,
  onToday,
  onHistory,
  onSource,
  onSaveTemplate,
  onResetTemplate,
}: {
  preferences: Preferences;
  history: RecordEntry[];
  routine: Routine;
  today: PlanItem[];
  session: Session | null;
  onChoose: (split: Split) => void;
  onGuide: (id: MachineId) => void;
  onToday: () => void;
  onHistory: () => void;
  onSource: () => void;
  onSaveTemplate: (routine: Routine, items: PlanItem[], globalRest: number) => void;
  onResetTemplate: (routine: Routine) => void;
}) {
  const [preview, setPreview] = useState<Split>(preferences.split);
  const [attendance, setAttendance] = useState<Attendance>('three');
  const [details, setDetails] = useState(false);
  const active = !!session;
  const cycle = routineCycle(preferences.split);
  const start = Math.max(0, cycle.indexOf(routine));
  const chosen = programs.find((x) => x.split === preview)!;
  const last = history[history.length - 1];
  const showPlan = (items: PlanItem[]) =>
    items.map((item, index) => (
      <Pressable
        key={`${index}:${item.machine}`}
        accessibilityRole="button"
        onPress={() => onGuide(item.machine)}
        style={s.row}
      >
        <Text style={s.number}>{String(index + 1).padStart(2, '0')}</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.name}>
            {machines[item.machine].name}
            {item.finisher ? ' · 마무리' : ''}
          </Text>
          <Text style={s.meta}>
            {machines[item.machine].area} · {item.sets}세트 · 세트당 {item.work}초 · 휴식{' '}
            {item.rest}초
          </Text>
        </View>
        <Text>↗</Text>
      </Pressable>
    ));

  return (
    <View style={s.page}>
      <Text style={s.title}>내 루틴</Text>
      <Text style={s.meta}>방문 순서대로 이어집니다. 날짜로 확정된 일정이 아니에요.</Text>

      {[0, 1, 2].map((offset) => {
        const step = cycle[(start + offset) % cycle.length];
        const plan = offset === 0 ? today : resolvePlan(step, preferences);
        const sessionSeconds = session
          ? Math.min(
              sessionLimit(session),
              session.phases.reduce((sum, x) => sum + x.seconds, 0),
            )
          : 0;
        const names =
          offset === 0 && session
            ? [
                ...new Set(session.phases.filter((x) => x.kind === 'work').map((x) => x.machine)),
              ].map((id) => machines[id].name)
            : plan.map((x) => machines[x.machine].name);
        return (
          <View key={offset} style={[s.card, offset === 0 && s.now]}>
            <View style={s.between}>
              <Text style={s.heading}>
                {offset === 0 && active ? '진행 중' : visitLabels[offset]} · {routineNames[step]}
              </Text>
              <Text style={s.value}>
                {formatTime(offset === 0 && session ? sessionSeconds : planSeconds(plan))}
              </Text>
            </View>
            <Text style={s.body}>{names.join(' · ')}</Text>
            <Text style={s.meta}>
              {offset === 0 && session
                ? '실행 중인 세션'
                : `운동 구간 ${formatTime(planBreakdown(plan).work)} · 휴식 ${formatTime(planBreakdown(plan).rest)}`}{' '}
              · 예상 진행 시간
            </Text>
            {offset === 0 && (
              <Pressable accessibilityRole="button" onPress={onToday} style={s.button}>
                <Text style={s.name}>
                  {active ? '진행 화면으로 →' : '오늘의 운동에서 확인·수정 →'}
                </Text>
              </Pressable>
            )}
          </View>
        );
      })}

      <RoutineBuilder
        preferences={preferences}
        routine={routine}
        session={session}
        onSave={onSaveTemplate}
        onReset={onResetTemplate}
        onGuide={onGuide}
      />

      <View style={s.card}>
        <Text style={s.heading}>루틴 종류 바꾸기</Text>
        <View style={s.choices}>
          {programs.map((program) => (
            <Pressable
              key={program.split}
              accessibilityRole="button"
              accessibilityState={{ selected: preview === program.split }}
              onPress={() => setPreview(program.split)}
              style={[s.choice, preview === program.split && s.selected]}
            >
              <Text style={s.name}>
                {program.name}
                {preferences.split === program.split ? ' · 사용 중' : ''}
              </Text>
              <Text style={s.meta}>{program.forWho}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={s.meta}>
          {routineCycle(preview)
            .map(
              (step) =>
                `${routineNames[step]} · 운동 ${formatTime(planBreakdown(resolvePlan(step, { ...preferences, split: preview })).work)} / 전체 ${formatTime(planSeconds(resolvePlan(step, { ...preferences, split: preview })))}`,
            )
            .join('  ·  ')}
        </Text>
        <Text style={s.meta}>
          분할 방식은 여기서 선택해요. 저장한 종목·마무리 운동은 유지하고, 새로 선택한 구성만
          기본안으로 시작합니다. 수정한 날의 기본안은 위 편집기에서 되돌릴 수 있어요.
        </Text>
        <Pressable
          disabled={active}
          accessibilityRole="button"
          onPress={() => onChoose(preview)}
          style={[s.button, active && { opacity: 0.4 }]}
        >
          <Text style={s.name}>
            {active ? '진행 중인 운동을 마친 뒤 변경 가능' : '이 루틴으로 바꾸기 →'}
          </Text>
        </Pressable>
      </View>

      <View style={s.card}>
        <Text style={s.heading}>지난 운동</Text>
        <Text style={s.body}>
          {last
            ? `${new Date(last.endedAt).toLocaleDateString('ko-KR')} · ${routineNames[last.routine]} · 직접 완료 ${last.confirmedSets}세트`
            : '아직 운동 기록이 없어요. 첫 운동부터 차곡차곡 쌓입니다.'}
        </Text>
        <Pressable accessibilityRole="button" onPress={onHistory} style={s.button}>
          <Text style={s.name}>기록 전체 보기 →</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: details }}
        onPress={() => setDetails(!details)}
        style={s.button}
      >
        <Text style={s.name}>
          {details ? '자세한 설명 접기 ↑' : '구성 이유 · 반복 수 · 일정 예시 자세히 ↓'}
        </Text>
      </Pressable>
      {details && (
        <View style={s.card}>
          <Text style={s.heading}>{chosen.name}</Text>
          <Text style={s.body}>{chosen.why}</Text>
          <Text style={s.body}>{chosen.rhythm}</Text>
          <Text style={s.heading}>운동일과 휴식일 · 일정 예시</Text>
          <Text style={s.meta}>
            요일표는 이해를 돕는 예시이며 저장되는 예약이 아닙니다. 실제 진행은 방문 순서에 따라
            이어져요.
          </Text>
          {preview === 'ppl' && (
            <View style={s.choices}>
              {(['three', 'six', 'rolling'] as Attendance[]).map((value, index) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: attendance === value }}
                  key={value}
                  onPress={() => setAttendance(value)}
                  style={[s.button, attendance === value && s.selected]}
                >
                  <Text style={s.name}>{['주 3회', '주 6회', '3일 운동 + 1일 휴식'][index]}</Text>
                </Pressable>
              ))}
            </View>
          )}
          <View style={s.choices}>
            {scheduleExample(preview, attendance).map((day) => (
              <View
                key={day.day}
                style={[s.day, day.label === '휴식' && { backgroundColor: '#F2F3EE' }]}
              >
                <Text style={s.meta}>{day.day}</Text>
                <Text style={s.name}>{day.label}</Text>
              </View>
            ))}
          </View>
          <Text style={s.body}>
            {preview === 'ppl'
              ? attendance === 'three'
                ? '주 3회 PPL은 각 부위를 주 1회 훈련하는 예시예요. 입문·불규칙 방문이라면 전신 A/B를 먼저 고려하세요. 쉬는 날 수만으로 완전 회복을 보장하지 않습니다.'
                : attendance === 'six'
                  ? '각 부위를 주 2회 반복하는 빈도 높은 예시입니다. 숙련자도 피로·수면·통증에 따라 휴식일과 세트 수를 조절하세요. 주 6회가 자동으로 더 좋은 결과를 보장하지 않아요.'
                  : '요일에 고정하지 않고 4일 주기를 반복합니다. 달력의 매주 같은 요일에 같은 부위가 오지는 않아요.'
              : '요일 배치는 예시이며 예약이 아닙니다. 방문하지 못한 날을 몰아서 보충하지 않고 다음 체크인에서 순서를 이어가요.'}
          </Text>
          <Text style={s.heading}>이대로 시작할 때</Text>
          <Text style={s.body}>
            새 기본안은 5종목 × 5세트 × 60초로 운동 구간 25분을 계획합니다. 이는 사용자가 요청한
            시간 목표이며 보편적인 최소 운동량은 아닙니다. 익숙하지 않거나 피로하면 세트를 줄이세요.
            세트당 시간과 휴식은 내 기본 루틴에서 바꿀 수 있고, 바꾸면 위의 예상 시간에 바로
            반영됩니다. 횟수를 채우고 먼저 끝나면 세트 완료를 누르고, 필요하면 +30초 더 또는
            일시정지를 사용하세요.
          </Text>
          {routineCycle(preview).map((step) => (
            <View key={step}>
              <Text style={s.heading}>
                {routineNames[step]} · {formatTime(planSeconds(defaultPlan(step)))} ·{' '}
                {routinePurpose[step]}
              </Text>
              {showPlan(defaultPlan(step))}
              <Text style={s.meta}>
                세트당 시작 반복 범위 ·{' '}
                {defaultPlan(step)
                  .map((item) => `${machines[item.machine].name} ${repetitionGuide(item.machine)}`)
                  .join(' / ')}
              </Text>
              {defaultPlan(step).some((item) => alternatives[item.machine]?.length) && (
                <Text style={s.body}>
                  기구가 없거나 다른 동작을 원할 때{'\n'}
                  {defaultPlan(step)
                    .filter((item) => alternatives[item.machine]?.length)
                    .map(
                      (item) =>
                        `${machines[item.machine].name} → ${alternatives[item.machine]!.map((id) => machines[id].name).join(' / ')}`,
                    )
                    .join('\n')}
                  {'\n'}하나를 골라 교체하는 후보예요. 모두 추가하지 않으며, 프리웨이트는 자세를
                  익힌 뒤 선택하세요.
                </Text>
              )}
            </View>
          ))}
          <Text style={s.body}>
            다음 순서는 직접 완료한 세트가 있는 루틴을 끝냈을 때의 예상입니다. 중간 종료·이전 버전의
            시간 제한 종료만으로 순서를 넘기지 않아요. 큰 근육군을 고르게 훈련하고 꾸준히 이어가는
            원칙을 참고한 FitIn 기본안이며, 개인별 회복·훈련량을 계산한 처방은 아닙니다.
          </Text>
          <Pressable accessibilityRole="link" onPress={onSource}>
            <Text style={s.name}>루틴 구성 참고 · ACSM 안내 ↗</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  page: { paddingTop: 28, gap: 14 },
  day: { minWidth: 72, padding: 12, gap: 8, borderRadius: 12, backgroundColor: '#E4EEE8' },
  title: { fontSize: 26, fontWeight: '800', color: '#17343A' },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 22, gap: 10 },
  now: { borderWidth: 2, borderColor: '#648A7A' },
  heading: { fontSize: 16, fontWeight: '700', color: '#244348' },
  body: { fontSize: 13, lineHeight: 23, color: '#647C7D' },
  meta: { fontSize: 11, lineHeight: 19, color: '#82928D' },
  value: { fontSize: 13, fontWeight: '700', color: '#628174', fontVariant: ['tabular-nums'] },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#EEF1EE',
  },
  name: { color: '#244348', fontSize: 13, fontWeight: '600' },
  number: { color: '#C46F5B' },
  button: { backgroundColor: '#DAE9DF', padding: 14, borderRadius: 12, alignItems: 'center' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  choice: {
    flexGrow: 1,
    flexBasis: 220,
    padding: 14,
    borderRadius: 14,
    gap: 6,
    borderWidth: 2,
    borderColor: '#E3EAE6',
    backgroundColor: 'white',
  },
  selected: { borderColor: '#648A7A', backgroundColor: '#EFF5EF' },
});
