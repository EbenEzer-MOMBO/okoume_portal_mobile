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
import { useAppStore } from '@/store/app-store';

/** Latence simulée de l'appel d'authentification (ms). */
const AUTH_DELAY = 950;

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

export default function LoginScreen() {
  const { actions } = useAppStore();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const copy = COPY[mode];

  const submit = () => {
    if (!email.trim() || !password.trim()) {
      setError('Renseignez votre email et votre mot de passe.');
      return;
    }

    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      actions.signIn();
      router.replace('/(tabs)');
    }, AUTH_DELAY);
  };

  const toggleMode = () => {
    setMode((current) => (current === 'login' ? 'signup' : 'login'));
    setError('');
  };

  return (
    <Screen tone="alt" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Card style={styles.card} elevated>
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
          </Card>

          <TextButton label={copy.toggle} onPress={toggleMode} style={styles.toggle} />
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
