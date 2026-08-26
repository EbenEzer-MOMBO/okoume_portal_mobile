import { router } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { TextInputField } from '@/components/ui/text-input-field';
import { Spacing } from '@/constants/theme';
import { ApiError } from '@/lib/api/client';
import { useSendOtp, useVerifyOtp } from '@/lib/queries/auth';

type Step = 'email' | 'code';

function extractMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

export default function OtpScreen() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  const submitEmail = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Renseignez un e-mail valide.');
      return;
    }
    setError('');
    sendOtp.mutate(email.trim(), {
      onSuccess: () => setStep('code'),
      onError: (err) => setError(extractMessage(err, "Impossible d'envoyer le code.")),
    });
  };

  const submitCode = () => {
    if (!code.trim()) {
      setError('Saisissez le code reçu par e-mail.');
      return;
    }
    setError('');
    verifyOtp.mutate(
      { email: email.trim(), code: code.trim() },
      {
        onSuccess: () => router.back(),
        onError: (err) => setError(extractMessage(err, 'Code invalide.')),
      }
    );
  };

  return (
    <Screen tone="alt" edges={['top', 'bottom']}>
      <ScreenHeader title="Continuer avec mon e-mail" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Image source={require('@/assets/images/splash-icon.png')} style={styles.logo} resizeMode="contain" />

          <Card style={styles.card} elevated>
            {step === 'email' ? (
              <>
                <Text variant="title" style={styles.title}>
                  Sans compte
                </Text>
                <Text variant="bodySm" tone="muted" style={styles.subtitle}>
                  Recevez un code de connexion par e-mail, sans créer de mot de passe.
                </Text>
                <TextInputField
                  label="Adresse e-mail"
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    setError('');
                  }}
                  placeholder="vous@exemple.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={error}
                  style={styles.field}
                  onSubmitEditing={submitEmail}
                  returnKeyType="go"
                />
                <Button label="Recevoir le code" onPress={submitEmail} loading={sendOtp.isPending} style={styles.submit} />
              </>
            ) : (
              <>
                <Text variant="title" style={styles.title}>
                  Vérifiez votre e-mail
                </Text>
                <Text variant="bodySm" tone="muted" style={styles.subtitle}>
                  Un code à 6 chiffres a été envoyé à {email.trim()}.
                </Text>
                <TextInputField
                  label="Code reçu"
                  value={code}
                  onChangeText={(value) => {
                    setCode(value);
                    setError('');
                  }}
                  placeholder="123456"
                  keyboardType="number-pad"
                  error={error}
                  style={styles.field}
                  onSubmitEditing={submitCode}
                  returnKeyType="go"
                />
                <Button label="Vérifier" onPress={submitCode} loading={verifyOtp.isPending} style={styles.submit} />
              </>
            )}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing['2xl'] },
  logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: Spacing.lg },
  card: { paddingTop: 28, paddingHorizontal: 22, paddingBottom: Spacing['2xl'] },
  title: { fontSize: 28 },
  subtitle: { marginTop: Spacing.xs + 2 },
  field: { marginTop: Spacing['2xl'] },
  submit: { marginTop: Spacing.lg },
});
