import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './client';
import { authError, authLinking, completeCallback, providerAvailability } from './operations';
import { environment } from '../environment';

type Entry = 'login' | 'guest' | 'account';
type Account = { id: string; email: string };
function useAuthState() {
  const [ready, setReady] = useState(false),
    [entry, setEntry] = useState<Entry>('login');
  const [session, setSession] = useState<Session | null>(null),
    [account, setAccount] = useState<Account | null>(null);
  const [error, setError] = useState('');
  const [providers, setProviders] = useState({ google: false, apple: false });
  const entryKey = `fitin.${environment}.entry`;
  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(entryKey);
        if (raw === 'guest' && alive) setEntry('guest');
        else if (raw) {
          const saved = JSON.parse(raw);
          if (
            typeof saved.id === 'string' &&
            /^[0-9a-f-]{36}$/i.test(saved.id) &&
            typeof saved.email === 'string' &&
            alive
          ) {
            setAccount(saved);
            setEntry('account');
          }
        }
        const result = await supabase?.auth.getSession();
        if (alive && result?.data.session) {
          setSession(result.data.session);
          setAccount({
            id: result.data.session.user.id,
            email: result.data.session.user.email ?? '',
          });
          setEntry('account');
        }
      } catch (e) {
        if (alive) setError(authError(e));
      } finally {
        if (alive) setReady(true);
      }
    })();
    const subscription = supabase?.auth.onAuthStateChange((_event, next) => {
      if (!alive) return;
      setSession(next);
      // Auth expiry pauses sync, not the local workout. Explicit sign-out handles the entry state.
      if (next) {
        const value = { id: next.user.id, email: next.user.email ?? '' };
        setAccount(value);
        setEntry('account');
        void AsyncStorage.setItem(entryKey, JSON.stringify(value)).catch(() =>
          setError('Could not save account selection.'),
        );
      }
    }).data.subscription;
    const sub = AppState.addEventListener('change', (state) => {
      if (Platform.OS !== 'web') {
        if (state === 'active') supabase?.auth.startAutoRefresh();
        else supabase?.auth.stopAutoRefresh();
      }
    });
    void providerAvailability()
      .then((value) => {
        if (alive) setProviders(value);
      })
      .catch(() => {});
    const link = authLinking.addEventListener('url', ({ url }) => {
      void completeCallback(url).catch((e) => setError(authError(e)));
    });
    void authLinking
      .getInitialURL()
      .then((url) => {
        if (url) return completeCallback(url);
      })
      .catch((e) => setError(authError(e)));
    return () => {
      alive = false;
      subscription?.unsubscribe();
      sub.remove();
      link.remove();
    };
  }, [entryKey]);
  async function explore() {
    const result = await supabase?.auth.signOut({ scope: 'local' });
    if (result?.error) throw result.error;
    await AsyncStorage.setItem(entryKey, 'guest');
    setSession(null);
    setAccount(null);
    setEntry('guest');
  }
  async function signOut() {
    const result = await supabase?.auth.signOut({ scope: 'local' });
    if (result?.error) throw result.error;
    await AsyncStorage.removeItem(entryKey);
    setSession(null);
    setAccount(null);
    setEntry('login');
  }
  return {
    ready,
    entry,
    session,
    account,
    providers,
    error,
    setError,
    explore,
    signOut,
    signIn: () => setEntry('login'),
    back: () => setEntry(account ? 'account' : 'guest'),
  };
}
const Context = createContext<ReturnType<typeof useAuthState> | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value = useAuthState();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAuth() {
  const auth = useContext(Context);
  if (!auth) throw new Error('Auth provider missing');
  return auth;
}
