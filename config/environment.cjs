// com.fitin.app was already registered to another Apple developer account, so the second segment
// carries an owner-specific token to guarantee a unique identifier. Production is permanent once
// the app is submitted; until then it can still change.
const APP_IDS = { development: 'com.spong.fitin.dev', production: 'com.spong.fitin' };
function resolveEnvironment(env = process.env) {
  const name = env.FITIN_ENV || 'development';
  if (!Object.hasOwn(APP_IDS, name)) throw new Error('FITIN_ENV must be development or production');
  const url = env.EXPO_PUBLIC_SUPABASE_URL || '';
  const key = env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
  if (!!url !== !!key) throw new Error('Supabase URL and publishable key must be configured together');
  if (url && (new URL(url).protocol !== 'https:' || !key.startsWith('sb_publishable_')))
    throw new Error('Use an HTTPS Supabase URL and a publishable key, never a server secret');
  if (name === 'production' && (!url || !key)) throw new Error('Production backend is not configured');
  if (name === 'production' && url === env.FITIN_DEVELOPMENT_SUPABASE_URL)
    throw new Error('Production must not use the development backend');
  return { name, appId: APP_IDS[name], scheme: name === 'production' ? 'fitin' : 'fitin-dev', url, key };
}
module.exports = { resolveEnvironment };
