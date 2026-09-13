import { t } from '../i18n';
import React from 'react';
import { Pressable, Text, View } from 'react-native';












import { formatTime, machines, routineNames } from '../workout';
import { s } from '../ui/styles';
import { Button } from '../ui/Button';
import { useWorkoutUI } from '../ui/WorkoutContext';

export function TodayScreen(){ const { w, data, p, setTab, items, setEdit, setPersonal, setDraft, setStopConfirm, width, fontScale, wide, session, routine, selected, setSelected, machine, m, planError, total, parts, sessionDuration, remaining, upcoming, reorder, visual } = useWorkoutUI(); return (<>
                <View style={s.intro}>
                  <Text
                    testID="session-heading"
                    style={[s.title, session && { minHeight: 84 * fontScale }]}
                  >
                    {session
                      ? p?.phase?.kind === 'rest'
                        ? t('다음 세트를 준비해요.')
                        : p?.phase?.kind === 'move'
                          ? t('다음 기구로 이동해요.')
                          : p?.phase?.kind === 'prepare'
                            ? t('자세를 잡아주세요.')
                            : m.name
                      : t('운동에만 집중하세요.')}
                  </Text>
                </View>
                <View style={wide ? s.columns : s.stacked}>
                  <View style={wide ? s.mainColumn : undefined}>
                    {!session && (
                      <View style={s.between}>
                        <Text style={s.section}>{m.name}</Text>
                      </View>
                    )}
                    {visual}
                  </View>
                  <View style={wide ? s.sideColumn : undefined}>
                    {session && p ? (
                      <>
                        <View testID="session-controls" style={s.controlCard}>
                          <View style={s.between}>
                            <Text style={s.overline}>
                              {session.paused ? 'PAUSED' : 'GUIDED SESSION'}
                            </Text>
                            <Text
                              style={[
                                s.liveBadge,
                                { minHeight: 40 * fontScale, lineHeight: 14, flexShrink: 1 },
                              ]}
                            >
                              {p.phase?.kind === 'work'
                                ? t('{0} / {1}세트', p.phase.set, p.phase.sets)
                                : p.phase?.kind === 'rest'
                                  ? t('휴식')
                                  : p.phase?.kind === 'move'
                                    ? t('정리 · 이동')
                                    : t('10초 준비')}
                            </Text>
                          </View>
                          <Text style={s.controlTitle}>{m.name}</Text>
                          <View style={s.clockRow}>
                            <Text style={s.phaseClock}>{formatTime(p.remaining)}</Text>
                            <Text style={[s.small, { flex: 1, minHeight: 36 * fontScale }]}>
                              {p.phase?.kind === 'work'
                                ? t('이번 세트 남은 시간')
                                : p.phase?.kind === 'rest'
                                  ? t('휴식 남은 시간')
                                  : t('시작까지')}
                            </Text>
                          </View>
                          <View style={s.track}>
                            <View
                              style={[
                                s.fill,
                                { width: `${(p.elapsed / Math.max(1, sessionDuration)) * 100}%` },
                              ]}
                            />
                          </View>
                          <View style={s.between}>
                            <Text style={s.small}>{t('전체 {0}', formatTime(p.elapsed))}</Text>
                            <Text style={s.small}>{t('예상 남음 {0}', formatTime(remaining))}</Text>
                          </View>
                          <View style={{ marginTop: 22 }}>
                            <Button
                              stableLabel
                              disabled={session.paused || p.phase?.kind === 'prepare'}
                              label={
                                p.phase?.kind === 'work'
                                  ? t('✓  세트 완료 · 다음 단계')
                                  : p.phase?.kind === 'rest'
                                    ? t('▶  준비됐어요 · 다음 세트')
                                    : p.phase?.kind === 'move'
                                      ? t('▶  준비 완료 · 운동 시작')
                                      : t('10초 후 자동으로 시작')
                              }
                              onPress={() => w.command('next')}
                            />
                            <View style={s.actionRow}>
                              <View style={{ flex: 1 }}>
                                <Button
                                  stableLabel
                                  secondary
                                  disabled={
                                    session.paused ||
                                    p.phase?.kind === 'prepare' ||
                                    remaining <= p.remaining
                                  }
                                  label={t('+30초 더')}
                                  onPress={() => w.command('extend')}
                                />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Button
                                  stableLabel
                                  secondary
                                  label={session.paused ? t('▶ 재개') : t('Ⅱ 일시정지')}
                                  onPress={() => w.command(session.paused ? 'resume' : 'pause')}
                                />
                              </View>
                            </View>
                          </View>
                          <Text style={s.helper}>
                            {t(
                              '자동으로 이어지지만 준비되면 바로 넘어갈 수 있어요. 완료 버튼을 누른 세트만 수행으로 기록합니다.',
                            )}
                          </Text>
                        </View>
                        <View style={s.card}>
                          <Text style={s.section}>{t('다음 순서')}</Text>
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
                                    accessibilityLabel={t(
                                      '{0} 다음 기구와 순서 교체',
                                      machines[x.machine].name,
                                    )}
                                    onPress={() => w.reorder(x.machine, upcoming[i + 1].machine)}
                                    style={s.miniButton}
                                  >
                                    <Text style={s.small}>{t('⇅ 교체')}</Text>
                                  </Pressable>
                                )}
                              </View>
                            ))
                          ) : (
                            <Text style={s.helper}>
                              {t('마지막 운동이에요. 세트가 끝나면 기록을 확인해요.')}
                            </Text>
                          )}
                        </View>
                        <Button
                          secondary
                          label={t('오늘은 여기까지')}
                          onPress={() => setStopConfirm(true)}
                        />
                      </>
                    ) : (
                      <>
                        <View style={s.controlCard}>
                          <View style={s.between}>
                            <Text style={s.overline}>TODAY’S ROUTINE</Text>
                            <Text style={s.liveBadge}>
                              {items.every((x) => machines[x.machine].equipment === t('머신'))
                                ? t('머신 중심')
                                : t('맞춤 구성')}
                            </Text>
                          </View>
                          <Text style={s.controlTitle}>{routineNames[routine]}</Text>
                          <Text style={s.body}>
                            {t(
                              '무엇을 할지 고민하지 않도록.{0}기구·세트·휴식·이동을 함께 안내해요.',
                              '\n',
                            )}
                          </Text>
                          <Button
                            secondary
                            label={t('루틴 고르기 · 지난 운동과 다음 일정 보기 →')}
                            onPress={() => setTab('plan')}
                          />
                          <View style={s.summaryRow}>
                            <View>
                              <Text style={s.summaryNumber}>
                                {Math.round(parts.work / 60)}
                                <Text style={s.summaryUnit}>{t('분 운동 구간')}</Text>
                              </Text>
                              <Text style={s.small}>{t('휴식·이동 제외한 계획 시간')}</Text>
                            </View>
                            <View style={s.summaryDivider} />
                            <View>
                              <Text style={s.summaryNumber}>
                                {items.length}
                                <Text style={s.summaryUnit}>{t('운동')}</Text>
                              </Text>
                              <Text style={s.small}>{t('내 방식으로 변경 가능')}</Text>
                            </View>
                          </View>
                          <View style={s.budget}>
                            <View style={s.between}>
                              <Text style={s.small}>{t('운동 시간')}</Text>
                              <Text style={s.budgetValue}>{formatTime(parts.work)}</Text>
                            </View>
                            <View style={s.between}>
                              <Text style={s.small}>{t('휴식 시간')}</Text>
                              <Text style={s.budgetValue}>{formatTime(parts.rest)}</Text>
                            </View>
                            <View style={s.between}>
                              <Text style={s.small}>{t('기구 이동·준비')}</Text>
                              <Text style={s.budgetValue}>
                                {formatTime(parts.move + parts.setup)}
                              </Text>
                            </View>
                            <View style={s.between}>
                              <Text style={s.small}>{t('합계')}</Text>
                              <Text style={s.budgetValue}>{formatTime(total)}</Text>
                            </View>
                            <View style={s.between}>
                              <Text style={s.small}>{t('운동 구간 목표 25분')}</Text>
                              <Text style={s.budgetValue}>
                                {parts.work >= 1500
                                  ? t('목표 충족')
                                  : formatTime(1500 - parts.work) + t(' 부족')}
                              </Text>
                            </View>
                          </View>
                          {planError ? <Text style={s.limit}>{planError}</Text> : null}
                          <Button
                            disabled={w.busy || !!planError}
                            label={w.busy ? t('준비 중…') : t('체크인하고 전체 루틴 시작 →')}
                            onPress={() => void w.start(routine, items)}
                          />

                          <Text style={s.helper}>
                            {t(
                              '몸풀기를 마친 상태에서 시작해요.{0}“시작하겠습니다” 안내 후 10초 여유를 드려요.',
                              '\n',
                            )}
                          </Text>
                        </View>
                        <View style={s.card}>
                          <View style={s.between}>
                            <Text style={s.section}>{t('오늘 한 번 방문해서 할 운동')}</Text>
                            <Pressable
                              accessibilityRole="button"
                              onPress={() => setEdit(true)}
                              style={s.linkButton}
                            >
                              <Text style={s.link}>{t('교체·순서 수정 ↗')}</Text>
                            </Pressable>
                          </View>
                          {items.map((x, i) => (
                            <Pressable
                              accessibilityRole="button"
                              accessibilityLabel={t('{0} 미리보기', machines[x.machine].name)}
                              key={`${i}:${x.machine}`}
                              onPress={() => setSelected(x.machine)}
                              style={[s.queueRow, selected === x.machine && s.selectedRow]}
                            >
                              <Text style={s.order}>{String(i + 1).padStart(2, '0')}</Text>
                              <View style={{ flex: 1 }}>
                                <Text style={s.rowTitle}>{machines[x.machine].name}</Text>
                                <Text style={s.small}>
                                  {t('{0}세트 · 세트당 {1}초 · 휴식 {2}초', x.sets, x.work, x.rest)}
                                </Text>
                              </View>
                              <Text style={s.small}>↗</Text>
                            </Pressable>
                          ))}
                        </View>
                        <Button
                          secondary
                          label={t('나만의 시작 운동 선택')}
                          onPress={() => {
                            setDraft(data.preferences.starters);
                            setPersonal(true);
                          }}
                        />
                      </>
                    )}
                  </View>
                </View>
              </>); }

