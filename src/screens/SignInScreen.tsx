import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../ui/Button';
import { useAuth } from '../auth/AuthContext';
import { authError, socialSignIn } from '../auth/operations';
import { a } from '../locales/accounts';
import { getLanguage } from '../i18n';
import { saveLanguage } from '../languagePreference';
import { environment } from '../environment';

/**
 * Sign-in is social only. There is no email form: an account is created by Google or Apple, and a
 * second provider on the same address is refused with a message naming the one that owns it.
 * Exploring without an account stays available and never becomes a dead end.
 */
export function SignInScreen() {
  const auth = useAuth();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  const [language, updateLanguage] = useState(getLanguage());
  async function run(task: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      await task();
    } catch (e) {
      setMessage(authError(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <View style={styles.top}>
          <Text style={styles.logo}>
            fit<Text style={{ color: '#E97860' }}>in.</Text>
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Language"
            style={styles.language}
            onPress={() => {
              const next = language === 'en' ? 'ko' : 'en';
              updateLanguage(next);
              setMessage('');
              void saveLanguage(next);
            }}
          >
            <Text>{language === 'en' ? '한국어' : 'English'}</Text>
          </Pressable>
        </View>
        {environment === 'development' && <Text style={styles.note}>DEVELOPMENT</Text>}
        <Text style={styles.title}>{a('welcome')}</Text>
        <Text style={styles.body}>{a('subtitle')}</Text>
        <View style={styles.form}>
          <Button
            secondary
            disabled={busy || !auth.providers.apple}
            label={a('apple')}
            onPress={() => void run(() => socialSignIn('apple'))}
          />
          <Button
            secondary
            disabled={busy || !auth.providers.google}
            label={a('google')}
            onPress={() => void run(() => socialSignIn('google'))}
          />
          {(!auth.providers.apple || !auth.providers.google) && (
            <Text style={styles.note}>{a('unavailable')}</Text>
          )}
          {message || auth.error ? (
            <Text accessibilityRole="alert" style={styles.message}>
              {message || auth.error}
            </Text>
          ) : null}
          <Text style={styles.note}>{a('consent')}</Text>
        </View>
        <Button
          secondary
          disabled={busy}
          label={a('guest')}
          onPress={() => void run(auth.explore)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F6F5' },
  content: { padding: 24, maxWidth: 480, width: '100%', alignSelf: 'center', paddingBottom: 50 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: 42, fontWeight: '900', color: '#19353B', letterSpacing: -3 },
  language: { minHeight: 48, padding: 12, justifyContent: 'center' },
  title: { fontSize: 34, lineHeight: 42, fontWeight: '800', color: '#19353B', marginTop: 40 },
  body: { fontSize: 15, lineHeight: 24, color: '#627B79', marginTop: 12 },
  form: { marginVertical: 28, gap: 6 },
  note: { fontSize: 12, lineHeight: 20, color: '#718580', marginVertical: 8 },
  message: { fontSize: 14, lineHeight: 22, color: '#A7503A', paddingVertical: 12 },
});
