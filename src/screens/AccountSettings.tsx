import React, { useEffect, useState } from 'react';
import { Modal, Text, View } from 'react-native';
import { useWorkoutUI } from '../ui/WorkoutContext';
import { supabase } from '../auth/client';
import { authError, socialSignIn } from '../auth/operations';
import { a } from '../locales/accounts';
import { Button } from '../ui/Button';
import { s } from '../ui/styles';
import { loadData } from '../storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dataKey } from '../storageKeys';
import { environment } from '../environment';

export function AccountSettings() {
  const { auth, cloud, w, data, session } = useWorkoutUI();
  const [origin,setOrigin] = useState<string | null>(null), [linked,setLinked] = useState<string[]>([]);
  const [confirm,setConfirm] = useState<'delete'|'import'|null>(null), [busy,setBusy] = useState(false), [message,setMessage] = useState('');
  useEffect(() => {
    let alive = true;
    if (supabase && auth.session) {
      void supabase.from('accounts').select('signup_provider').eq('id',auth.session.user.id).single()
        .then(({data}) => { if(alive)setOrigin(data?.signup_provider??null); });
      void supabase.auth.getUserIdentities().then(({data}) => {if(alive)setLinked(data?.identities.map(x=>x.provider)??[]);});
    }
    return () => {alive=false;};
  },[auth.session?.user.id,auth.session?.user.updated_at]);
  async function run(action:()=>Promise<void>) {
    if(busy || session)return;
    setBusy(true);setMessage('');
    try {await action();}catch(e){setMessage(authError(e));}finally{setBusy(false);}
  }
  async function remove() {
    if(!supabase) return;
    if(linked.includes('apple')) {
      const {error}=await supabase.functions.invoke('delete-account');
      if(error)throw error;
    } else {
      const {error}=await supabase.rpc('delete_email_or_google_account');
      if(error)throw error;
    }
    await auth.signOut();
  }
  async function importGuest() {
    if(!auth.account)return;
    const guest=await loadData('guest');
    await AsyncStorage.setItem(`${dataKey(environment,auth.account.id)}.before-import.${Date.now()}`,JSON.stringify(data));
    w.setData(d=>({...d,preferences:guest.data.preferences,history:guest.data.history}));setConfirm(null);
  }
  return <View style={s.card}>
    <Text style={s.section}>{a('account')}</Text>
    {auth.account ? <>
      <Text style={s.body}>{auth.account.email}</Text>
      {!auth.session && <><Text style={s.helper}>{a('offline')}</Text><Button disabled={!!session} label={a('signIn')} onPress={auth.signIn}/></>}
      <View style={s.line}/><Text style={s.section}>{a('sync')}</Text><Text style={s.helper}>{a(cloud.status)}</Text>
      {cloud.review && <View style={s.warning}>
        <Text style={s.body}>{a('review')}</Text>
        <Text style={s.small}>{data.history.length} → {cloud.review.document.history.length}</Text>
        <Button disabled={busy||!!session} label={a('useCloud')} onPress={()=>cloud.choose('remote')}/>
        <Button secondary disabled={busy||!!session} label={a('keepLocal')} onPress={()=>cloud.choose('local')}/>
      </View>}
      <Button secondary label={a('syncNow')} onPress={cloud.syncNow}/>
      <Button secondary disabled={busy||!!session} label={a('guestImport')} onPress={()=>setConfirm('import')}/>
      {origin==='email' && <>
        <View style={s.line}/><Text style={s.section}>{a('link')}</Text>
        <Text style={s.helper}>{linked.join(' · ')}</Text>
        {!linked.includes('google') && <Button secondary disabled={busy||!!session||!auth.providers.google} label={a('linkGoogle')} onPress={()=>void run(()=>socialSignIn('google',true))}/>}
        {!linked.includes('apple') && <Button secondary disabled={busy||!!session||!auth.providers.apple} label={a('linkApple')} onPress={()=>void run(()=>socialSignIn('apple',true))}/>}
      </>}
      <View style={s.line}/><Button secondary disabled={busy||!!session} label={a('signOut')} onPress={()=>void run(auth.signOut)}/>
      <Button secondary disabled={busy||!!session||!auth.session} label={a('delete')} onPress={()=>setConfirm('delete')}/>
    </> : <Button disabled={!!session} label={a('signIn')} onPress={auth.signIn}/>}
    {session && <Text style={s.helper}>{a('finishFirst')}</Text>}
    {!!message && <Text accessibilityRole="alert" style={s.limit}>{message}</Text>}
    <Modal visible={confirm!==null} transparent animationType="fade" onRequestClose={()=>!busy&&setConfirm(null)}>
      <View style={{flex:1,backgroundColor:'#0008',justifyContent:'center',padding:24}}><View style={s.card}>
        <Text style={s.section}>{a(confirm==='delete'?'delete':'import')}</Text>
        <Text style={s.body}>{a(confirm==='delete'?'deleteWarning':'guestImportWarning')}</Text>
        <Button disabled={busy} label={a(confirm==='delete'?'confirmDelete':'import')} onPress={()=>void run(confirm==='delete'?remove:importGuest)}/>
        <Button secondary disabled={busy} label={a('cancel')} onPress={()=>setConfirm(null)}/>
        {!!message && <Text accessibilityRole="alert" style={s.limit}>{message}</Text>}
      </View></View>
    </Modal>
  </View>;
}
