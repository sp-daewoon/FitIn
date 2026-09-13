import { decode } from '../codec';
import { Data, emptyData } from '../workout';
export type BackupDocument = {
  version: 1;
  preferences: Data['preferences'];
  history: Data['history'];
};
export function documentOf(data: Data): BackupDocument {
  return structuredClone({ version: 1, preferences: data.preferences, history: data.history });
}
export function readDocument(value: unknown): BackupDocument {
  const object = value as Partial<BackupDocument> | null;
  if (!object || object.version !== 1 || 'session' in object)
    throw new Error('Invalid account backup');
  return documentOf(
    decode(
      JSON.stringify({ ...emptyData, preferences: object.preferences, history: object.history }),
    ),
  );
}
export function equal(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) || Array.isArray(b))
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((v, i) => equal(v, b[i]))
    );
  const x = a as Record<string, unknown>,
    y = b as Record<string, unknown>;
  return (
    Object.keys(x).length === Object.keys(y).length &&
    Object.keys(x).every((key) => Object.hasOwn(y, key) && equal(x[key], y[key]))
  );
}
/** Three-way synchronization for one account. Deleted records stay deleted; no account merging. */
export function reconcileDocuments(
  base: BackupDocument,
  local: BackupDocument,
  remote: BackupDocument,
): BackupDocument | null {
  let conflict = false;
  function merge(before: any, here: any, there: any): any {
    if (equal(here, there) || equal(there, before)) return here;
    if (equal(here, before)) return there;
    if ([before, here, there].every((v) => v && typeof v === 'object' && !Array.isArray(v))) {
      const result: Record<string, unknown> = {};
      for (const key of new Set([
        ...Object.keys(before),
        ...Object.keys(here),
        ...Object.keys(there),
      ])) {
        const value = merge(before[key], here[key], there[key]);
        if (value !== undefined) result[key] = value;
      }
      return result;
    }
    conflict = true;
    return here;
  }
  const preferences = merge(base.preferences, local.preferences, remote.preferences);
  const rows = (doc: BackupDocument) => Object.fromEntries(doc.history.map((row) => [row.id, row]));
  const history = Object.values(merge(rows(base), rows(local), rows(remote))) as Data['history'];
  if (conflict) return null;
  return readDocument({
    version: 1,
    preferences,
    history: history.sort((a, b) => a.endedAt - b.endedAt || a.id.localeCompare(b.id)),
  });
}
