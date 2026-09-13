import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { createClient, processLock } from '@supabase/supabase-js';
import { backend, environment } from '../environment';

// PKCE must use secure entropy and SHA-256 on native as well as web.
if (Platform.OS !== 'web' && !globalThis.crypto?.subtle) {
  const nativeCrypto = {
    getRandomValues: Crypto.getRandomValues,
    subtle: { digest: (algorithm: string, data: BufferSource) => {
      if (algorithm !== 'SHA-256') throw new Error('Unsupported PKCE digest');
      return Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, data);
    } },
  };
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: nativeCrypto });
}
const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};
const webStorage = {
  getItem: (key: string) => typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(key),
  setItem: (key: string, value: string) => sessionStorage.setItem(key, value),
  removeItem: (key: string) => sessionStorage.removeItem(key),
};
export const supabase = backend.url && backend.publishableKey ? createClient(backend.url, backend.publishableKey, {
  auth: { storageKey: `fitin.${environment}.auth`, storage: Platform.OS === 'web' ? webStorage : secureStorage,
    persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, flowType: 'pkce', lock: processLock },
}) : null;
