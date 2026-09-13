import { t } from '../i18n';
import React from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';


import { ExerciseLibrary } from '../ExerciseLibrary';



import versions from '../../docs/releases/versions.json';


import { Harness } from '../Harness';
import { formatTime } from '../workout';
import { s } from '../ui/styles';
import { Button } from '../ui/Button';
import { useWorkoutUI } from '../ui/WorkoutContext';
import { TodayScreen } from './TodayScreen';
import { RoutineScreen } from './RoutineScreen';
import { HistoryScreen } from './HistoryScreen';
import { SettingsScreen } from './SettingsScreen';
import { WorkoutDialogs } from './WorkoutDialogs';
import { WorkoutUIProvider } from '../ui/WorkoutContext';
import { useWorkoutController } from '../ui/useWorkoutController';
function Shell(){ const {w, tab, setTab, setGuide, setStopConfirm, notice, setNotice, wide, page, session, selected} = useWorkoutUI(); return ((
    <SafeAreaView style={s.safe}>
      <StatusBar style="dark" />
      <ScrollView ref={page} contentContainerStyle={[s.container, wide && s.desktop]}>
        <View style={s.header}>
          <Text style={s.logo}>
            fit<Text style={{ color: '#E97860' }}>in.</Text>
          </Text>
          {__DEV__ && (
            <View style={s.headerRight}>
              <View style={s.dot} />
              <Text style={s.small}>{t('내 기기에만 저장')}</Text>
              <Text style={s.buildTag}>
                {
                  versions[
                    Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web'
                  ].version
                }{' '}
                · PREVIEW
              </Text>
            </View>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('설정')}
            onPress={() => {
              setTab('settings');
              page.current?.scrollTo({ y: 0 });
            }}
            style={s.close}
          >
            <Text style={s.section}>⚙</Text>
          </Pressable>
        </View>
        <View style={s.nav}>
          {(
            [
              ['today', t('오늘의 운동')],
              ['plan', t('내 루틴')],
              ['library', t('운동 사전')],
              ['history', t('운동 기록')],
              ...(__DEV__ ? [['harness', t('하네스')]] : []),
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
              <Button secondary label={t('저장 다시 시도')} onPress={() => void w.retry()} />
            )}
          </View>
        ) : null}
        {!w.ready ? (
          <Text style={s.title}>{t('기록을 불러오고 있어요.')}</Text>
        ) : (
          <>
            {w.interrupted > 0 && session ? (
              <View style={s.warning}>
                <Text style={s.section}>
                  {t('앱이 종료된 사이 {0}이 지났어요.', formatTime(w.interrupted))}
                </Text>
                <Text style={s.body}>
                  {t(
                    '그동안 앱이 시간을 재고 있지 않아서 운동 시간에 넣지 않았습니다. 운동은 일시정지 상태이고 완료한 세트 기록은 그대로예요. 화면만 꺼두었을 때는 시간이 계속 흐르며, 이 물음은 앱이 완전히 종료됐을 때만 나옵니다.',
                  )}
                </Text>
                <Button
                  label={t('앱만 꺼졌고 운동은 계속했어요 · 시간 인정하고 이어서')}
                  onPress={() => w.resolveGap(true)}
                />
                <Button
                  secondary
                  label={t('쉬고 있었어요 · 그 시간은 빼고 이어서')}
                  onPress={() => w.resolveGap(false)}
                />
                <Button
                  secondary
                  label={t('여기까지 기록하고 끝내기')}
                  onPress={() => setStopConfirm(true)}
                />
              </View>
            ) : null}
            {notice ? (
              <View style={s.notice}>
                <Text style={[s.body, { flex: 1 }]}>{notice}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('안내 닫기')}
                  onPress={() => setNotice('')}
                  style={s.close}
                >
                  <Text>×</Text>
                </Pressable>
              </View>
            ) : null}
            {tab === 'today' && <TodayScreen />}
            {tab === 'plan' && <RoutineScreen />}
            {tab === 'history' && <HistoryScreen />}
            {tab === 'settings' && <SettingsScreen />}
            {tab === 'library' && <ExerciseLibrary onSelect={setGuide} />}
            {tab === 'harness' && __DEV__ && <Harness />}
          </>
        )}
        <Text style={s.footer}>LESS THINKING. MORE MOVING.</Text>
      </ScrollView>
      <WorkoutDialogs />
    </SafeAreaView>
  )); }
export function WorkoutShell(){ const ui=useWorkoutController(); return <WorkoutUIProvider value={ui}><Shell /></WorkoutUIProvider>; }

