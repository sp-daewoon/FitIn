import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, setLanguage } from './i18n';
import { environment } from './environment';
import { languageKey } from './storageKeys';

/**
 * Device-level language storage. It lives here rather than in `i18n.ts` because that module is
 * imported by the pure engine and its tests, which have no storage.
 *
 * The chosen value survives a restart and is applied before the first screen renders, so the
 * sign-in screen and the settings screen always agree. Without it the sign-in toggle only moved a
 * module variable: the choice was lost on relaunch and settings still showed the stored value.
 */
let chosen: Language | null = null;
export const chosenLanguage = () => chosen;

export async function loadLanguage() {
  try {
    const raw = await AsyncStorage.getItem(languageKey(environment));
    if (raw === 'en' || raw === 'ko') {
      chosen = raw;
      setLanguage(raw);
    }
  } catch {
    // A device that cannot read the preference still opens in the default language.
  }
  return chosen;
}

export async function saveLanguage(value: Language) {
  chosen = value;
  setLanguage(value);
  try {
    await AsyncStorage.setItem(languageKey(environment), value);
  } catch {
    // The choice still applies to this run; it simply will not survive a restart.
  }
}
