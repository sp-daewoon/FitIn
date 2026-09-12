import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  applyCommand,
  begin,
  Command,
  defaultPlan,
  formatTime,
  position,
  announcement,
  TOTAL_SECONDS,
} from './workout';
import { speakCue, beepCue } from './audio';
export function Harness() {
  const [time, setTime] = useState(0),
    [session, setSession] = useState(() => begin('fullA', defaultPlan('fullA'), 0, 'harness')),
    [source, setSource] = useState<Command['source']>('app'),
    [last, setLast] = useState<Command | null>(null);
  const p = position(session, time);
  function send(type: Command['type']) {
    if (!p.phase) return;
    const c: Command = {
      id: `test:${session.revision}:${time}`,
      sessionId: session.id,
      phaseId: p.phase.id,
      revision: session.revision,
      source,
      type,
      at: time,
    };
    setLast(c);
    setSession(applyCommand(session, c));
  }
  return (
    <View style={s.card}>
      <Text style={s.title}>개발 하네스 · 별도 가상 세션</Text>
      <Text style={s.note}>
        실제 기록·알림에 영향을 주지 않습니다. 워치·이어폰 버튼은 연결 기능이 아닌 명령 입력
        시뮬레이션입니다.
      </Text>
      <View style={s.watch}>
        <Text style={s.white}>
          {p.phase?.machine ?? '완료'} · {p.phase?.kind}
        </Text>
        <Text style={s.clock}>{formatTime(p.remaining)}</Text>
        <Text style={s.white}>전체 {formatTime(p.elapsed)} / 40:00</Text>
      </View>
      <Text style={s.note}>
        revision {session.revision} · 직접 완료 {session.confirmed.length}세트
      </Text>
      <View style={s.row}>
        {(['app', 'watch', 'headphones'] as const).map((v) => (
          <Pressable
            accessibilityRole="button"
            key={v}
            onPress={() => setSource(v)}
            style={[s.button, source === v && { backgroundColor: '#DCE8E3' }]}
          >
            <Text>{v}</Text>
          </Pressable>
        ))}
      </View>
      <View style={s.row}>
        {[10, 45, 5, 30].map((v, i) => (
          <Pressable
            accessibilityRole="button"
            key={i}
            onPress={() => setTime(time + v * 1000)}
            style={s.button}
          >
            <Text>+{v}초</Text>
          </Pressable>
        ))}
      </View>
      <View style={s.row}>
        {(['next', 'extend', session.paused ? 'resume' : 'pause'] as const).map((type) => (
          <Pressable
            accessibilityRole="button"
            key={type}
            onPress={() => send(type)}
            style={s.button}
          >
            <Text>{type}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        style={s.button}
        onPress={() => last && setSession(applyCommand(session, last))}
      >
        <Text>직전 명령 재전송 · 중복 방지 확인</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        style={s.button}
        onPress={() => setTime(TOTAL_SECONDS * 1000)}
      >
        <Text>40분 경계로 이동</Text>
      </Pressable>
      <View style={s.row}>
        <Pressable
          accessibilityRole="button"
          style={s.button}
          onPress={() => void speakCue(announcement(p.phase))}
        >
          <Text>현재 단계 음성 듣기</Text>
        </Pressable>
        <Pressable accessibilityRole="button" style={s.button} onPress={() => void beepCue()}>
          <Text>비프 듣기</Text>
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        style={s.button}
        onPress={() => {
          setSession(begin('fullA', defaultPlan('fullA'), 0, 'harness'));
          setTime(0);
          setLast(null);
        }}
      >
        <Text>가상 세션 초기화</Text>
      </Pressable>
    </View>
  );
}
const s = StyleSheet.create({
  card: { padding: 24, gap: 14, backgroundColor: 'white', borderRadius: 24 },
  title: { fontSize: 20, fontWeight: '700', color: '#172C30' },
  note: { fontSize: 12, lineHeight: 20, color: '#66777B' },
  watch: {
    backgroundColor: '#14262B',
    padding: 26,
    borderRadius: 35,
    alignSelf: 'center',
    alignItems: 'center',
    minWidth: 230,
  },
  white: { color: 'white', fontSize: 12 },
  clock: { fontSize: 48, color: '#A9DFC7', fontVariant: ['tabular-nums'], marginVertical: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: {
    minHeight: 44,
    padding: 12,
    backgroundColor: '#F0F4F3',
    borderRadius: 12,
    justifyContent: 'center',
  },
});
