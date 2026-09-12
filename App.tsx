import React, { useEffect, useState } from 'react';
import {
  Modal,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useWorkout } from './src/useWorkout';
import { ExerciseVisual } from './src/ExerciseVisual';
import { ExerciseLibrary } from './src/ExerciseLibrary';
import { RoutinePlanner } from './src/RoutinePlanner';
import { exerciseVideos, videoSearch } from './src/videos';
import { repetitionGuide } from './src/programGuidance';
import { Harness } from './src/Harness';
import {
  defaultPlan,
  formatTime,
  Level,
  MachineId,
  machines,
  nextRoutine,
  PlanItem,
  planSeconds,
  routineNames,
  resolvePlan,
  Split,
  TOTAL_SECONDS,
  validatePlan,
  withStarters,
} from './src/workout';
function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        (disabled || pressed) && { opacity: 0.45 },
      ]}
    >
      <Text style={[s.buttonLabel, secondary && { color: '#244348' }]}>{label}</Text>
    </Pressable>
  );
}
function FitIn() {
  const w = useWorkout();
  const { data, p } = w;
  const [tab, setTab] = useState<'today' | 'plan' | 'library' | 'history' | 'settings' | 'harness'>(
      'today',
    ),
    [items, setItems] = useState<PlanItem[]>(defaultPlan('fullA')),
    [edit, setEdit] = useState(false),
    [personal, setPersonal] = useState(false),
    [draft, setDraft] = useState<MachineId[]>([]),
    [replace, setReplace] = useState<number | null>(null),
    [guide, setGuide] = useState<MachineId | null>(null),
    [stopConfirm, setStopConfirm] = useState(false),
    [notice, setNotice] = useState('');
  const wide = useWindowDimensions().width >= 900;
  const session = data.session;
  const routine = nextRoutine(data.history, data.preferences.split);
  const [selected, setSelected] = useState<MachineId>('legPress');
  useEffect(() => {
    const next = resolvePlan(routine, data.preferences);
    setItems(next);
    setSelected(next[0].machine);
  }, [routine, data.preferences.savedPlan, data.preferences.starters]);
  const machine = p?.phase?.machine ?? selected;
  const m = machines[machine];
  let planError = '';
  try {
    validatePlan(items);
  } catch (e) {
    planError = (e as Error).message;
  }
  const total = planSeconds(items),
    remaining = TOTAL_SECONDS - (p?.elapsed ?? 0);
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
  function change(index: number, key: 'sets' | 'rest', delta: number) {
    setItems((current) =>
      current.map((x, i) =>
        i === index
          ? {
              ...x,
              [key]: Math.max(
                key === 'sets' ? 1 : 30,
                Math.min(key === 'sets' ? 5 : 180, x[key] + delta),
              ),
            }
          : x,
      ),
    );
  }
  function savePlan() {
    if (planError) return;
    w.setData((d) => ({
      ...d,
      preferences: { ...d.preferences, split: 'fixed', starters: [], savedPlan: items },
    }));
    setEdit(false);
    setNotice('매번 반복하는 내 고정 루틴으로 저장했어요.');
  }
  function chooseRoutine(split: Split) {
    if (session) return;
    w.setData((d) => ({
      ...d,
      preferences: { ...d.preferences, split, starters: [], savedPlan: null },
    }));
    setTab('today');
    setNotice('선택한 루틴을 적용했어요. 오늘 순서를 확인하고 체크인하세요.');
  }
  function openExternal(url: string) {
    if (session && !session.paused) w.command('pause');
    void Linking.openURL(url).catch(() => {
      setGuide(null);
      setNotice(
        '링크를 열지 못했어요. 인터넷 연결을 확인하고 다시 시도해주세요. 진행 중이던 운동은 재개 버튼을 눌러 이어가세요.',
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
          ? `${proposal.replaced.map((id) => machines[id].name).join(' · ')} 대신 선택한 시작 운동을 넣었어요. 부위 구성을 확인해주세요.`
          : '선택한 운동을 앞쪽에 배치했어요.',
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
        <Text style={s.muscleText}>주요 자극 {m.area}</Text>
      </View>
      <Text style={s.support}>함께 쓰는 부위 {m.secondary}</Text>
      <Text style={s.support}>
        세트당 {repetitionGuide(machine)} 시작 범위 · 자세를 유지할 수 있는 무게
      </Text>
      <View style={s.line} />
      <Text style={s.coachingLabel}>이 동작에서 하나만 기억해요</Text>
      <Text style={s.cue}>{m.cue}</Text>
      <Pressable accessibilityRole="button" onPress={() => setGuide(machine)} style={s.linkButton}>
        <Text style={s.link}>기구 설정과 자세 확인 ↗</Text>
      </Pressable>
      <Text style={s.assetNote}>
        개발용 생성 일러스트 · 자세 검수 전 · 실제 기구와 차이가 있어요
      </Text>
    </View>
  );
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[s.container, wide && s.desktop]}>
        <View style={s.header}>
          <Text style={s.logo}>
            fit<Text style={{ color: '#E97860' }}>in.</Text>
          </Text>
          <View style={s.headerRight}>
            <View style={s.dot} />
            <Text style={s.small}>내 기기에만 저장</Text>
            <Text style={s.buildTag}>DEV 0.2</Text>
          </View>
        </View>
        <View style={s.nav}>
          {(
            [
              ['today', '오늘의 운동'],
              ['plan', '내 루틴'],
              ['library', '운동 사전'],
              ['history', '운동 기록'],
              ['settings', '나의 방식'],
              ...(__DEV__ ? [['harness', '하네스']] : []),
            ] as [typeof tab, string][]
          ).map(([value, label]) => (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === value }}
              key={value}
              onPress={() => setTab(value)}
              style={[s.tab, tab === value && s.activeTab]}
            >
              <Text style={[s.tabText, tab === value && { color: '#203C42' }]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        {w.error ? (
          <View style={s.warning}>
            <Text style={s.body}>{w.error}</Text>
            {w.saveFailed && (
              <Button secondary label="저장 다시 시도" onPress={() => void w.retry()} />
            )}
          </View>
        ) : null}
        {!w.ready ? (
          <Text style={s.title}>기록을 불러오고 있어요.</Text>
        ) : (
          <>
            {notice ? (
              <View style={s.notice}>
                <Text style={[s.body, { flex: 1 }]}>{notice}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="안내 닫기"
                  onPress={() => setNotice('')}
                  style={s.close}
                >
                  <Text>×</Text>
                </Pressable>
              </View>
            ) : null}
            {tab === 'today' && (
              <>
                <View style={s.intro}>
                  <Text style={s.overline}>
                    {session ? 'FOCUS ON THE MOVEMENT' : 'YOUR 40-MINUTE FOCUS'}
                  </Text>
                  <Text style={s.title}>
                    {session
                      ? p?.phase?.kind === 'rest'
                        ? '다음 세트를 준비해요.'
                        : p?.phase?.kind === 'move'
                          ? '다음 기구로 이동해요.'
                          : p?.phase?.kind === 'prepare'
                            ? '자세를 잡아주세요.'
                            : m.name
                      : '운동에만 집중하세요.'}
                  </Text>
                  <Text style={s.subtitle}>
                    {session
                      ? '동작은 크게, 안내는 간결하게. 내 페이스로 이어가요.'
                      : '몸풀기는 끝내고 오세요. 체크인 후 10초면 시작합니다.'}
                  </Text>
                </View>
                <View style={wide ? s.columns : s.stacked}>
                  <View style={wide ? s.mainColumn : undefined}>
                    {!session && (
                      <View style={s.between}>
                        <Text style={s.section}>{m.name}</Text>
                        <Text style={s.small}>기구를 선택해 미리 볼 수 있어요</Text>
                      </View>
                    )}
                    {visual}
                  </View>
                  <View style={wide ? s.sideColumn : undefined}>
                    {session && p ? (
                      <>
                        <View style={s.controlCard}>
                          <View style={s.between}>
                            <Text style={s.overline}>
                              {session.paused ? 'PAUSED' : 'GUIDED SESSION'}
                            </Text>
                            <Text style={s.liveBadge}>
                              {p.phase?.kind === 'work'
                                ? `${p.phase.set} / ${p.phase.sets}세트`
                                : p.phase?.kind === 'rest'
                                  ? '휴식'
                                  : p.phase?.kind === 'move'
                                    ? '정리 · 이동'
                                    : '10초 준비'}
                            </Text>
                          </View>
                          <Text style={s.controlTitle}>{m.name}</Text>
                          <View style={s.clockRow}>
                            <Text style={s.phaseClock}>{formatTime(p.remaining)}</Text>
                            <Text style={s.small}>
                              {p.phase?.kind === 'work'
                                ? '이번 세트 남은 시간'
                                : p.phase?.kind === 'rest'
                                  ? '휴식 남은 시간'
                                  : '시작까지'}
                            </Text>
                          </View>
                          <View style={s.track}>
                            <View
                              style={[s.fill, { width: `${(p.elapsed / TOTAL_SECONDS) * 100}%` }]}
                            />
                          </View>
                          <View style={s.between}>
                            <Text style={s.small}>전체 {formatTime(p.elapsed)}</Text>
                            <Text style={s.small}>40분까지 {formatTime(remaining)}</Text>
                          </View>
                          <View style={{ marginTop: 22 }}>
                            <Button
                              disabled={session.paused || p.phase?.kind === 'prepare'}
                              label={
                                p.phase?.kind === 'work'
                                  ? '✓  세트 완료 · 다음 단계'
                                  : p.phase?.kind === 'rest'
                                    ? '▶  준비됐어요 · 다음 세트'
                                    : p.phase?.kind === 'move'
                                      ? '▶  준비 완료 · 운동 시작'
                                      : '10초 후 자동으로 시작'
                              }
                              onPress={() => w.command('next')}
                            />
                            <View style={s.actionRow}>
                              <View style={{ flex: 1 }}>
                                <Button
                                  secondary
                                  disabled={
                                    session.paused ||
                                    p.phase?.kind === 'prepare' ||
                                    remaining <= p.remaining
                                  }
                                  label="+30초 더"
                                  onPress={() => w.command('extend')}
                                />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Button
                                  secondary
                                  label={session.paused ? '▶ 재개' : 'Ⅱ 일시정지'}
                                  onPress={() => w.command(session.paused ? 'resume' : 'pause')}
                                />
                              </View>
                            </View>
                          </View>
                          <Text style={s.helper}>
                            자동으로 이어지지만 준비되면 바로 넘어갈 수 있어요. 완료 버튼을 누른
                            세트만 수행으로 기록합니다.
                          </Text>
                          {session.phases.reduce((a, x) => a + x.seconds, 0) > 2400 && (
                            <Text style={s.limit}>
                              시간을 늘려 뒤쪽 일정이 40분을 넘어요. 40분에 종료하며 남은 세트는
                              미수행으로 남습니다.
                            </Text>
                          )}
                        </View>
                        <View style={s.card}>
                          <Text style={s.section}>다음 순서</Text>
                          {upcoming.length ? (
                            upcoming.map((x, i) => (
                              <View key={x.id} style={s.queueRow}>
                                <View style={{ flex: 1 }}>
                                  <Text style={s.rowTitle}>{machines[x.machine].name}</Text>
                                  <Text style={s.small}>{machines[x.machine].area}</Text>
                                </View>
                                {i < upcoming.length - 1 && (
                                  <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel={`${machines[x.machine].name} 다음 기구와 순서 교체`}
                                    onPress={() => w.reorder(x.machine, upcoming[i + 1].machine)}
                                    style={s.miniButton}
                                  >
                                    <Text style={s.small}>⇅ 교체</Text>
                                  </Pressable>
                                )}
                              </View>
                            ))
                          ) : (
                            <Text style={s.helper}>
                              마지막 운동이에요. 세트가 끝나면 기록을 확인해요.
                            </Text>
                          )}
                        </View>
                        <Button
                          secondary
                          label="오늘은 여기까지"
                          onPress={() => setStopConfirm(true)}
                        />
                      </>
                    ) : (
                      <>
                        <View style={s.controlCard}>
                          <View style={s.between}>
                            <Text style={s.overline}>TODAY’S ROUTINE</Text>
                            <Text style={s.liveBadge}>
                              {items.every((x) => machines[x.machine].equipment === '머신')
                                ? '머신 중심'
                                : '맞춤 구성'}
                            </Text>
                          </View>
                          <Text style={s.controlTitle}>{routineNames[routine]}</Text>
                          <Text style={s.body}>
                            무엇을 할지 고민하지 않도록.{'\n'}기구·세트·휴식·이동을 함께 안내해요.
                          </Text>
                          <Button
                            secondary
                            label="루틴 고르기 · 지난 운동과 다음 일정 보기 →"
                            onPress={() => setTab('plan')}
                          />
                          <View style={s.summaryRow}>
                            <View>
                              <Text style={s.summaryNumber}>
                                40<Text style={s.summaryUnit}> 분 이내</Text>
                              </Text>
                              <Text style={s.small}>운동과 휴식 모두 포함</Text>
                            </View>
                            <View style={s.summaryDivider} />
                            <View>
                              <Text style={s.summaryNumber}>
                                {items.length}
                                <Text style={s.summaryUnit}> 운동</Text>
                              </Text>
                              <Text style={s.small}>내 방식으로 변경 가능</Text>
                            </View>
                          </View>
                          <View style={s.budget}>
                            <View style={s.between}>
                              <Text style={s.small}>예상 진행 시간</Text>
                              <Text style={s.budgetValue}>{formatTime(total)}</Text>
                            </View>
                            <View style={s.between}>
                              <Text style={s.small}>추가 휴식·정리 여유</Text>
                              <Text style={s.budgetValue}>
                                {formatTime(Math.max(0, 2400 - total))}
                              </Text>
                            </View>
                          </View>
                          {planError ? <Text style={s.limit}>{planError}</Text> : null}
                          <Button
                            disabled={w.busy || !!planError}
                            label={w.busy ? '준비 중…' : '체크인하고 시작  →'}
                            onPress={() => void w.start(routine, items)}
                          />
                          <Text style={s.helper}>
                            몸풀기를 마친 상태에서 시작해요.{'\n'}“시작하겠습니다” 안내 후 10초
                            여유를 드려요.
                          </Text>
                        </View>
                        <View style={s.card}>
                          <View style={s.between}>
                            <Text style={s.section}>오늘 한 번 방문해서 할 운동</Text>
                            <Pressable
                              accessibilityRole="button"
                              onPress={() => setEdit(true)}
                              style={s.linkButton}
                            >
                              <Text style={s.link}>교체·순서 수정 ↗</Text>
                            </Pressable>
                          </View>
                          {items.map((x, i) => (
                            <Pressable
                              accessibilityRole="button"
                              accessibilityLabel={`${machines[x.machine].name} 미리보기`}
                              key={x.machine}
                              onPress={() => setSelected(x.machine)}
                              style={[s.queueRow, selected === x.machine && s.selectedRow]}
                            >
                              <Text style={s.order}>{String(i + 1).padStart(2, '0')}</Text>
                              <View style={{ flex: 1 }}>
                                <Text style={s.rowTitle}>{machines[x.machine].name}</Text>
                                <Text style={s.small}>
                                  {x.sets}세트 · 휴식 {x.rest}초
                                </Text>
                              </View>
                              <Text style={s.small}>↗</Text>
                            </Pressable>
                          ))}
                        </View>
                        <Button
                          secondary
                          label="나만의 시작 운동 선택"
                          onPress={() => {
                            setDraft(data.preferences.starters);
                            setPersonal(true);
                          }}
                        />
                      </>
                    )}
                  </View>
                </View>
              </>
            )}
            {tab === 'plan' && (
              <RoutinePlanner
                preferences={data.preferences}
                history={data.history}
                routine={session?.routine ?? routine}
                today={items}
                session={session}
                onChoose={chooseRoutine}
                onGuide={setGuide}
                onToday={() => setTab('today')}
                onHistory={() => setTab('history')}
                onSource={() =>
                  openExternal(
                    'https://acsm.org/effective-resistance-training-program-infographic/',
                  )
                }
              />
            )}
            {tab === 'history' && (
              <>
                <View style={s.intro}>
                  <Text style={s.overline}>YOUR TRAINING JOURNAL</Text>
                  <Text style={s.title}>한 번의 방문도 기록으로.</Text>
                  <Text style={s.subtitle}>시간이 지난 세트와 실제 완료한 세트를 구분해요.</Text>
                </View>
                {data.history.length ? (
                  [...data.history].reverse().map((r) => (
                    <View key={r.id} style={s.record}>
                      <View style={s.between}>
                        <Text style={s.section}>{routineNames[r.routine]}</Text>
                        <Text style={s.liveBadge}>
                          {r.reason === 'stopped'
                            ? '중간 종료'
                            : r.reason === 'budget'
                              ? '40분 도달'
                              : '루틴 종료'}
                        </Text>
                      </View>
                      <Text style={s.controlTitle}>{formatTime(r.elapsed)}</Text>
                      <Text style={s.body}>
                        {new Date(r.endedAt).toLocaleString('ko-KR')} · 직접 완료 {r.confirmedSets}
                        세트
                      </Text>
                      <Text style={s.small}>
                        {r.performed.map((id) => machines[id].name).join(' · ') ||
                          '직접 완료 기록 없음'}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={s.card}>
                    <Text style={s.section}>첫 체크인을 기다리고 있어요.</Text>
                    <Text style={s.subtitle}>다음 방문에도 내 기기에서 이어갑니다.</Text>
                  </View>
                )}
              </>
            )}
            {tab === 'settings' && (
              <>
                <View style={s.intro}>
                  <Text style={s.overline}>BUILT AROUND YOU</Text>
                  <Text style={s.title}>내 운동 방식에 맞추세요.</Text>
                  <Text style={s.subtitle}>
                    기본 추천을 유지하면서 필요한 부분만 바꿀 수 있어요.
                  </Text>
                </View>
                <View style={s.card}>
                  <Text style={s.section}>난이도</Text>
                  <View style={s.chips}>
                    {(['beginner', 'intermediate', 'advanced'] as Level[]).map((level, i) => (
                      <Pressable
                        accessibilityRole="button"
                        disabled={!!session}
                        key={level}
                        style={[s.chip, data.preferences.level === level && s.chipSelected]}
                        onPress={() =>
                          w.setData((d) => ({ ...d, preferences: { ...d.preferences, level } }))
                        }
                      >
                        <Text>{['초보', '중수', '고급'][i]}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={s.helper}>
                    현재는 선호를 저장합니다. 단계별 훈련량 추천은 검수 후 적용하며, 휴식을 자동으로
                    줄이지 않아요.
                  </Text>
                  <Text style={[s.section, { marginTop: 22 }]}>분할 방식</Text>
                  <View style={s.chips}>
                    {(['full', 'upperLower', 'ppl', 'fixed'] as Split[]).map((split, i) => (
                      <Pressable
                        accessibilityRole="button"
                        disabled={!!session}
                        key={split}
                        style={[s.chip, data.preferences.split === split && s.chipSelected]}
                        onPress={() =>
                          w.setData((d) => ({
                            ...d,
                            preferences: { ...d.preferences, split, savedPlan: null },
                          }))
                        }
                      >
                        <Text>
                          {['전신', '상체 / 하체', '밀기 / 당기기 / 하체', '고정 루틴'][i]}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={s.helper}>
                    분할을 바꾸면 해당 방식의 기본 종목으로 재구성해요. 현재는 수행 기록이 있는 종료
                    루틴의 다음 순서를 제안합니다. 회복·피로 기반 개인화는 아직 개발 중이에요.
                  </Text>
                  <View style={s.line} />
                  <Text style={s.section}>Apple 건강</Text>
                  <Text style={s.liveBadge}>iPhone 연동 준비 중 · 현재 미연결</Text>
                  <Text style={s.helper}>
                    동의한 경우 완료한 근력 운동을 건강 앱에 저장하고, Apple Watch의 심박수를 함께
                    확인하는 기능을 준비합니다. 현재 웹에서는 건강 데이터를 읽거나 저장하지 않아요.
                    연동 없이도 FitIn을 사용할 수 있습니다.
                  </Text>
                  <View style={s.line} />
                  <View style={s.between}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.section}>음성 · 5초 비프 안내</Text>
                      <Text style={s.helper}>운동명과 세트 번호를 읽어줘요.</Text>
                    </View>
                    <Switch
                      accessibilityLabel="음성 및 비프 안내"
                      value={data.sound}
                      trackColor={{ true: '#E97860' }}
                      onValueChange={(sound) => w.setData((d) => ({ ...d, sound }))}
                    />
                  </View>
                  <View style={s.line} />
                  <Text style={s.section}>워치 · AirPods</Text>
                  <Text style={s.helper}>
                    워치는 다음 단계·30초 더·일시정지 중심으로 연결할 예정입니다. AirPods 버튼은
                    음악 앱과의 충돌을 확인해야 하며, 현재 연결 기능은 제공하지 않습니다.
                  </Text>
                  <Button
                    disabled={!!session}
                    secondary
                    label="추천 기본값으로 되돌리기"
                    onPress={() => {
                      w.setData((d) => ({
                        ...d,
                        preferences: { ...d.preferences, starters: [], savedPlan: null },
                      }));
                      setNotice('개인 운동 설정을 해제했어요. 기록은 유지됩니다.');
                    }}
                  />
                  {session && (
                    <Text style={s.helper}>진행 중인 운동이 끝난 뒤 설정을 바꿀 수 있어요.</Text>
                  )}
                </View>
              </>
            )}
            {tab === 'library' && <ExerciseLibrary onSelect={setGuide} />}
            {tab === 'harness' && __DEV__ && <Harness />}
          </>
        )}
        <Text style={s.footer}>LESS THINKING. MORE MOVING.</Text>
      </ScrollView>
      <Modal
        visible={edit || personal || guide !== null || stopConfirm}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setEdit(false);
          setPersonal(false);
          setGuide(null);
          setStopConfirm(false);
          setReplace(null);
        }}
      >
        <View style={s.backdrop}>
          <SafeAreaView style={s.modal}>
            <View style={s.modalHeader}>
              <Text style={s.section}>
                {stopConfirm
                  ? '오늘은 여기까지 할까요?'
                  : guide
                    ? machines[guide].name
                    : personal
                      ? '나만의 시작 운동'
                      : '내 루틴 수정'}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="닫기"
                onPress={() => {
                  setEdit(false);
                  setPersonal(false);
                  setGuide(null);
                  setStopConfirm(false);
                  setReplace(null);
                }}
                style={s.close}
              >
                <Text style={{ fontSize: 24 }}>×</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={s.modalContent}>
              {stopConfirm ? (
                <>
                  <Text style={s.body}>현재까지의 시간과 직접 완료한 세트를 저장합니다.</Text>
                  <Button
                    label="중간 종료하고 기록"
                    onPress={() => {
                      w.stop();
                      setStopConfirm(false);
                      setTab('history');
                    }}
                  />
                </>
              ) : guide ? (
                <>
                  <ExerciseVisual machine={guide} />
                  <Text style={s.section}>주요 자극 · {machines[guide].area}</Text>
                  <Text style={s.cue}>{machines[guide].setup}</Text>
                  <Text style={s.body}>{machines[guide].cue}</Text>
                  <Text style={s.section}>영상으로 동작 확인</Text>
                  {exerciseVideos[guide] && (
                    <>
                      <Button
                        secondary
                        label={`▶ ${exerciseVideos[guide]!.title} 보기`}
                        onPress={() => openExternal(exerciseVideos[guide]!.url)}
                      />
                      <Text style={s.helper}>
                        {exerciseVideos[guide]!.source} · 외부 참고 영상 · 기구 모델이 다를 수
                        있어요
                      </Text>
                    </>
                  )}
                  <Button
                    secondary
                    label="YouTube에서 한국어 자세·쇼츠 검색 ↗"
                    onPress={() => openExternal(videoSearch(guide))}
                  />
                  <Text style={s.helper}>
                    인터넷 연결이 필요해요. 영상으로 나가면 진행 중인 운동은 일시정지하며 돌아와서
                    직접 재개합니다. 검색 결과는 FitIn이 검수한 영상 목록이 아닙니다.
                  </Text>
                  <Text style={s.helper}>
                    개발용 생성 이미지입니다. 정확한 자세와 기구 설정은 직원에게 확인하세요. 통증이
                    있으면 멈춰주세요.
                  </Text>
                </>
              ) : personal ? (
                <>
                  <Text style={s.body}>
                    시작하고 싶은 운동을 최대 3개 선택하세요. 선택 순서대로 앞에 배치하고 기존
                    운동을 대체합니다. 기본 서비스는 머신 중심으로 유지돼요.
                  </Text>
                  <View style={s.chips}>
                    {(Object.keys(machines) as MachineId[]).map((id) => (
                      <Pressable
                        accessibilityRole="button"
                        key={id}
                        style={[s.chip, draft.includes(id) && s.chipSelected]}
                        onPress={() =>
                          setDraft((current) =>
                            current.includes(id)
                              ? current.filter((x) => x !== id)
                              : current.length < 3
                                ? [...current, id]
                                : current,
                          )
                        }
                      >
                        <Text>
                          {draft.includes(id) ? `${draft.indexOf(id) + 1}. ` : ''}
                          {machines[id].name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={s.helper}>
                    기본 루틴에서 다시 구성합니다. 같은 동작 패턴을 우선 대체하지만, 없으면 다른
                    운동이 대체될 수 있어요. 적용 후 부위와 시간을 확인해주세요.
                  </Text>
                  <Button label="40분 안에 재구성하고 저장" onPress={applyPersonal} />
                </>
              ) : (
                <>
                  <Text style={s.body}>
                    운동·순서·세트·휴식을 바꿔보세요. 휴식을 몰래 줄이지 않고 전체 시간을 바로
                    계산해요.
                  </Text>
                  {items.map((x, i) => (
                    <View key={x.machine} style={s.editRow}>
                      <View style={s.between}>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => setReplace(replace === i ? null : i)}
                          style={s.linkButton}
                        >
                          <Text style={s.rowTitle}>
                            {i + 1}. {machines[x.machine].name} ⇄
                          </Text>
                        </Pressable>
                        <View style={s.actionRow}>
                          <Pressable
                            disabled={i === 0}
                            accessibilityRole="button"
                            accessibilityLabel={`${machines[x.machine].name} 위로`}
                            style={s.miniButton}
                            onPress={() => reorder(i, -1)}
                          >
                            <Text>↑</Text>
                          </Pressable>
                          <Pressable
                            disabled={i === items.length - 1}
                            accessibilityRole="button"
                            accessibilityLabel={`${machines[x.machine].name} 아래로`}
                            style={s.miniButton}
                            onPress={() => reorder(i, 1)}
                          >
                            <Text>↓</Text>
                          </Pressable>
                        </View>
                      </View>
                      {replace === i && (
                        <View style={s.chips}>
                          {(Object.keys(machines) as MachineId[])
                            .filter((id) => !items.some((x) => x.machine === id))
                            .map((id) => (
                              <Pressable
                                accessibilityRole="button"
                                style={s.chip}
                                key={id}
                                onPress={() => {
                                  setItems((current) =>
                                    current.map((p, j) => (j === i ? { ...p, machine: id } : p)),
                                  );
                                  setReplace(null);
                                }}
                              >
                                <Text>{machines[id].name}</Text>
                              </Pressable>
                            ))}
                        </View>
                      )}
                      <View style={s.between}>
                        <Text style={s.small}>{x.sets}세트</Text>
                        <View style={s.actionRow}>
                          <Button secondary label="세트 −" onPress={() => change(i, 'sets', -1)} />
                          <Button secondary label="세트 +" onPress={() => change(i, 'sets', 1)} />
                        </View>
                      </View>
                      <View style={s.between}>
                        <Text style={s.small}>휴식 {x.rest}초</Text>
                        <View style={s.actionRow}>
                          <Button
                            secondary
                            label="휴식 −15"
                            onPress={() => change(i, 'rest', -15)}
                          />
                          <Button
                            secondary
                            label="휴식 +15"
                            onPress={() => change(i, 'rest', 15)}
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                  <Text style={s.section}>예상 {formatTime(total)} / 40:00</Text>
                  <Text style={s.helper}>
                    변경한 부위: {items.map((x) => machines[x.machine].area).join(' · ')}
                  </Text>
                  {planError ? <Text style={s.limit}>{planError}</Text> : null}
                  <Button
                    disabled={!!planError}
                    label="오늘만 적용"
                    onPress={() => {
                      setEdit(false);
                      setSelected(items[0].machine);
                    }}
                  />
                  <Button
                    disabled={!!planError}
                    secondary
                    label="매번 반복하는 고정 루틴으로 저장"
                    onPress={savePlan}
                  />
                </>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <FitIn />
    </SafeAreaProvider>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F6F5' },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 35,
    maxWidth: 650,
    width: '100%',
    alignSelf: 'center',
  },
  desktop: { maxWidth: 1220, paddingHorizontal: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 21,
  },
  logo: { fontSize: 37, fontWeight: '900', letterSpacing: -2.8, color: '#19353B' },
  headerRight: { flexDirection: 'row', gap: 7, alignItems: 'center' },
  small: { fontSize: 11, color: '#74868A', lineHeight: 18 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#719987' },
  buildTag: {
    fontSize: 9,
    color: '#81918E',
    backgroundColor: '#E7EDE9',
    padding: 6,
    borderRadius: 6,
    marginLeft: 6,
  },
  nav: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    borderBottomWidth: 1,
    borderColor: '#DEE6E3',
  },
  tab: { paddingVertical: 15 },
  activeTab: { borderBottomWidth: 2, borderColor: '#244348' },
  tabText: { color: '#8A9999', fontWeight: '600', fontSize: 13 },
  intro: { paddingTop: 28, paddingBottom: 25 },
  overline: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.9,
    color: '#7F9292',
    marginBottom: 8,
  },
  title: { fontSize: 30, lineHeight: 42, fontWeight: '800', letterSpacing: -1.4, color: '#17343A' },
  subtitle: { fontSize: 13, lineHeight: 23, color: '#7B8C8D', marginTop: 8 },
  columns: { flexDirection: 'row', gap: 28, alignItems: 'flex-start' },
  stacked: { gap: 20 },
  mainColumn: { flex: 1.25 },
  sideColumn: { flex: 1, gap: 16 },
  visualCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E7ECEA',
  },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  tag: {
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#879893',
    backgroundColor: '#F0F4F0',
    borderRadius: 5,
    padding: 6,
  },
  muscleLegend: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  coralDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EB806D' },
  muscleText: { fontSize: 16, fontWeight: '700', color: '#31454B' },
  support: { fontSize: 11, color: '#8A9898', marginTop: 8, marginLeft: 16 },
  line: { height: 1, backgroundColor: '#E9EDEC', marginVertical: 18 },
  coachingLabel: { fontSize: 10, color: '#96A4A1', marginBottom: 8 },
  cue: { fontSize: 17, lineHeight: 28, color: '#334B50', fontWeight: '600' },
  linkButton: { paddingVertical: 12, minHeight: 44, justifyContent: 'center' },
  link: { fontSize: 12, fontWeight: '600', color: '#688E81' },
  assetNote: { fontSize: 9, lineHeight: 15, color: '#A2ADAA' },
  controlCard: { padding: 25, borderRadius: 23, backgroundColor: '#E7EFEB', gap: 4 },
  liveBadge: {
    fontSize: 10,
    color: '#648779',
    backgroundColor: '#D9E7DF',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 6,
  },
  controlTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 34,
    color: '#24444A',
    marginVertical: 10,
    letterSpacing: -0.6,
  },
  body: { fontSize: 13, lineHeight: 23, color: '#728589' },
  clockRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 14,
    marginTop: 10,
    marginBottom: 14,
  },
  phaseClock: {
    fontSize: 37,
    fontWeight: '600',
    color: '#2C5557',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 4,
    borderRadius: 4,
    backgroundColor: '#CEDFD5',
    overflow: 'hidden',
    marginBottom: 10,
  },
  fill: { height: 4, backgroundColor: '#769D88' },
  button: {
    backgroundColor: '#E57860',
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 16,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  secondary: { backgroundColor: '#F5F8F5', borderWidth: 1, borderColor: '#DEE8E1' },
  buttonLabel: { fontSize: 13, fontWeight: '700', color: 'white' },
  actionRow: { flexDirection: 'row', gap: 8 },
  helper: { fontSize: 11, lineHeight: 19, color: '#81948F', marginTop: 10 },
  limit: { fontSize: 12, lineHeight: 20, color: '#A26649', marginVertical: 10 },
  card: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#E3EAE6',
    marginVertical: 8,
  },
  section: { fontSize: 16, fontWeight: '700', color: '#2A464B', lineHeight: 25 },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#EEF1EF',
  },
  selectedRow: { backgroundColor: '#F3F7F4', borderRadius: 9, paddingHorizontal: 8 },
  rowTitle: { fontSize: 13, fontWeight: '600', color: '#3C5358', lineHeight: 21 },
  order: { fontSize: 10, color: '#9AABA3' },
  miniButton: {
    minWidth: 40,
    minHeight: 44,
    padding: 10,
    borderRadius: 9,
    backgroundColor: '#F2F6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: { flexDirection: 'row', gap: 26, alignItems: 'center', marginVertical: 22 },
  summaryNumber: { fontSize: 37, fontWeight: '600', color: '#285253', letterSpacing: -1 },
  summaryUnit: { fontSize: 12, color: '#6D8B81' },
  summaryDivider: { height: 40, width: 1, backgroundColor: '#CDDCD4' },
  budget: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D1DFD7',
    paddingVertical: 13,
    gap: 7,
    marginBottom: 14,
  },
  budgetValue: { fontSize: 12, fontWeight: '600', color: '#628174', fontVariant: ['tabular-nums'] },
  notice: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#E7EFDF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  warning: { backgroundColor: '#F7E8DE', padding: 16, borderRadius: 13, marginTop: 15 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  record: { padding: 24, borderRadius: 18, backgroundColor: 'white', marginBottom: 14, gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip: {
    paddingVertical: 12,
    paddingHorizontal: 13,
    borderRadius: 10,
    backgroundColor: '#F2F5F3',
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#E4EBE6',
  },
  chipSelected: { borderColor: '#8BAF9B', backgroundColor: '#DEEBE1' },
  footer: { fontSize: 9, letterSpacing: 2, color: '#ABB6B0', textAlign: 'center', marginTop: 38 },
  backdrop: { flex: 1, backgroundColor: '#19373C66', justifyContent: 'center', padding: 16 },
  modal: {
    backgroundColor: '#FAFCFA',
    borderRadius: 24,
    maxWidth: 680,
    width: '100%',
    maxHeight: '92%',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#E2EAE5',
  },
  modalContent: { padding: 22, gap: 12 },
  editRow: { paddingVertical: 15, borderBottomWidth: 1, borderColor: '#DFE8E1' },
});
