import { t, localeTag } from '../i18n';
import React from 'react';
import { Pressable, Text, View } from 'react-native';












import { formatTime, machines, routineNames } from '../workout';
import { s } from '../ui/styles';
import { Button } from '../ui/Button';
import { useWorkoutUI } from '../ui/WorkoutContext';

export function HistoryScreen(){ const { data, setRemoving, routine } = useWorkoutUI(); return (<>
                <View style={s.intro}>
                  <Text style={s.overline}>YOUR TRAINING JOURNAL</Text>
                  <Text style={s.title}>{t('한 번의 방문도 기록으로.')}</Text>
                  <Text style={s.subtitle}>
                    {t('시간이 지난 세트와 실제 완료한 세트를 구분해요.')}
                  </Text>
                </View>
                {data.history.length ? (
                  [...data.history].reverse().map((r) => (
                    <View key={r.id} style={s.record}>
                      <View style={s.between}>
                        <Text style={s.section}>{routineNames[r.routine]}</Text>
                        <Text style={s.liveBadge}>
                          {r.reason === 'stopped'
                            ? t('중간 종료')
                            : r.reason === 'budget'
                              ? t('40분 도달')
                              : t('루틴 종료')}
                        </Text>
                      </View>
                      <Text style={s.controlTitle}>{formatTime(r.elapsed)}</Text>
                      <Text style={s.body}>
                        {t(
                          '{0} · 직접 완료 {1} 세트',
                          new Date(r.endedAt).toLocaleString(localeTag()),
                          r.confirmedSets,
                        )}
                      </Text>
                      <Text style={s.small}>
                        {r.performed.map((id) => machines[id].name).join(' · ') ||
                          t('직접 완료 기록 없음')}
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t(
                          '{0} {1} 기록 삭제',
                          routineNames[r.routine],
                          new Date(r.endedAt).toLocaleDateString(localeTag()),
                        )}
                        onPress={() =>
                          setRemoving({
                            id: r.id,
                            label: `${new Date(r.endedAt).toLocaleString(localeTag())} · ${routineNames[r.routine]}`,
                          })
                        }
                        style={s.linkButton}
                      >
                        <Text style={s.link}>{t('이 기록 삭제')}</Text>
                      </Pressable>
                    </View>
                  ))
                ) : (
                  <View style={s.card}>
                    <Text style={s.section}>{t('첫 체크인을 기다리고 있어요.')}</Text>
                    <Text style={s.subtitle}>{t('다음 방문에도 내 기기에서 이어갑니다.')}</Text>
                  </View>
                )}
                {data.history.length ? (
                  <View style={s.card}>
                    <Text style={s.section}>{t('기록 정리')}</Text>
                    <Text style={s.helper}>
                      {t(
                        '기록은 이 기기에만 있어서 지우면 되돌릴 수 없어요. 다음 운동 순서는 남은 기록으로 다시 계산하므로 순서가 앞으로 돌아갈 수 있습니다. 저장한 내 루틴과 진행 중인 운동은 지워지지 않아요.',
                      )}
                    </Text>
                    <Button
                      secondary
                      label={t('기록 {0}개 전체 삭제', data.history.length)}
                      onPress={() => setRemoving('all')}
                    />
                  </View>
                ) : null}
              </>); }

