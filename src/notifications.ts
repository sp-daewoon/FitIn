import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Session, elapsedAt, announcement, phaseTitle, sessionLimit } from './workout';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});
export async function requestReminders() {
  if (Platform.OS === 'web') return false;
  if (Platform.OS === 'android')
    await Notifications.setNotificationChannelAsync('workout', {
      name: '운동 안내',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  return (
    (await Notifications.getPermissionsAsync()).granted ||
    (await Notifications.requestPermissionsAsync()).granted
  );
}
let queue = Promise.resolve(),
  generation = 0;
export function syncReminders(session: Session | null, sound: boolean) {
  const token = ++generation;
  const work = queue
    .catch(() => {})
    .then(async () => {
      if (Platform.OS === 'web' || token !== generation) return;
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (
        !session ||
        session.paused ||
        token !== generation ||
        !(await Notifications.getPermissionsAsync()).granted
      )
        return;
      const now = Date.now(),
        elapsed = elapsedAt(session, now);
      let start = 0;
      for (const phase of session.phases) {
        if (token !== generation) return;
        if (start > elapsed && start < sessionLimit(session))
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'FitIn · ' + phaseTitle(phase),
              body: announcement(phase),
              sound: sound ? 'default' : false,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: new Date(now + (start - elapsed) * 1000),
              channelId: 'workout',
            },
          });
        start += phase.seconds;
      }
      const end = Math.min(start, sessionLimit(session));
      if (token === generation && end > elapsed)
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'FitIn · 오늘 운동 종료',
            body: '운동 기록을 확인해주세요. 자동 진행은 실제 수행과 별도로 기록돼요.',
            sound: sound ? 'default' : false,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(now + (end - elapsed) * 1000),
            channelId: 'workout',
          },
        });
    });
  queue = work;
  return work;
}
