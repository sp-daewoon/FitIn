export function dataKey(environment: string, owner = 'guest') {
  if (!['development', 'production'].includes(environment))
    throw new Error('Invalid storage environment');
  if (owner !== 'guest' && !/^[0-9a-f-]{36}$/i.test(owner))
    throw new Error('Invalid account storage scope');
  return `fitin.${environment}.v4.${owner}`;
}
