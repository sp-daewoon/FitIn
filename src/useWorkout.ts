import { t } from './i18n';
import { Language, setLanguage } from './i18n';
import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import {
  announcement,
  applyCommand,
  begin,
  Command,
  countdownCue,
  Data,
  emptyData,
  finish,
  PlanItem,
  position,
  reconcileOnLaunch,
  resumeAfterGap,
  Routine,
  swapUpcoming,
  touch,
  MachineId,
} from './workout';
import { loadData, save } from './storage';
import { beepCue, speakCue, stopCues } from './audio';
import { requestReminders, syncReminders } from './notifications';
export function useWorkout() {
  const [data, setData] = useState<Data>(emptyData),
    [ready, setReady] = useState(false),
    [error, setError] = useState(''),
    [saveFailed, setSaveFailed] = useState(false),
    [now, setNow] = useState(Date.now()),
    [interrupted, setInterrupted] = useState(0),
    [busy, setBusy] = useState(false);
  const cue = useRef(''),
    beep = useRef(''),
    commandNumber = useRef(0),
    active = useRef(true);
  useEffect(() => {
    loadData()
      .then(({ data, legacy }) => {
        setLanguage(data.preferences.language ?? 'en');
        // Cold start only: a backgrounded app never reaches this. If a session was left running
        // while the process was dead, freeze the gap out and let the user say what happened.
        const time = Date.now();
        const check = data.session ? reconcileOnLaunch(data.session, time) : null;
        if (check?.excluded) setInterrupted(Math.round(check.excluded));
        setNow(time);
        setData(check ? { ...data, session: check.session } : data);
        setReady(true);
        if (legacy)
          setError(
            t(
              '이전 기획 초안 기록은 fitin.v1에 보존돼 있어요. 새 진행 규칙은 별도 저장소를 사용합니다.',
            ),
          );
      })
      .catch(() => setError(t('저장 기록을 읽지 못했어요. 원본 보호를 위해 저장을 중단했습니다.')));
  }, []);
  useEffect(() => {
    if (!ready) return;
    void save(data)
      .then(() => setSaveFailed(false))
      .catch(() => {
        setSaveFailed(true);
        setError(t('저장에 실패했어요. 앱을 닫기 전에 저장을 다시 시도해주세요.'));
      });
  }, [data, ready]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (status) => {
      active.current = status === 'active';
      if (active.current) setNow(Date.now());
      else {
        // Record the moment the app left the screen. If the system kills the process from here,
        // the next launch knows how long nothing was driving the session.
        setData((d) => (d.session ? { ...d, session: touch(d.session, Date.now()) } : d));
        void stopCues().catch(() => {});
      }
    });
    return () => {
      sub.remove();
      void stopCues().catch(() => {});
    };
  }, []);
  // The display tick runs only while a session is actually advancing. Ticking unconditionally
  // re-rendered the whole screen ten times a second on every tab, including the planner, builder
  // and dictionary, which made taps feel delayed. Nothing outside an advancing session reads `now`.
  useEffect(() => {
    if (!data.session || data.session.paused) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 100);
    // A slow heartbeat is persisted so an unexpected termination is dated from the last moment the
    // app was known to be alive, not from the last button press.
    const beat = setInterval(
      () => setData((d) => (d.session ? { ...d, session: touch(d.session, Date.now()) } : d)),
      30000,
    );
    return () => {
      clearInterval(timer);
      clearInterval(beat);
    };
  }, [data.session?.id, data.session?.paused]);
  useEffect(() => {
    if (ready)
      void syncReminders(data.session, data.sound).catch(() =>
        setError(t('화면 밖 알림을 예약하지 못했어요. 앱을 열어두고 진행해주세요.')),
      );
  }, [data.session, data.sound, data.preferences.language, ready]);
  const p = data.session ? position(data.session, now) : null;
  useEffect(() => {
    const s = data.session;
    if (!s) return;
    if (!p?.phase) {
      setData((d) => finish(d, Date.now(), 'routine'));
      if (data.sound && active.current) void speakCue(announcement(null)).catch(() => {});
      return;
    }
    if (s.paused || !data.sound) {
      void stopCues().catch(() => {});
      return;
    }
    if (!active.current) return;
    const key = `${s.id}:${p.phase.id}:${data.preferences.language ?? 'en'}`;
    if (cue.current !== key) {
      cue.current = key;
      void speakCue(announcement(p.phase)).catch(() =>
        setError(t('음성 재생에 실패했어요. 화면 안내를 확인해주세요.')),
      );
    }
    const next = countdownCue(s, now);
    if (next && beep.current !== next.key) {
      beep.current = next.key;
      void beepCue().catch(() => setError(t('비프 재생에 실패했어요. 화면 안내는 계속됩니다.')));
    }
  }, [
    data.session,
    data.sound,
    data.preferences.language,
    p?.phase?.id,
    Math.ceil(p?.remaining ?? 0),
  ]);
  async function start(routine: Routine, items: PlanItem[]) {
    if (busy || data.session) return;
    setBusy(true);
    try {
      if (Platform.OS !== 'web' && !(await requestReminders()))
        setError(t('알림이 꺼져 있어요. 화면 밖 안내를 받으려면 설정에서 알림을 켜주세요.'));
    } catch {
      setError(t('알림 권한을 확인하지 못했어요. 앱을 열어두고 진행해주세요.'));
    }
    try {
      const time = Date.now();
      setNow(time);
      setData((d) => (d.session ? d : { ...d, session: begin(routine, items, time) }));
    } catch (e) {
      setError(e instanceof Error ? e.message : t('운동을 시작하지 못했어요.'));
    } finally {
      setBusy(false);
    }
  }
  function command(type: Command['type']) {
    const time = Date.now();
    const s = data.session;
    if (!s) return;
    const p = position(s, time);
    if (!p.phase) return;
    const c: Command = {
      id: `app:${++commandNumber.current}:${time}`,
      sessionId: s.id,
      phaseId: p.phase.id,
      revision: s.revision,
      source: 'app',
      type,
      at: time,
    };
    setNow(time);
    setData((d) => (d.session ? { ...d, session: applyCommand(d.session, c) } : d));
  }
  function reorder(a: MachineId, b: MachineId) {
    setData((d) => (d.session ? { ...d, session: swapUpcoming(d.session, a, b, Date.now()) } : d));
  }
  /** Answer to the launch gap question: credit the missing time as workout time, or discard it. */
  function resolveGap(credit: boolean) {
    const time = Date.now();
    const seconds = credit ? interrupted : 0;
    setInterrupted(0);
    setNow(time);
    setData((d) => (d.session ? { ...d, session: resumeAfterGap(d.session, time, seconds) } : d));
  }
  function stop() {
    void stopCues().catch(() => {});
    setData((d) => finish(d, Date.now(), 'stopped'));
  }
  return {
    changeLanguage: (language: Language) => {
      setLanguage(language);
      void stopCues().catch(() => {});
      setError('');
      setData((d) => ({ ...d, preferences: { ...d.preferences, language } }));
    },
    data,
    setData,
    ready,
    error,
    setError,
    saveFailed,
    now,
    p,
    busy,
    interrupted,
    resolveGap,
    start,
    command,
    reorder,
    stop,
    retry: () =>
      save(data)
        .then(() => {
          setSaveFailed(false);
          setError('');
        })
        .catch(() => setError(t('저장에 실패했어요. 기기 저장 공간을 확인해주세요.'))),
  };
}
