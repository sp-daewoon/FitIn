import AsyncStorage from '@react-native-async-storage/async-storage';
import { Data, emptyData } from './workout';
import { decode } from './codec';
export const STORAGE_KEY = 'fitin.v2';
export async function loadData(): Promise<{ data: Data; legacy: boolean }> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return {
    data: raw ? decode(raw) : structuredClone(emptyData),
    legacy: !raw && !!(await AsyncStorage.getItem('fitin.v1')),
  };
}
let writes = Promise.resolve();
export function save(data: Data) {
  const result = writes
    .catch(() => {})
    .then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)));
  writes = result;
  return result;
}
