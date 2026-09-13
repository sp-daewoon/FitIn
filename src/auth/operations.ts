import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as Crypto from 'expo-crypto';
import { supabase } from './client';
import { appScheme, backend, google } from '../environment';
import { a } from '../locales/accounts';

WebBrowser.maybeCompleteAuthSession();
function client() {
  if (!supabase) throw new Error(a('notConfigured'));
  return supabase;
}
export function authError(error: unknown): string {
  const e = error as { code?: string; message?: string };
  if (e.code?.includes('rate_limit')) return a('rateLimited');
  // The database refuses a second provider and names the one that created the account, so the app
  // can tell the user which button to press instead of showing a generic failure.
  const owner = e.message?.match(/FITIN_USE_EXISTING_PROVIDER:(\w+)/)?.[1];
  if (owner === 'google') return a('useGoogle');
  if (owner === 'apple') return a('useApple');
  if (owner) return a('existing');
  return error instanceof Error && !('code' in error) ? error.message : a('failed');
}
const callbackUrl = () =>
  Platform.OS === 'web' ? `${window.location.origin}/` : `${appScheme}://auth/callback`;
let callbackPending: Promise<void> | null = null;
export async function completeCallback(url: string) {
  const parsed = new URL(url),
    expected = new URL(callbackUrl());
  if (
    parsed.protocol !== expected.protocol ||
    parsed.host !== expected.host ||
    parsed.pathname !== expected.pathname
  )
    return;
  if (parsed.searchParams.has('error')) throw new Error(a('existing'));
  const code = parsed.searchParams.get('code');
  if (!code) return;
  if (!callbackPending)
    callbackPending = (async () => {
      const { error } = await client().auth.exchangeCodeForSession(code);
      if (error) throw error;
      if (Platform.OS === 'web') window.history.replaceState({}, '', window.location.pathname);
    })().finally(() => {
      callbackPending = null;
    });
  return callbackPending;
}
/** Sign-in only. A social account cannot add a second provider, so there is no linking mode. */
export async function socialSignIn(provider: 'apple' | 'google') {
  const sb = client();
  if (provider === 'apple' && Platform.OS === 'ios') {
    const nonce = Crypto.randomUUID();
    const hashed = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);
    const credential = await AppleAuthentication.signInAsync({
      nonce: hashed,
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      ],
    });
    if (!credential.identityToken) throw new Error(a('failed'));
    const { error } = await sb.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce,
    });
    if (error) throw error;
    const name = [credential.fullName?.givenName, credential.fullName?.familyName]
      .filter(Boolean)
      .join(' ');
    if (name) await sb.auth.updateUser({ data: { full_name: name } });
    return;
  }
  // Native Google sign-in when an iOS client is configured. The system account picker opens on
  // the device, so no browser appears and the Supabase subdomain is never shown to the user. The
  // browser flow below stays as the fallback for web and for builds without a client id.
  if (provider === 'google' && Platform.OS === 'ios' && google.iosClientId) {
    GoogleSignin.configure({ iosClientId: google.iosClientId });
    const result = await GoogleSignin.signIn();
    if (result.type !== 'success') throw new Error(a('cancelled'));
    const token = result.data.idToken;
    if (!token) throw new Error(a('failed'));
    const { error } = await sb.auth.signInWithIdToken({ provider: 'google', token });
    if (error) throw error;
    return;
  }
  const options = { redirectTo: callbackUrl(), skipBrowserRedirect: true };
  const { data, error } = await sb.auth.signInWithOAuth({ provider, options });
  if (error) throw error;
  if (!data.url) throw new Error(a('failed'));
  const result = await WebBrowser.openAuthSessionAsync(data.url, callbackUrl());
  if (result.type !== 'success') throw new Error(a('cancelled'));
  await completeCallback(result.url);
}
/** Never advertise a provider the backend has not enabled; the button stays disabled instead. */
export async function providerAvailability() {
  if (!backend.url) return { google: false, apple: false };
  const response = await fetch(`${backend.url}/auth/v1/settings`, {
    headers: { apikey: backend.publishableKey },
  });
  if (!response.ok) throw new Error(a('failed'));
  const settings = await response.json();
  return { google: settings.external?.google === true, apple: settings.external?.apple === true };
}
export const authLinking = Linking;
