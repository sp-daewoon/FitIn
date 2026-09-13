import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { supabase } from './client';
import { appScheme, backend } from '../environment';
import { getLanguage } from '../i18n';
import { a } from '../locales/accounts';

WebBrowser.maybeCompleteAuthSession();
function client() { if (!supabase) throw new Error(a('notConfigured')); return supabase; }
export function authError(error: unknown): string {
  const e = error as { code?: string; message?: string };
  if (e.code === 'otp_expired') return a('wrongCode');
  if (e.code?.includes('rate_limit')) return a('rateLimited');
  if (e.code === 'email_address_not_authorized' || e.code === 'unexpected_failure') return a('delivery');
  if (e.message?.includes('FITIN_USE_EXISTING_PROVIDER')) return a('existing');
  return error instanceof Error && !('code' in error) ? error.message : a('failed');
}
export async function sendEmailCode(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new Error(a('invalidEmail'));
  const { data: route, error: routeError } = await client().rpc('account_login_route', { address: email });
  if (routeError) throw routeError;
  if (route === 'google' || route === 'apple') throw new Error(a(route === 'google' ? 'useGoogle' : 'useApple'));
  const { error } = await client().auth.signInWithOtp({ email, options: { shouldCreateUser: true, data: { language: getLanguage() } } });
  if (error) throw error;
}
export async function verifyEmailCode(email: string, token: string) {
  if (!/^\d{6,10}$/.test(token)) throw new Error(a('invalidCode'));
  const { error } = await client().auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw error;
}
const callbackUrl = () => Platform.OS === 'web' ? `${window.location.origin}/` : `${appScheme}://auth/callback`;
let callbackPending: Promise<void> | null = null;
export async function completeCallback(url: string) {
  const parsed = new URL(url), expected = new URL(callbackUrl());
  if (parsed.protocol !== expected.protocol || parsed.host !== expected.host || parsed.pathname !== expected.pathname) return;
  if (parsed.searchParams.has('error')) throw new Error(a('existing'));
  const code = parsed.searchParams.get('code');
  if (!code) return;
  if (!callbackPending) callbackPending = (async () => {
    const { error } = await client().auth.exchangeCodeForSession(code);
    if (error) throw error;
    if (Platform.OS === 'web') window.history.replaceState({}, '', window.location.pathname);
  })().finally(() => { callbackPending = null; });
  return callbackPending;
}
export async function socialSignIn(provider: 'apple' | 'google', link = false) {
  const sb = client();
  if (link) { const { error } = await sb.rpc('request_identity_link', { provider }); if (error) throw error; }
  if (provider === 'apple' && Platform.OS === 'ios') {
    const nonce = Crypto.randomUUID();
    const hashed = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);
    const credential = await AppleAuthentication.signInAsync({ nonce: hashed,
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL, AppleAuthentication.AppleAuthenticationScope.FULL_NAME] });
    if (!credential.identityToken) throw new Error(a('failed'));
    const options = { provider: 'apple' as const, token: credential.identityToken, nonce };
    const { error } = link ? await sb.auth.linkIdentity(options) : await sb.auth.signInWithIdToken(options);
    if (error) throw error;
    const name = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(' ');
    if (name) await sb.auth.updateUser({ data: { full_name: name } });
    return;
  }
  const options = { redirectTo: callbackUrl(), skipBrowserRedirect: true };
  const { data, error } = link ? await sb.auth.linkIdentity({ provider, options }) : await sb.auth.signInWithOAuth({ provider, options });
  if (error) throw error;
  if (!data.url) throw new Error(a('failed'));
  const result = await WebBrowser.openAuthSessionAsync(data.url, callbackUrl());
  if (result.type !== 'success') throw new Error(a('cancelled'));
  await completeCallback(result.url);
}
export async function providerAvailability() {
  if (!backend.url) return { email: false, google: false, apple: false };
  const response = await fetch(`${backend.url}/auth/v1/settings`, { headers: { apikey: backend.publishableKey } });
  if (!response.ok) throw new Error(a('failed'));
  const settings = await response.json();
  return { email: settings.external?.email === true, google: settings.external?.google === true, apple: settings.external?.apple === true };
}
export const authLinking = Linking;
