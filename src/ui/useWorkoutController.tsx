import { t } from '../i18n';
import React, { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';


import { useWorkout } from '../useWorkout';
import { useAuth } from '../auth/AuthContext';
import { useCloudBackup } from '../sync/useCloudBackup';
import { ExerciseVisual } from '../ExerciseVisual';






import { repetitionGuide } from '../programGuidance';

import { recommendedPlan as defaultPlan, sessionLimit, DEFAULT_WORK, MachineId, machines, markRestOverrides, nextRoutine, PlanItem, planBreakdown, planSeconds, routineNames, resolvePlan, Routine, Split, validateTemplate, withStarters } from '../workout';
import { s } from './styles';

export function useWorkoutController(){
const auth = useAuth();
const w = useWorkout(auth.account?.id ?? 'guest');
const cloud = useCloudBackup(w.data, w.persistedData, document => {
  w.setData(d => ({ ...d, preferences: document.preferences, history: document.history }));
});
  const { data, p } = w;
  const [tab, setTab] = useState<'today' | 'plan' | 'library' | 'history' | 'settings' | 'harness'>(
      'today',
    ),
    [items, setItems] = useState<PlanItem[]>(defaultPlan('fullA')),
    [edit, setEdit] = useState(false),
    [personal, setPersonal] = useState(false),
    [draft, setDraft] = useState<MachineId[]>([]),
    [replace, setReplace] = useState<number | null>(null),
    [append, setAppend] = useState(false),
    [appendRepeat, setAppendRepeat] = useState(false),
    [guide, setGuide] = useState<MachineId | null>(null),
    [stopConfirm, setStopConfirm] = useState(false),
    [removing, setRemoving] = useState<null | { id: string; label: string } | 'all'>(null),
    [notice, setNotice] = useState('');
  const { width, fontScale } = useWindowDimensions();
  const wide = width >= 900;
  const page = useRef<ScrollView>(null);
  const session = data.session;
  const routine = nextRoutine(data.history, data.preferences.split, data.preferences.customCycle);
  const [selected, setSelected] = useState<MachineId>('legPress');
  useEffect(() => {
    const next = resolvePlan(routine, data.preferences);
    setItems(next);
    setSelected(next[0].machine);
  }, [
    routine,
    data.preferences.savedPlan,
    data.preferences.starters,
    data.preferences.templates,
    data.preferences.globalRest,
  ]);
  const machine = p?.phase?.machine ?? selected;
  const m = machines[machine];
  let planError = '';
  try {
    // Personal goals can be shorter or longer than the recommended work-duration target.
    validateTemplate(items);
  } catch (e) {
    planError = (e as Error).message;
  }
  const total = planSeconds(items),
    parts = planBreakdown(items),
    sessionDuration = session
      ? Math.min(
          sessionLimit(session),
          session.phases.reduce((sum, phase) => sum + phase.seconds, 0),
        )
      : total,
    remaining = Math.max(0, sessionDuration - (p?.elapsed ?? 0));
  const upcoming =
    session && p
      ? session.phases.filter((x) => x.kind === 'move' && session.phases.indexOf(x) > p.index)
      : [];
  function reorder(index: number, delta: number) {
    setItems((current) => {
      const next = [...current];
      [next[index], next[index + delta]] = [next[index + delta], next[index]];
      return next;
    });
  }
  const bounds = { sets: [1, 5], rest: [30, 180], work: [20, 180] } as const;
  function change(index: number, key: 'sets' | 'rest' | 'work', delta: number) {
    const [low, high] = bounds[key];
    setItems((current) =>
      current.map((x, i) =>
        i === index ? { ...x, [key]: Math.max(low, Math.min(high, x[key] + delta)) } : x,
      ),
    );
  }
  /** Today's copy only. The persistent template is written from the routine builder. */
  function addToday(machine: MachineId) {
    setItems((current) => [
      ...current,
      { machine, sets: 3, work: DEFAULT_WORK, rest: data.preferences.globalRest },
    ]);
    setAppend(false);
  }
  function saveTemplate(target: Routine, plan: PlanItem[], globalRest: number) {
    w.setData((d) => ({
      ...d,
      preferences: {
        ...d.preferences,
        globalRest,
        templates: { ...d.preferences.templates, [target]: plan },
      },
    }));
    setNotice(t('{0} 기본 루틴을 저장했어요. 다음 체크인부터 적용됩니다.', routineNames[target]));
  }
  function resetTemplate(target: Routine) {
    w.setData((d) => {
      const templates = { ...d.preferences.templates };
      delete templates[target];
      return { ...d, preferences: { ...d.preferences, templates } };
    });
    setNotice(t('{0} 기본 루틴을 기본 구성으로 되돌렸어요.', routineNames[target]));
  }
  function savePlan() {
    if (planError) return;
    // A rest value the user typed here is explicit: keep it distinct from the global default so a
    // later global-rest change in the builder cannot overwrite it without being asked.
    saveTemplate(
      routine,
      markRestOverrides(items, data.preferences.globalRest),
      data.preferences.globalRest,
    );
    setEdit(false);
  }
  function chooseRoutine(split: Split, custom?: Routine[]) {
    if (session) return;
    w.setData((d) => ({
      ...d,
      preferences: {
        ...d.preferences,
        split,
        ...(split === 'custom' ? { customCycle: custom?.length ? custom : ['fullA'] } : {}),
      },
    }));
    // Stay here and return to the top. The next thing to do is check the new visit order and edit
    // each visit in the builder, not check in.
    page.current?.scrollTo({ y: 0, animated: true });
    setNotice(
      t('선택한 루틴을 적용했어요. 위 내 기본 루틴에서 방문별 구성을 확인하고 저장하세요.'),
    );
  }
  function openExternal(url: string) {
    if (session && !session.paused) w.command('pause');
    void Linking.openURL(url).catch(() => {
      setGuide(null);
      setNotice(
        t(
          '링크를 열지 못했어요. 인터넷 연결을 확인하고 다시 시도해주세요. 진행 중이던 운동은 재개 버튼을 눌러 이어가세요.',
        ),
      );
    });
  }
  function applyPersonal() {
    try {
      const proposal = withStarters(defaultPlan(routine), draft);
      setItems(proposal.items);
      setSelected(proposal.items[0].machine);
      w.setData((d) => ({
        ...d,
        preferences: { ...d.preferences, starters: draft, savedPlan: proposal.items },
      }));
      setNotice(
        proposal.replaced.length
          ? t(
              '{0} 대신 선택한 시작 운동을 넣었어요. 부위 구성을 확인해주세요.',
              proposal.replaced.map((id) => machines[id].name).join(' · '),
            )
          : t('선택한 운동을 앞쪽에 배치했어요.'),
      );
      setPersonal(false);
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  const visual = (
    <View style={s.visualCard}>
      <View style={s.between}>
        <Text style={s.overline}>{session ? 'YOUR CURRENT MOVE' : 'KNOW YOUR NEXT MOVE'}</Text>
        <Text style={s.tag}>
          {m.equipment} · {m.region}
        </Text>
      </View>
      <ExerciseVisual machine={machine} />
      <View style={s.muscleLegend}>
        <View style={s.coralDot} />
        <Text style={s.muscleText}>{t('주요 자극 {0}', m.area)}</Text>
      </View>
      <Text style={s.support}>{t('함께 쓰는 부위 {0}', m.secondary)}</Text>
      <Text style={s.support}>
        {t('세트당 {0} 시작 범위 · 자세를 유지할 수 있는 무게', repetitionGuide(machine))}
      </Text>
      <View style={s.line} />
      <Text style={s.coachingLabel}>{t('이 동작에서 하나만 기억해요')}</Text>
      <Text style={s.cue}>{m.cue}</Text>
      <Pressable accessibilityRole="button" onPress={() => setGuide(machine)} style={s.linkButton}>
        <Text style={s.link}>{t('기구 설정과 자세 확인 ↗')}</Text>
      </Pressable>
    </View>
  );
  
return {auth,cloud,w,data,p,tab,setTab,items,setItems,edit,setEdit,personal,setPersonal,draft,setDraft,replace,setReplace,append,setAppend,appendRepeat,setAppendRepeat,guide,setGuide,stopConfirm,setStopConfirm,removing,setRemoving,notice,setNotice,width,fontScale,wide,page,session,routine,selected,setSelected,machine,m,planError,total,parts,sessionDuration,remaining,upcoming,reorder,bounds,change,addToday,saveTemplate,resetTemplate,savePlan,chooseRoutine,openExternal,applyPersonal,visual};
}
