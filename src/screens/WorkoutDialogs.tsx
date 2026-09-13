import { t } from '../i18n';
import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import { ExerciseVisual } from '../ExerciseVisual';





import { exerciseVideos, videoSearch } from '../videos';


import { formatTime, MachineId, machines, MAX_ITEMS, REST_STEP, WORK_STEP, removeRecords, clearHistory } from '../workout';
import { s } from '../ui/styles';
import { Button } from '../ui/Button';
import { useWorkoutUI } from '../ui/WorkoutContext';

export function WorkoutDialogs(){ const { w, data, p, setTab, items, setItems, edit, setEdit, personal, setPersonal, draft, setDraft, replace, setReplace, append, setAppend, appendRepeat, setAppendRepeat, guide, setGuide, stopConfirm, setStopConfirm, removing, setRemoving, setNotice, setSelected, machine, planError, total, parts, reorder, change, addToday, savePlan, openExternal, applyPersonal } = useWorkoutUI(); return (<Modal
        visible={edit || personal || guide !== null || stopConfirm || removing !== null}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setEdit(false);
          setPersonal(false);
          setGuide(null);
          setStopConfirm(false);
          setReplace(null);
          setAppend(false);
          setRemoving(null);
        }}
      >
        <View style={s.backdrop}>
          <SafeAreaView style={s.modal}>
            <View style={s.modalHeader}>
              <Text style={s.section}>
                {removing
                  ? removing === 'all'
                    ? t('기록을 전부 지울까요?')
                    : t('이 기록을 지울까요?')
                  : stopConfirm
                    ? t('오늘은 여기까지 할까요?')
                    : guide
                      ? machines[guide].name
                      : personal
                        ? t('나만의 시작 운동')
                        : t('오늘의 운동 수정')}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('닫기')}
                onPress={() => {
                  setEdit(false);
                  setPersonal(false);
                  setGuide(null);
                  setStopConfirm(false);
                  setReplace(null);
                  setAppend(false);
                  setRemoving(null);
                }}
                style={s.close}
              >
                <Text style={{ fontSize: 24 }}>×</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={s.modalContent}>
              {removing ? (
                <>
                  <Text style={s.body}>
                    {removing === 'all'
                      ? t('운동 기록 {0}개를 이 기기에서 지웁니다.', data.history.length)
                      : t('{0} 기록을 이 기기에서 지웁니다.', removing.label)}
                  </Text>
                  <Text style={s.helper}>
                    {t(
                      '되돌릴 수 없어요. 다음 운동 순서는 남은 기록으로 다시 계산합니다. 저장한 내 루틴과 진행 중인 운동은 그대로 남습니다.',
                    )}
                  </Text>
                  <Button
                    label={removing === 'all' ? t('전부 삭제') : t('삭제')}
                    onPress={() => {
                      const target = removing;
                      w.setData((d) =>
                        target === 'all' ? clearHistory(d) : removeRecords(d, [target.id]),
                      );
                      setRemoving(null);
                      setNotice(
                        target === 'all'
                          ? t('운동 기록을 모두 지웠어요.')
                          : t('선택한 기록을 지웠어요.'),
                      );
                    }}
                  />
                  <Button secondary label={t('취소')} onPress={() => setRemoving(null)} />
                </>
              ) : stopConfirm ? (
                <>
                  <Text style={s.body}>
                    {t('현재까지의 시간과 직접 완료한 세트를 저장합니다.')}
                  </Text>
                  <Button
                    label={t('중간 종료하고 기록')}
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
                  <Text style={s.section}>{t('주요 자극 · {0}', machines[guide].area)}</Text>
                  <Text style={s.cue}>{machines[guide].setup}</Text>
                  <Text style={s.body}>{machines[guide].cue}</Text>
                  <Text style={s.section}>{t('영상으로 동작 확인')}</Text>
                  {exerciseVideos[guide] && (
                    <>
                      <Button
                        secondary
                        label={t('▶ {0} 보기', exerciseVideos[guide]!.title)}
                        onPress={() => openExternal(exerciseVideos[guide]!.url)}
                      />
                      <Text style={s.helper}>
                        {t(
                          '{0} · 외부 참고 영상 · 기구 모델이 다를 수 있어요',
                          exerciseVideos[guide]!.source,
                        )}
                      </Text>
                    </>
                  )}
                  <Button
                    secondary
                    label={t('YouTube에서 한국어 자세·쇼츠 검색 ↗')}
                    onPress={() => openExternal(videoSearch(guide))}
                  />
                  <Text style={s.helper}>
                    {t(
                      '인터넷 연결이 필요해요. 영상으로 나가면 진행 중인 운동은 일시정지하며 돌아와서 직접 재개합니다. 검색 결과는 FitIn이 검수한 영상 목록이 아닙니다.',
                    )}
                  </Text>
                  <Text style={s.helper}>
                    {t(
                      '기구 설정이 어렵다면 직원에게 도움을 요청하세요. 통증이 있으면 멈춰주세요.',
                    )}
                  </Text>
                </>
              ) : personal ? (
                <>
                  <Text style={s.body}>
                    {t(
                      '시작하고 싶은 운동을 최대 3개 선택하세요. 선택 순서대로 앞에 배치하고 기존 운동을 대체합니다. 기본 서비스는 머신 중심으로 유지돼요.',
                    )}
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
                    {t(
                      '기본 루틴에서 다시 구성합니다. 같은 동작 패턴을 우선 대체하지만, 없으면 다른 운동이 대체될 수 있어요. 적용 후 부위와 시간을 확인해주세요.',
                    )}
                  </Text>
                  <Button label={t('시작 운동 재구성하고 저장')} onPress={applyPersonal} />
                </>
              ) : (
                <>
                  <Text style={s.body}>
                    {t(
                      '오늘 한 번만 바꾸는 화면이에요. 여기서 바꾼 건 내 기본 루틴을 건드리지 않습니다. 휴식을 몰래 줄이지 않고 전체 시간을 바로 계산해요.',
                    )}
                  </Text>
                  {items.map((x, i) => (
                    <View key={`${i}:${x.machine}`} style={s.editRow}>
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
                            accessibilityLabel={t('{0} 위로', machines[x.machine].name)}
                            style={s.miniButton}
                            onPress={() => reorder(i, -1)}
                          >
                            <Text>↑</Text>
                          </Pressable>
                          <Pressable
                            disabled={i === items.length - 1}
                            accessibilityRole="button"
                            accessibilityLabel={t('{0} 아래로', machines[x.machine].name)}
                            style={s.miniButton}
                            onPress={() => reorder(i, 1)}
                          >
                            <Text>↓</Text>
                          </Pressable>
                          <Pressable
                            disabled={items.length <= 1}
                            accessibilityRole="button"
                            accessibilityLabel={t('{0} 오늘은 빼기', machines[x.machine].name)}
                            style={s.miniButton}
                            onPress={() => setItems((c) => c.filter((_, j) => j !== i))}
                          >
                            <Text>−</Text>
                          </Pressable>
                        </View>
                      </View>
                      {replace === i && (
                        <View style={s.chips}>
                          {(Object.keys(machines) as MachineId[])
                            .filter((id) => !items.some((y) => y.machine === id))
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
                        <Text style={s.small}>{t('{0}세트', x.sets)}</Text>
                        <View style={s.actionRow}>
                          <Button
                            secondary
                            label={t('세트 −')}
                            onPress={() => change(i, 'sets', -1)}
                          />
                          <Button
                            secondary
                            label={t('세트 +')}
                            onPress={() => change(i, 'sets', 1)}
                          />
                        </View>
                      </View>
                      <View style={s.between}>
                        <Text style={s.small}>{t('세트당 운동 {0}초', x.work)}</Text>
                        <View style={s.actionRow}>
                          <Button
                            secondary
                            label={t('운동 −{0}', WORK_STEP)}
                            onPress={() => change(i, 'work', -WORK_STEP)}
                          />
                          <Button
                            secondary
                            label={t('운동 +{0}', WORK_STEP)}
                            onPress={() => change(i, 'work', WORK_STEP)}
                          />
                        </View>
                      </View>
                      <View style={s.between}>
                        <Text style={s.small}>{t('휴식 {0}초', x.rest)}</Text>
                        <View style={s.actionRow}>
                          <Button
                            secondary
                            label={t('휴식 −{0}', REST_STEP)}
                            onPress={() => change(i, 'rest', -REST_STEP)}
                          />
                          <Button
                            secondary
                            label={t('휴식 +{0}', REST_STEP)}
                            onPress={() => change(i, 'rest', REST_STEP)}
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                  <Button
                    secondary
                    disabled={items.length >= MAX_ITEMS}
                    label={append ? t('운동 추가 닫기') : t('+ 오늘만 운동 추가')}
                    onPress={() => setAppend(!append)}
                  />
                  {append && (
                    <>
                      <Pressable
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: appendRepeat }}
                        accessibilityLabel={t('이미 넣은 운동도 다시 추가')}
                        onPress={() => setAppendRepeat(!appendRepeat)}
                        style={s.check}
                      >
                        <View style={[s.box, appendRepeat && s.boxOn]}>
                          <Text style={s.tick}>{appendRepeat ? '✓' : ' '}</Text>
                        </View>
                        <Text style={s.rowTitle}>{t('이미 넣은 운동도 다시 추가')}</Text>
                      </Pressable>
                      <Text style={s.helper}>
                        {appendRepeat
                          ? t('같은 운동을 한 번 더 넣습니다. 세트 기록은 각각 따로 남아요.')
                          : t('맨 뒤에 추가한 뒤 ↑로 원하는 자리에 올리세요.')}
                      </Text>
                      <View style={s.chips}>
                        {(Object.keys(machines) as MachineId[])
                          .filter((id) => appendRepeat || !items.some((x) => x.machine === id))
                          .map((id) => (
                            <Pressable
                              accessibilityRole="button"
                              style={s.chip}
                              key={id}
                              onPress={() => addToday(id)}
                            >
                              <Text>{machines[id].name}</Text>
                            </Pressable>
                          ))}
                      </View>
                    </>
                  )}
                  <Text style={s.section}>
                    {t(
                      '운동 {0} · 휴식 {1} · 이동·준비{2} {3}',
                      formatTime(parts.work),
                      formatTime(parts.rest),
                      ' ',
                      formatTime(parts.move + parts.setup),
                    )}
                  </Text>
                  <Text style={s.section}>
                    {t('전체 예상 {0} · 시간 제한 없음', formatTime(total))}
                  </Text>

                  <Text style={s.helper}>
                    {t('변경한 부위: {0}', items.map((x) => machines[x.machine].area).join(' · '))}
                  </Text>
                  {planError ? <Text style={s.limit}>{planError}</Text> : null}
                  <Button
                    disabled={!!planError}
                    label={t('오늘만 적용')}
                    onPress={() => {
                      setEdit(false);
                      setAppend(false);
                      setSelected(items[0].machine);
                    }}
                  />
                  <Button
                    disabled={!!planError}
                    secondary
                    label={t('내 기본 루틴에도 저장')}
                    onPress={savePlan}
                  />
                  <Text style={s.helper}>
                    {t(
                      '기본 루틴에 저장하면 다음 방문부터 계속 이 구성으로 시작해요. 세트당 시간과 전체 휴식은 내 루틴 탭에서 더 자세히 조절할 수 있습니다.',
                    )}
                  </Text>
                </>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>); }

