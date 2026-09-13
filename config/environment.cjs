// com.fitin.app was already registered to another Apple developer account, so the second segment
// carries an owner-specific token to guarantee a unique identifier. Production is permanent once
// the app is submitted; until then it can still change.
const { readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');

// Xcode runs app.config.js in its own build phases, where the project's environment variables do
// not exist. Without a fallback the generated manifest carries an empty backend and the app ships
// unable to reach Supabase, which looks exactly like a provider that was never enabled. The last
// environment resolved by a project command is cached here and reused only for the same
// environment name. The file is generated and never committed.
const CACHE = resolve(__dirname, '..', '.fitin.environment.json');
function cached() {
  try {
    const saved = JSON.parse(readFileSync(CACHE, 'utf8'));
    return typeof saved?.name === 'string' ? saved : null;
  } catch {
    return null;
  }
}
function persistEnvironment(resolved) {
  writeFileSync(
    CACHE,
    JSON.stringify(
      {
        name: resolved.name,
        url: resolved.url,
        key: resolved.key,
        googleIosClientId: resolved.googleIosClientId,
      },
      null,
      2,
    ) + '\n',
  );
  return resolved;
}

const APP_IDS = { development: 'com.spong.fitin.dev', production: 'com.spong.fitin' };
function resolveEnvironment(env = process.env) {
  const name = env.FITIN_ENV || 'development';
  if (!Object.hasOwn(APP_IDS, name)) throw new Error('FITIN_ENV must be development or production');
  let url = env.EXPO_PUBLIC_SUPABASE_URL || '';
  let key = env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
  let savedGoogle = '';
  if (!url && !key) {
    const saved = cached();
    if (saved && saved.name === name) {
      url = saved.url || '';
      key = saved.key || '';
      savedGoogle = saved.googleIosClientId || '';
    }
  }
  if (!!url !== !!key) throw new Error('Supabase URL and publishable key must be configured together');
  if (url && (new URL(url).protocol !== 'https:' || !key.startsWith('sb_publishable_')))
    throw new Error('Use an HTTPS Supabase URL and a publishable key, never a server secret');
  // Native Google sign-in uses an iOS OAuth client so the account picker opens on the device
  // instead of a browser showing the Supabase subdomain. Without it the browser flow still works,
  // so this is optional and the app falls back rather than losing a sign-in method.
  const googleIosClientId = env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || savedGoogle;
  if (googleIosClientId && !/^[\w-]+\.apps\.googleusercontent\.com$/.test(googleIosClientId))
    throw new Error('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID must be an iOS OAuth client id');
  if (name === 'production' && (!url || !key)) throw new Error('Production backend is not configured');
  if (name === 'production' && url === env.FITIN_DEVELOPMENT_SUPABASE_URL)
    throw new Error('Production must not use the development backend');
  return {
    name,
    appId: APP_IDS[name],
    scheme: name === 'production' ? 'fitin' : 'fitin-dev',
    url,
    key,
    googleIosClientId,
    // Google redirects back through the reversed client id, which is the required URL scheme.
    googleUrlScheme: googleIosClientId
      ? `com.googleusercontent.apps.${googleIosClientId.replace('.apps.googleusercontent.com', '')}`
      : '',
  };
}
module.exports = { resolveEnvironment, persistEnvironment };
