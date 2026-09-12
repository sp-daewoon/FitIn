import { createAudioPlayer, setAudioModeAsync, setIsAudioActiveAsync } from 'expo-audio';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
let player: ReturnType<typeof createAudioPlayer> | undefined;
let release: ReturnType<typeof setTimeout> | undefined;
let generation = 0;
export async function stopCues() {
  generation++;
  if (release) clearTimeout(release);
  player?.pause();
  await Speech.stop();
  await setIsAudioActiveAsync(false);
}
export async function speakCue(text: string) {
  await stopCues();
  // A separate iOS speech session lets the OS manage interruptions and music ducking.
  Speech.speak(text, { language: 'ko-KR', rate: 0.94, useApplicationAudioSession: false });
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
export async function beepCue() {
  const token = ++generation;
  if (release) clearTimeout(release);
  await Speech.stop();
  await setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: 'duckOthers',
    shouldPlayInBackground: false,
  });
  if (token !== generation) return;
  await setIsAudioActiveAsync(true);
  player ??= createAudioPlayer(require('../assets/beep.wav'));
  await player.seekTo(0);
  if (token !== generation) return;
  player.play();
  release = setTimeout(() => {
    if (token === generation) void setIsAudioActiveAsync(false).catch(() => {});
  }, 250);
}
