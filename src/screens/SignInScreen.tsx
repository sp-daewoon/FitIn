import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../ui/Button';
import { useAuth } from '../auth/AuthContext';
import { authError, sendEmailCode, socialSignIn, verifyEmailCode } from '../auth/operations';
import { a } from '../locales/accounts';
import { getLanguage, setLanguage } from '../i18n';
import { environment } from '../environment';

export function SignInScreen() {
  const auth = useAuth();
  const [email, setEmail] = useState(''), [code, setCode] = useState('');
  const [sent, setSent] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const [language, updateLanguage] = useState(getLanguage());
  const [lastSent, setLastSent] = useState(0);
  async function run(task: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setMessage('');
    try { await task(); } catch (e) { setMessage(authError(e)); } finally { setBusy(false); }
  }
  async function send() {
    if (Date.now() - lastSent < 60000) throw new Error(a('rateLimited'));
    await sendEmailCode(email.trim().toLowerCase()); setLastSent(Date.now()); setSent(true); setMessage(a('sent'));
  }
  return <SafeAreaView style={styles.safe}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
    <View style={styles.top}><Text style={styles.logo}>fit<Text style={{ color: '#E97860' }}>in.</Text></Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Language" style={styles.language}
        onPress={() => { const next = language === 'en' ? 'ko' : 'en'; setLanguage(next); updateLanguage(next); setMessage(''); }}>
        <Text>{language === 'en' ? '한국어' : 'English'}</Text>
      </Pressable></View>
    {environment === 'development' && <Text style={styles.note}>DEVELOPMENT</Text>}
    <Text style={styles.title}>{a('welcome')}</Text><Text style={styles.body}>{a('subtitle')}</Text>
    <View style={styles.form}>
      <Button secondary disabled={busy || !auth.providers.apple} label={a('apple')} onPress={() => void run(() => socialSignIn('apple'))} />
      <Button secondary disabled={busy || !auth.providers.google} label={a('google')} onPress={() => void run(() => socialSignIn('google'))} />
      {(!auth.providers.apple || !auth.providers.google) && <Text style={styles.note}>{a('unavailable')}</Text>}
      <Text style={styles.label}>{a('email')}</Text>
      <TextInput accessibilityLabel={a('email')} value={email} onChangeText={setEmail} editable={!sent && !busy}
        autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="email" style={styles.input} />
      {sent ? <>
        <Text style={styles.label}>{a('code')}</Text>
        <TextInput accessibilityLabel={a('code')} value={code} onChangeText={setCode} editable={!busy}
          keyboardType="number-pad" autoComplete="one-time-code" textContentType="oneTimeCode" maxLength={10} style={styles.input} />
        <Button disabled={busy} label={a('verify')} onPress={() => void run(() => verifyEmailCode(email.trim().toLowerCase(), code.trim()))} />
        <Button secondary disabled={busy} label={a('resend')} onPress={() => void run(send)} />
        <Button secondary disabled={busy} label={a('change')} onPress={() => { setSent(false); setCode(''); setMessage(''); }} />
      </> : <Button disabled={busy || !auth.providers.email} label={a('send')} onPress={() => void run(send)} />}
      {(message || auth.error) ? <Text accessibilityRole="alert" style={styles.message}>{message || auth.error}</Text> : null}
      <Text style={styles.note}>{a('consent')}</Text>
    </View>
    <Button secondary disabled={busy} label={a('guest')} onPress={() => void run(auth.explore)} />
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F6F5' }, content: { padding: 24, maxWidth: 480, width: '100%', alignSelf: 'center', paddingBottom: 50 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, logo: { fontSize: 42, fontWeight: '900', color: '#19353B', letterSpacing: -3 },
  language: { minHeight: 48, padding: 12, justifyContent: 'center' }, title: { fontSize: 34, lineHeight: 42, fontWeight: '800', color: '#19353B', marginTop: 40 },
  body: { fontSize: 15, lineHeight: 24, color: '#627B79', marginTop: 12 }, form: { marginVertical: 28, gap: 6 }, label: { fontSize: 13, fontWeight: '600', marginTop: 14, color: '#244348' },
  input: { minHeight: 52, padding: 14, backgroundColor: 'white', borderWidth: 1, borderColor: '#CEDDD5', borderRadius: 12, fontSize: 17, color: '#19353B' },
  note: { fontSize: 12, lineHeight: 20, color: '#718580', marginVertical: 8 }, message: { fontSize: 14, lineHeight: 22, color: '#A7503A', paddingVertical: 12 },
});
