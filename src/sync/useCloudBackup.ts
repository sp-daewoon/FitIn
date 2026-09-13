import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../auth/client';
import { useAuth } from '../auth/AuthContext';
import { environment } from '../environment';
import { dataKey } from '../storageKeys';
import { Data } from '../workout';
import { setLanguage } from '../i18n';
import { BackupDocument, documentOf, equal, readDocument, reconcileDocuments } from './document';

type Remote = { document: BackupDocument; revision: number };
export function useCloudBackup(data: Data, persisted: Data | null, apply: (document: BackupDocument) => void) {
  const auth = useAuth(), owner = auth.account?.id;
  const [status, setStatus] = useState<'local' | 'pending' | 'syncing' | 'synced' | 'review'>('local');
  const [review, setReview] = useState<Remote | null>(null), [retry, setRetry] = useState(0);
  const latest = useRef({ data, persisted, owner, apply });
  latest.current = { data, persisted, owner, apply };
  const running = useRef(false), alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const fingerprint = persisted ? JSON.stringify(documentOf(persisted)) : '';
  const active = () => alive.current && latest.current.owner === owner;
  async function sync(choice?: 'local' | 'remote') {
    if (running.current || !owner || !supabase || auth.session?.user.id !== owner || !latest.current.persisted) {
      if (active()) setStatus(owner ? 'pending' : 'local'); return;
    }
    const local = documentOf(latest.current.persisted);
    if (!equal(local, documentOf(latest.current.data))) return; // Never upload before the local write succeeds.
    running.current = true; setStatus('syncing');
    const key = `${dataKey(environment,owner)}.sync`;
    try {
      const raw = await AsyncStorage.getItem(key);
      const previous = raw ? JSON.parse(raw) as Remote : null;
      if (previous) { previous.document = readDocument(previous.document); if (!Number.isSafeInteger(previous.revision)) throw new Error('Invalid sync metadata'); }
      const result = await supabase.from('workout_backups').select('document,revision').eq('owner_id',owner).maybeSingle();
      if (result.error) throw result.error;
      if (!active() || !equal(local,documentOf(latest.current.data))) return;
      const remote = result.data ? { document: readDocument(result.data.document), revision: Number(result.data.revision) } : null;
      if (remote && !Number.isSafeInteger(remote.revision)) throw new Error('Invalid cloud revision');
      let target = local;
      if (remote && !equal(local,remote.document)) {
        if (choice && review?.revision !== remote.revision) { setReview(remote); setStatus('review'); return; }
        if (choice) {
          await AsyncStorage.setItem(`${key}.recovery.${Date.now()}`, JSON.stringify({ local, remote }));
          target = choice === 'remote' ? remote.document : local;
        } else {
          const merged = previous && reconcileDocuments(previous.document,local,remote.document);
          if (!merged) { setReview(remote); setStatus('review'); return; }
          target = merged;
        }
      }
      if (!active() || !equal(local,documentOf(latest.current.data))) return;
      if (!equal(target,local)) {
        // Persist through the workout owner first; record the new base only on the next successful local write.
        setLanguage(target.preferences.language ?? 'en'); latest.current.apply(target); setReview(null); setStatus('pending'); return;
      }
      let acknowledged = remote;
      if (!remote || !equal(remote.document,target)) {
        const query = remote
          ? supabase.from('workout_backups').update({ document: target }).eq('owner_id',owner).eq('revision',remote.revision)
          : supabase.from('workout_backups').insert({ owner_id: owner, document: target });
        const saved = await query.select('document,revision').maybeSingle();
        if (saved.error || !saved.data) throw saved.error ?? new Error('Concurrent backup update');
        acknowledged = { document: readDocument(saved.data.document), revision: Number(saved.data.revision) };
      }
      await AsyncStorage.setItem(key,JSON.stringify(acknowledged));
      if (active()) { setReview(null); setStatus(equal(local,documentOf(latest.current.data)) ? 'synced' : 'pending'); }
    } catch { if (active()) setStatus('pending'); }
    finally {
      running.current = false;
      if (active() && !equal(local,documentOf(latest.current.data))) setRetry(x => x+1);
    }
  }
  useEffect(() => {
    if (!owner) { setStatus('local'); return; }
    const timer = setTimeout(() => void sync(),700);
    return () => clearTimeout(timer);
  }, [owner, auth.session?.access_token, fingerprint, retry]);
  useEffect(() => {
    if (!owner) return;
    const timer = setInterval(() => setRetry(x => x+1),30000);
    return () => clearInterval(timer);
  }, [owner]);
  return { status, review, syncNow: () => setRetry(x => x+1), choose: (choice: 'local'|'remote') => void sync(choice) };
}
