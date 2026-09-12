import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ExerciseVisual } from './ExerciseVisual';
import { Command, formatTime, MachineId, machines, position, Session } from './workout';

/** Design preview, using phone state and commands. This is not a Watch connection. */
export function WatchPreview({
  session,
  now,
  fallback,
  onCommand,
}: {
  session: Session | null;
  now: number;
  fallback: MachineId;
  onCommand: (type: Command['type']) => void;
}) {
  const p = session ? position(session, now) : null;
  const phase = p?.phase;
  const id = phase?.machine ?? fallback;
  return (
    <View style={s.wrap}>
      <Text style={s.note}>Watch 화면 미리보기 · 실제 기기 미연결</Text>
      <View style={s.watch}>
        <View style={StyleSheet.absoluteFill}>
          <ExerciseVisual machine={id} size={230} />
        </View>
        <View style={s.shade} />
        <Text style={s.label}>{machines[id].name}</Text>
        <Text style={s.phase}>
          {session?.paused
            ? '일시정지'
            : phase?.kind === 'rest'
              ? '휴식'
              : phase?.kind === 'move'
                ? '다음 운동 준비'
                : phase?.kind === 'prepare'
                  ? '시작 준비'
                  : phase
                    ? `${phase.set} / ${phase.sets} 세트`
                    : '체크인 대기'}
        </Text>
        <Text style={s.time}>{formatTime(p?.remaining ?? 0)}</Text>
        {phase && (
          <View style={s.buttons}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Watch 미리보기 일시정지 또는 재개"
              onPress={() => onCommand(session!.paused ? 'resume' : 'pause')}
              style={s.button}
            >
              <Text style={s.label}>{session!.paused ? '재개' : '정지'}</Text>
            </Pressable>
            <Pressable
              disabled={session!.paused || phase.kind === 'prepare'}
              accessibilityRole="button"
              accessibilityLabel="Watch 미리보기 다음 단계"
              onPress={() => onCommand('next')}
              style={s.button}
            >
              <Text style={s.label}>다음</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  note: { color: '#74868A', fontSize: 11 },
  watch: {
    width: 230,
    height: 270,
    borderRadius: 48,
    borderWidth: 8,
    borderColor: '#252A2B',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: '#182522',
    padding: 10,
  },
  shade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.56)',
  },
  label: { color: 'white', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  phase: { color: '#D4E8DC', fontSize: 12 },
  time: { color: 'white', fontSize: 46, fontWeight: '800', fontVariant: ['tabular-nums'] },
  buttons: { flexDirection: 'row', gap: 10 },
  button: { padding: 12, borderRadius: 20, backgroundColor: '#415B4DE0', minWidth: 64 },
});
