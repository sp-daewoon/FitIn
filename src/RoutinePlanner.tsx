import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  defaultPlan,
  formatTime,
  MachineId,
  machines,
  PlanItem,
  Preferences,
  RecordEntry,
  resolvePlan,
  Routine,
  routineCycle,
  routineNames,
  Split,
  Session,
} from './workout';
import { planSeconds } from './workout';
import {
  alternatives,
  Attendance,
  repetitionGuide,
  routinePurpose,
  scheduleExample,
} from './programGuidance';

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
];
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
}) {
  const [preview, setPreview] = useState<Split>(preferences.split);
  const [attendance, setAttendance] = useState<Attendance>('three');
  const active = !!session;
  const cycle = routineCycle(preferences.split);
  const start = Math.max(0, cycle.indexOf(routine));
  const chosen = programs.find((x) => x.split === preview)!;
  const last = history[history.length - 1];
  const showPlan = (items: PlanItem[]) =>
    items.map((item, index) => (
      <Pressable
        key={item.machine}
        accessibilityRole="button"
        onPress={() => onGuide(item.machine)}
        style={s.row}
      >
        <Text style={s.number}>{String(index + 1).padStart(2, '0')}</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{machines[item.machine].name}</Text>
          <Text style={s.meta}>
            {machines[item.machine].area} · {item.sets}세트 · 휴식 {item.rest}초
          </Text>
          <Text style={s.meta}>
            세트당 {repetitionGuide(item.machine)} · {machines[item.machine].pattern}
          </Text>
        </View>
        <Text>↗</Text>
      </Pressable>
    ));
  return (
    <View style={s.page}>
      <Text style={s.title}>내 운동의 전체 흐름.</Text>
      <Text style={s.body}>
        1. 루틴 고르기 → 2. 오늘 순서 확인·수정 → 3. 체크인{'\n'}요일이 바뀌어도 순서를 건너뛰지
        않아요. 다음 방문은 내일로 확정된 일정이 아닙니다.
      </Text>
      <Text style={s.title}>나에게 맞는 루틴 고르기</Text>
      <View style={s.card}>
        <Text style={s.heading}>처음이라 선택이 어렵다면</Text>
        <Text style={s.body}>
          주 2~3회 또는 불규칙 방문 → 전신 A/B{'\n'}주 4회, 부위별로 집중 → 상체/하체{'\n'}분할에
          익숙하고 방문 횟수가 충분함 → PPL{'\n'}빈도만으로 회복 상태를 판단하지 않아요. 먼저 구성과
          시간부터 확인하세요.
        </Text>
        <Pressable accessibilityRole="button" onPress={() => setPreview('full')} style={s.button}>
          <Text style={s.name}>입문 추천 · 전신 A/B 구성 보기 →</Text>
        </Pressable>
      </View>
      <View style={s.choices}>
        {programs.map((program) => (
          <Pressable
            key={program.split}
            accessibilityRole="button"
            accessibilityState={{ selected: preview === program.split }}
            onPress={() => setPreview(program.split)}
            style={[s.choice, preview === program.split && s.selected]}
          >
            <Text style={s.heading}>
              {program.name}
              {preferences.split === program.split ? ' · 사용 중' : ''}
            </Text>
            <Text style={s.body}>{program.forWho}</Text>
          </Pressable>
        ))}
      </View>
      <View style={s.card}>
        <Text style={s.heading}>{chosen.name} · 전체 구성 미리보기</Text>
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
          각 운동 3세트, 세트당 아래 반복 범위로 시작해요. 마지막에 2~3회는 더 할 수 있을 정도의
          가벼운 무게로 자세를 익히세요. 60초는 진행 예상 시간이며, 횟수를 채우고 먼저 끝나면 세트
          완료를 눌러요. 필요하면 +30초 더 또는 일시정지를 사용하세요. 휴식은 90초, 기구 이동·정리는
          60초가 포함됩니다.
        </Text>
        {routineCycle(preview).map((step) => (
          <View key={step}>
            <Text style={s.heading}>
              {routineNames[step]} · {formatTime(planSeconds(defaultPlan(step)))}
            </Text>
            <Text style={s.body}>
              {routinePurpose[step]} · {defaultPlan(step).reduce((sum, item) => sum + item.sets, 0)}
              세트 · 40분까지 여유 {formatTime(2400 - planSeconds(defaultPlan(step)))}
            </Text>
            {showPlan(defaultPlan(step))}
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
                {'\n'}하나를 골라 교체하는 후보예요. 모두 추가하지 않으며, 프리웨이트는 자세를 익힌
                뒤 선택하세요.
              </Text>
            )}
          </View>
        ))}
        <Text style={s.body}>
          적용하면 기존 시작 운동·저장 루틴을 이 구성으로 바꿉니다. 지난 기록은 유지되며 순서는
          기록에서 이어집니다. 적용 후 오늘의 운동에서 종목·세트·휴식을 수정할 수 있어요.
        </Text>
        <Pressable
          disabled={active}
          accessibilityRole="button"
          onPress={() => onChoose(preview)}
          style={[s.button, active && { opacity: 0.4 }]}
        >
          <Text style={s.name}>
            {active ? '진행 중인 운동을 마친 뒤 변경 가능' : '이 루틴으로 운동하기 →'}
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
        {last && (
          <Text style={s.body}>
            {last.performed.map((id) => machines[id].name).join(' · ') || '직접 완료한 운동 없음'}
          </Text>
        )}
        <Pressable accessibilityRole="button" onPress={onHistory} style={s.button}>
          <Text style={s.name}>어제·이전 기록 전체 보기 →</Text>
        </Pressable>
      </View>
      {[0, 1, 2].map((offset) => {
        const step = cycle[(start + offset) % cycle.length];
        const plan = offset === 0 ? today : resolvePlan(step, preferences);
        return (
          <View key={offset} style={s.card}>
            <Text style={s.heading}>
              {offset === 0
                ? active
                  ? '지금 진행 중'
                  : '오늘 체크인할 운동'
                : `${offset}번째 다음 방문 · 예정`}{' '}
              · {routineNames[step]}
            </Text>
            {offset === 0 && session ? (
              <>
                <Text style={s.meta}>
                  현재 조정된 일정 · 최대{' '}
                  {formatTime(
                    Math.min(
                      2400,
                      session.phases.reduce((sum, phase) => sum + phase.seconds, 0),
                    ),
                  )}{' '}
                  · 일시정지 시간 제외
                </Text>
                {[
                  ...new Set(
                    session.phases
                      .filter((phase) => phase.kind === 'work')
                      .map((phase) => phase.machine),
                  ),
                ].map((id) => (
                  <Pressable
                    key={id}
                    accessibilityRole="button"
                    onPress={() => onGuide(id)}
                    style={s.row}
                  >
                    <Text style={s.name}>
                      {machines[id].name} ·{' '}
                      {
                        session.phases.filter(
                          (phase) => phase.kind === 'work' && phase.machine === id,
                        ).length
                      }
                      세트 ↗
                    </Text>
                  </Pressable>
                ))}
              </>
            ) : (
              <>
                <Text style={s.meta}>
                  {formatTime(planSeconds(plan))} 예상 · {plan.length}개 운동
                  {preferences.savedPlan ? ' · 내 저장 루틴 적용' : ''}
                </Text>
                {showPlan(plan)}
              </>
            )}
            {offset === 0 && (
              <Pressable accessibilityRole="button" onPress={onToday} style={s.button}>
                <Text style={s.name}>오늘 운동으로 가기 →</Text>
              </Pressable>
            )}
          </View>
        );
      })}
      <Text style={s.body}>
        다음 순서는 직접 완료한 세트가 있는 루틴을 끝냈을 때의 예상입니다. 중간 종료·40분 종료만으로
        순서를 넘기지 않아요. 휴식일과 컨디션은 별도로 고려해주세요.
      </Text>
      <Text style={s.body}>
        큰 근육군을 고르게 훈련하고 꾸준히 이어가는 원칙을 참고한 FitIn 기본안입니다. 개인별
        회복·훈련량을 계산한 처방은 아니며, 40분 이내에서 조절해요.
      </Text>
      <Pressable accessibilityRole="link" onPress={onSource}>
        <Text style={s.name}>루틴 구성 참고 · ACSM 안내 ↗</Text>
      </Pressable>
    </View>
  );
}
const s = StyleSheet.create({
  page: { paddingTop: 28, gap: 18 },
  day: { minWidth: 72, padding: 12, gap: 8, borderRadius: 12, backgroundColor: '#E4EEE8' },
  title: { fontSize: 26, fontWeight: '800', color: '#17343A' },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 22, gap: 12 },
  heading: { fontSize: 16, fontWeight: '700', color: '#244348' },
  body: { fontSize: 13, lineHeight: 23, color: '#647C7D' },
  meta: { fontSize: 11, lineHeight: 19, color: '#82928D' },
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
  button: { backgroundColor: '#DAE9DF', padding: 16, borderRadius: 12, alignItems: 'center' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  choice: {
    flexGrow: 1,
    flexBasis: 280,
    padding: 18,
    borderRadius: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: '#E3EAE6',
    backgroundColor: 'white',
  },
  selected: { borderColor: '#648A7A', backgroundColor: '#EFF5EF' },
});
