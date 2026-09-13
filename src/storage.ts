import AsyncStorage from '@react-native-async-storage/async-storage';
import { Data, emptyData } from './workout';
import { decode } from './codec';
import { environment } from './environment';
import { dataKey } from './storageKeys';
export const STORAGE_KEY = 'fitin.v4';
export const PREVIOUS_KEYS = ['fitin.v3', 'fitin.v2', 'fitin.v1'];
/**
 * Reads the newest readable snapshot. Older keys are read but never rewritten or removed, so a
 * decode failure or a rollback still finds the original record.
 */
export async function loadData(owner = 'guest'): Promise<{ data: Data; legacy: boolean }> {
  const scoped = await AsyncStorage.getItem(dataKey(environment, owner));
  if (scoped) return { data: decode(scoped), legacy: false };
  // Only the development guest workspace can import the old unscoped local app.
  if (owner !== 'guest' || environment !== 'development')
    return { data: structuredClone(emptyData), legacy: false };
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw) return { data: decode(raw), legacy: false };
  for (const key of ['fitin.v3', 'fitin.v2']) {
    const previous = await AsyncStorage.getItem(key);
    if (previous) return { data: decode(previous), legacy: false };
  }
  return {
    data: structuredClone(emptyData),
    legacy: !!(await AsyncStorage.getItem('fitin.v1')),
  };
}
let writes = Promise.resolve();
export function save(data: Data, owner = 'guest') {
  const result = writes
    .catch(() => {})
    .then(() => AsyncStorage.setItem(dataKey(environment, owner), JSON.stringify(data)));
  writes = result;
  return result;
}
