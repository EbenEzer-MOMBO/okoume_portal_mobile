// Hooks "legacy" (impératifs, .create()/.status) plutôt que l'API signals par défaut de Core 3.
import { useSignIn, useSignUp } from '@clerk/expo/legacy';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { TextButton } from '@/components/ui/text-button';
import { TextInputField } from '@/components/ui/text-input-field';
import { Spacing } from '@/constants/theme';

type AuthMode = 'login' | 'signup';

const COPY: Record<AuthMode, { title: string; subtitle: string; cta: string; toggle: string }> = {
  login: {
    title: 'Bon retour',
    subtitle: 'Retrouvez vos réservations et vos factures.',
    cta: 'Se connecter',
    toggle: 'Pas encore de compte ? Créer un compte',
  },
  signup: {
    title: 'Créer un compte',
    subtitle: 'Quelques secondes suffisent pour réserver.',
    cta: "S'inscrire",
    toggle: 'Déjà un compte ? Se connecter',
  },
};

/** Message générique quand Clerk ne fournit rien d'exploitable. */
const FALLBACK_ERROR = "Une erreur est survenue. Réessayez dans un instant.";

function extractClerkMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'errors' in err) {
    const clerkErrors = (err as { errors?: { longMessage?: string; message?: string }[] }).errors;
    const first = clerkErrors?.[0];
    if (first?.longMessage) return first.longMessage;
    if (first?.message) return first.message;
  }
  return FALLBACK_ERROR;
}

export default function LoginScreen() {
  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const copy = COPY[mode];

  const submitLogin = async () => {
    if (!signInLoaded) return;
    setError('');
    setLoading(true);
    try {
      const attempt = await signIn.create({ identifier: email.trim(), password });
      if (attempt.status === 'complete') {
        await setActiveSignIn({ session: attempt.createdSessionId });
        router.replace('/(tabs)');
      } else {
        setError(FALLBACK_ERROR);
      }
    } catch (err) {
      setError(extractClerkMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const submitSignup = async () => {
    if (!signUpLoaded) return;
    setError('');
    setLoading(true);
    try {
      const attempt = await signUp.create({ emailAddress: email.trim(), password });
      if (attempt.status === 'complete') {
        await setActiveSignUp({ session: attempt.createdSessionId });
        router.replace('/(tabs)');
        return;
      }
      if (attempt.status === 'missing_requirements' && attempt.unverifiedFields.includes('email_address')) {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setPendingVerification(true);
        return;
      }
      setError(FALLBACK_ERROR);
    } catch (err) {
      setError(extractClerkMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const submitVerification = async () => {
    if (!signUpLoaded) return;
    setError('');
    setLoading(true);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (attempt.status === 'complete') {
        await setActiveSignUp({ session: attempt.createdSessionId });
        router.replace('/(tabs)');
      } else {
        setError('Code invalide. Vérifiez et réessayez.');
      }
    } catch (err) {
      setError(extractClerkMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    if (pendingVerification) {
      if (!code.trim()) {
        setError('Saisissez le code reçu par email.');
        return;
      }
      submitVerification();
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError('Renseignez votre email et votre mot de passe.');
      return;
    }
    if (mode === 'login') submitLogin();
    else submitSignup();
  };

  const toggleMode = () => {
    setMode((current) => (current === 'login' ? 'signup' : 'login'));
    setPendingVerification(false);
    setCode('');
    setError('');
  };

  return (
    <Screen tone="alt" edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Card style={styles.card} elevated>
            {pendingVerification ? (
              <>
                <Text variant="title" style={styles.title}>
                  Vérifiez votre email
                </Text>
                <Text variant="bodySm" tone="muted" style={styles.subtitle}>
                  Un code à 6 chiffres a été envoyé à {email.trim()}.
                </Text>

                <View style={styles.fields}>
                  <TextInputField
                    label="Code de vérification"
                    value={code}
                    onChangeText={(value) => {
                      setCode(value);
                      setError('');
                    }}
                    placeholder="123456"
                    keyboardType="number-pad"
                    error={error}
                    onSubmitEditing={submit}
                    returnKeyType="go"
                  />
                </View>

                <Button label="Vérifier" onPress={submit} loading={loading} style={styles.submit} />
              </>
            ) : (
              <>
                <Text variant="title" style={styles.title}>
                  {copy.title}
                </Text>
                <Text variant="bodySm" tone="muted" style={styles.subtitle}>
                  {copy.subtitle}
                </Text>

                <View style={styles.fields}>
                  <TextInputField
                    label="Adresse email"
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      setError('');
                    }}
                    placeholder="vous@exemple.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                  />
                  <TextInputField
                    label="Mot de passe"
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      setError('');
                    }}
                    placeholder="••••••••"
                    secureTextEntry
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    error={error}
                    onSubmitEditing={submit}
                    returnKeyType="go"
                  />
                </View>

                <Button label={copy.cta} onPress={submit} loading={loading} style={styles.submit} />

                <Text variant="bodySm" tone="muted" style={styles.forgotten}>
                  Mot de passe oublié ?
                </Text>
              </>
            )}
          </Card>

          {!pendingVerification ? <TextButton label={copy.toggle} onPress={toggleMode} style={styles.toggle} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing['2xl'] },
  card: { paddingTop: 28, paddingHorizontal: 22, paddingBottom: Spacing['2xl'] },
  title: { fontSize: 28 },
  subtitle: { marginTop: Spacing.xs + 2 },
  fields: { gap: Spacing.lg, marginTop: Spacing['2xl'] },
  submit: { marginTop: Spacing['2xl'] },
  forgotten: { textAlign: 'center', marginTop: Spacing.lg },
  toggle: { marginTop: 22 },
});
