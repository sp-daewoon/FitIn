export function dataKey(environment: string, owner = 'guest') {
  if (!['development', 'production'].includes(environment))
    throw new Error('Invalid storage environment');
  if (owner !== 'guest' && !/^[0-9a-f-]{36}$/i.test(owner))
    throw new Error('Invalid account storage scope');
  return `fitin.${environment}.v4.${owner}`;
}

/**
 * The display language is a device choice, not account data. It is stored outside the workout
 * document so the sign-in screen can honour it before any account or workout data is loaded.
 */
export function languageKey(environment: string) {
  if (!['development', 'production'].includes(environment))
    throw new Error('Invalid storage environment');
  return `fitin.${environment}.language`;
}
