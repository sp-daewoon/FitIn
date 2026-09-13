import { t } from '../i18n';
import React from 'react';
import { AccountSettings } from './AccountSettings';
import { Switch, Text, View } from 'react-native';

import { WatchPreview } from '../WatchPreview';
import { SelectField } from '../SelectField';

import { s } from '../ui/styles';
import { Button } from '../ui/Button';
import { useWorkoutUI } from '../ui/WorkoutContext';

export function SettingsScreen() {
  const { w, data, setTab, setNotice, session, machine } = useWorkoutUI();
  return (
    <>
      <SelectField
        label={t('언어')}
        value={data.preferences.language ?? 'en'}
        options={[
          { value: 'en', label: 'English' },
          { value: 'ko', label: '한국어' },
        ]}
        onChange={w.changeLanguage}
      />
      <Text style={s.helper}>{t('화면·음성·알림에 함께 적용합니다.')}</Text>
      <View style={s.intro}>
        <Text style={s.title}>{t('설정')}</Text>
      </View>
      <View style={s.card}>
        <Button
          secondary
          label={t('분할·루틴 설정은 내 루틴에서 →')}
          onPress={() => setTab('plan')}
        />
        {__DEV__ && (
          <>
            <AccountSettings />
            <WatchPreview session={session} now={w.now} fallback={machine} onCommand={w.command} />
            <Text style={s.section}>{t('Apple 건강')}</Text>
            <Text style={s.liveBadge}>{t('iPhone 연동 준비 중 · 현재 미연결')}</Text>
            <Text style={s.helper}>
              {t(
                '동의한 경우 완료한 근력 운동을 건강 앱에 저장하고, Apple Watch의 심박수를 함께 확인하는 기능을 준비합니다. 현재 버전은 건강 데이터를 읽거나 저장하지 않아요. 연동 없이도 FitIn을 사용할 수 있습니다.',
              )}
            </Text>
            <View style={s.line} />
          </>
        )}
        <View style={s.between}>
          <View style={{ flex: 1 }}>
            <Text style={s.section}>{t('음성 · 5초 비프 안내')}</Text>
            <Text style={s.helper}>{t('운동명과 세트 번호를 읽어줘요.')}</Text>
          </View>
          <Switch
            accessibilityLabel={t('음성 및 비프 안내')}
            value={data.sound}
            trackColor={{ true: '#E97860' }}
            onValueChange={(sound) => w.setData((d) => ({ ...d, sound }))}
          />
        </View>
        <View style={s.line} />
        {__DEV__ && (
          <>
            <Text style={s.section}>{t('워치 · AirPods')}</Text>
            <Text style={s.helper}>
              {t(
                '워치는 다음 단계·30초 더·일시정지 중심으로 연결할 예정입니다. AirPods 버튼은 음악 앱과의 충돌을 확인해야 하며, 현재 연결 기능은 제공하지 않습니다.',
              )}
            </Text>
          </>
        )}
        <Button
          disabled={!!session}
          secondary
          label={t('개인 시작 운동·이전 고정 설정 해제')}
          onPress={() => {
            w.setData((d) => ({
              ...d,
              preferences: { ...d.preferences, starters: [], savedPlan: null },
            }));
            setNotice(t('개인 운동 설정을 해제했어요. 기록은 유지됩니다.'));
          }}
        />
        {session && (
          <Text style={s.helper}>{t('진행 중인 운동이 끝난 뒤 설정을 바꿀 수 있어요.')}</Text>
        )}
      </View>
    </>
  );
}
