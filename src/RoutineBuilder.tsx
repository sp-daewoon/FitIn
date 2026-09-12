import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  applyGlobalRest,
  DEFAULT_REST,
  DEFAULT_WORK,
  formatTime,
  MachineId,
  markRestOverrides,
  machines,
  MAX_ITEMS,
  PlanItem,
  planBreakdown,
  Preferences,
  REST_CHOICES,
  resolveTemplate,
  Routine,
  routineCycle,
  routineNames,
  Session,
  WORK_GOAL_SECONDS,
  validateTemplate,
} from './workout';

const step = (value: number, delta: number, low: number, high: number) =>
  Math.max(low, Math.min(high, value + delta));

/**
 * Edits the persistent goal template. Today's copy is never written from here: the caller stores
 * the template, and the session screen derives a one-day copy from it.
 */
export function RoutineBuilder({
  preferences,
  routine,
  session,
  onSave,
  onReset,
  onGuide,
}: {
  preferences: Preferences;
  routine: Routine;
  session: Session | null;
  onSave: (routine: Routine, items: PlanItem[], globalRest: number) => void;
  onReset: (routine: Routine) => void;
  onGuide: (id: MachineId) => void;
}) {
  const cycle = routineCycle(preferences.split);
  const [target, setTarget] = useState<Routine>(routine);
  const load = (target: Routine, from: Preferences) =>
    markRestOverrides(resolveTemplate(target, from), from.globalRest ?? DEFAULT_REST);
  const [draft, setDraft] = useState<PlanItem[]>(() => load(routine, preferences));
  const [rest, setRest] = useState(preferences.globalRest ?? DEFAULT_REST);
  const [adding, setAdding] = useState<null | 'main' | 'finisher'>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const next = cycle.includes(target) ? target : cycle[0];
    if (next !== target) setTarget(next);
    setDraft(load(next, preferences));
    setRest(preferences.globalRest ?? DEFAULT_REST);
    setAdding(null);
    setSaved(false);
  }, [target, preferences.split, preferences.templates, preferences.globalRest]);

  let error = '';
  try {
    validateTemplate(draft);
  } catch (e) {
    error = (e as Error).message;
  }
  const parts = planBreakdown(draft);
  const missingWork = Math.max(0, WORK_GOAL_SECONDS - parts.work);
  const stored = preferences.templates?.[target];
  const touch = (next: PlanItem[]) => {
    setDraft(next);
    setSaved(false);
  };
  const update = (index: number, patch: Partial<PlanItem>) =>
    touch(draft.map((x, i) => (i === index ? { ...x, ...patch } : x)));
  const move = (index: number, delta: number) => {
    const next = [...draft];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    touch(next);
  };
  const changeRest = (value: number) => {
    setRest(value);
    setDraft(applyGlobalRest(draft, value));
    setSaved(false);
  };
  const add = (machine: MachineId) => {
    touch([
      ...draft,
      {
        machine,
        sets: 3,
        work: DEFAULT_WORK,
        rest,
        ...(adding === 'finisher' ? { finisher: true } : {}),
      },
    ]);
    setAdding(null);
  };
  const options = (Object.keys(machines) as MachineId[]).filter(
    (id) => adding === 'finisher' || !draft.some((x) => x.machine === id),
  );

  return (
    <View style={s.card}>
      <Text style={s.heading}>내 기본 루틴 · 계속 유지되는 목표</Text>
      <Text style={s.meta}>
        여기서 저장하면 매 방문에 그대로 적용돼요. 오늘 하루만 바꾸는 건 오늘의 운동에서 합니다.
      </Text>
      {cycle.length > 1 && (
        <View style={s.chips}>
          {cycle.map((value) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{ selected: target === value }}
              onPress={() => setTarget(value)}
              style={[s.chip, target === value && s.on]}
            >
              <Text style={s.name}>{routineNames[value]}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={s.heading}>휴식 {rest}초 · 모든 세트 공통</Text>
      <View style={s.chips}>
        {REST_CHOICES.map((value) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityLabel={`전체 휴식 ${value}초`}
            accessibilityState={{ selected: rest === value }}
            onPress={() => changeRest(value)}
            style={[s.chip, rest === value && s.on]}
          >
            <Text style={s.name}>{value}초</Text>
          </Pressable>
        ))}
      </View>
      <Text style={s.meta}>개별 휴식을 켠 운동은 이 값을 따르지 않고 따로 표시돼요.</Text>

      {draft.map((x, i) => (
        <View key={`${i}:${x.machine}`} style={s.item}>
          <View style={s.between}>
            <Pressable accessibilityRole="button" onPress={() => onGuide(x.machine)}>
              <Text style={s.name}>
                {i + 1}. {machines[x.machine].name} {x.finisher ? '· 마무리' : ''} ↗
              </Text>
              <Text style={s.meta}>{machines[x.machine].area}</Text>
            </Pressable>
            <View style={s.row}>
              <Pressable
                disabled={i === 0}
                accessibilityRole="button"
                accessibilityLabel={`${machines[x.machine].name} 위로`}
                onPress={() => move(i, -1)}
                style={[s.mini, i === 0 && s.off]}
              >
                <Text>↑</Text>
              </Pressable>
              <Pressable
                disabled={i === draft.length - 1}
                accessibilityRole="button"
                accessibilityLabel={`${machines[x.machine].name} 아래로`}
                onPress={() => move(i, 1)}
                style={[s.mini, i === draft.length - 1 && s.off]}
              >
                <Text>↓</Text>
              </Pressable>
              <Pressable
                disabled={draft.length <= 1}
                accessibilityRole="button"
                accessibilityLabel={`${machines[x.machine].name} 빼기`}
                onPress={() => touch(draft.filter((_, j) => j !== i))}
                style={[s.mini, draft.length <= 1 && s.off]}
              >
                <Text>−</Text>
              </Pressable>
            </View>
          </View>
          <View style={s.between}>
            <Text style={s.meta}>{x.sets}세트</Text>
            <View style={s.row}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${machines[x.machine].name} 세트 줄이기`}
                onPress={() => update(i, { sets: step(x.sets, -1, 1, 5) })}
                style={s.mini}
              >
                <Text>−</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${machines[x.machine].name} 세트 늘리기`}
                onPress={() => update(i, { sets: step(x.sets, 1, 1, 5) })}
                style={s.mini}
              >
                <Text>+</Text>
              </Pressable>
            </View>
          </View>
          <View style={s.between}>
            <Text style={s.meta}>세트당 운동 {x.work}초</Text>
            <View style={s.row}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${machines[x.machine].name} 세트 시간 줄이기`}
                onPress={() => update(i, { work: step(x.work, -15, 20, 180) })}
                style={s.mini}
              >
                <Text>−15</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${machines[x.machine].name} 세트 시간 늘리기`}
                onPress={() => update(i, { work: step(x.work, 15, 20, 180) })}
                style={s.mini}
              >
                <Text>+15</Text>
              </Pressable>
            </View>
          </View>
          <View style={s.between}>
            <Text style={s.meta}>
              휴식 {x.rest}초 {x.restOverride ? '· 이 운동만' : '· 전체 설정'}
            </Text>
            <View style={s.row}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: !!x.restOverride }}
                accessibilityLabel={`${machines[x.machine].name} 개별 휴식`}
                onPress={() =>
                  update(i, x.restOverride ? { restOverride: false, rest } : { restOverride: true })
                }
                style={[s.mini, x.restOverride && s.on]}
              >
                <Text>{x.restOverride ? '전체로' : '개별'}</Text>
              </Pressable>
              {x.restOverride && (
                <>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${machines[x.machine].name} 휴식 줄이기`}
                    onPress={() => update(i, { rest: step(x.rest, -15, 30, 180) })}
                    style={s.mini}
                  >
                    <Text>−15</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${machines[x.machine].name} 휴식 늘리기`}
                    onPress={() => update(i, { rest: step(x.rest, 15, 30, 180) })}
                    style={s.mini}
                  >
                    <Text>+15</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </View>
      ))}

      <View style={s.row}>
        <Pressable
          disabled={draft.length >= MAX_ITEMS}
          accessibilityRole="button"
          onPress={() => setAdding(adding === 'main' ? null : 'main')}
          style={[s.button, draft.length >= MAX_ITEMS && s.off]}
        >
          <Text style={s.name}>+ 운동 추가</Text>
        </Pressable>
        <Pressable
          disabled={draft.length >= MAX_ITEMS}
          accessibilityRole="button"
          onPress={() => setAdding(adding === 'finisher' ? null : 'finisher')}
          style={[s.button, draft.length >= MAX_ITEMS && s.off]}
        >
          <Text style={s.name}>+ 마지막 마무리 운동</Text>
        </Pressable>
      </View>
      {adding && (
        <>
          <Text style={s.meta}>
            {adding === 'finisher'
              ? '맨 뒤에 붙습니다. 마무리로는 같은 운동을 한 번 더 넣을 수 있어요. 데드리프트처럼 끝에 몰아서 하는 운동을 여러 개 넣어도 됩니다.'
              : '맨 뒤에 추가한 뒤 순서를 올려 원하는 자리에 두세요.'}
          </Text>
          <View style={s.chips}>
            {options.map((id) => (
              <Pressable key={id} accessibilityRole="button" onPress={() => add(id)} style={s.chip}>
                <Text style={s.name}>{machines[id].name}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <View style={s.budget}>
        <View style={s.between}>
          <Text style={s.meta}>운동 시간</Text>
          <Text style={s.value}>{formatTime(parts.work)}</Text>
        </View>
        <View style={s.between}>
          <Text style={s.meta}>휴식 시간</Text>
          <Text style={s.value}>{formatTime(parts.rest)}</Text>
        </View>
        <View style={s.between}>
          <Text style={s.meta}>기구 이동·정리</Text>
          <Text style={s.value}>{formatTime(parts.move + parts.setup)}</Text>
        </View>
        <View style={s.between}>
          <Text style={s.name}>합계</Text>
          <Text style={s.value}>{formatTime(parts.total)}</Text>
        </View>
        <Text style={[s.meta, missingWork > 0 && s.warn]}>
          {missingWork > 0
            ? `운동 구간 목표 25분까지 ${formatTime(missingWork)} 남음 · 종목·세트·시간을 직접 조절하세요.`
            : '계획상 운동 구간 25분 목표 충족'}
        </Text>
        <Text style={s.meta}>
          휴식·이동은 운동 구간에서 제외합니다. 전체 루틴이 끝날 때까지 진행하며 짧게 설정해도
          저장할 수 있어요. 실제 수행은 완료 버튼으로 따로 기록합니다.
        </Text>
      </View>
      {error ? <Text style={s.warn}>{error}</Text> : null}
      <Pressable
        disabled={!!error}
        accessibilityRole="button"
        onPress={() => {
          onSave(target, draft, rest);
          setSaved(true);
        }}
        style={[s.button, !!error && s.off]}
      >
        <Text style={s.name}>
          {saved ? '저장했어요 ✓' : `${routineNames[target]} 기본 루틴 저장`}
        </Text>
      </Pressable>
      {stored && (
        <Pressable accessibilityRole="button" onPress={() => onReset(target)} style={s.button}>
          <Text style={s.name}>기본 구성으로 되돌리기</Text>
        </Pressable>
      )}
      <Text style={s.meta}>
        {session
          ? '진행 중인 운동에는 적용되지 않아요. 저장한 목표는 다음 체크인부터 사용합니다.'
          : '저장해도 지난 기록과 다음 순서는 그대로 유지됩니다.'}
      </Text>
    </View>
  );
}
const s = StyleSheet.create({
  card: { backgroundColor: 'white', borderRadius: 20, padding: 22, gap: 12 },
  item: { gap: 8, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#EEF1EE' },
  heading: { fontSize: 16, fontWeight: '700', color: '#244348' },
  name: { color: '#244348', fontSize: 13, fontWeight: '600' },
  meta: { fontSize: 11, lineHeight: 19, color: '#82928D' },
  value: { fontSize: 12, fontWeight: '600', color: '#628174', fontVariant: ['tabular-nums'] },
  warn: { fontSize: 12, lineHeight: 20, color: '#C46F5B', fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E3EAE6',
    backgroundColor: '#F7F9F7',
  },
  mini: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#EEF3EF',
    minWidth: 44,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#DAE9DF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexGrow: 1,
  },
  budget: { backgroundColor: '#F4F7F4', borderRadius: 14, padding: 16, gap: 8 },
  on: { borderColor: '#648A7A', backgroundColor: '#DAE9DF' },
  off: { opacity: 0.4 },
});
