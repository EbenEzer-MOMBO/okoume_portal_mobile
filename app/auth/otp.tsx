import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Image, ImageBackground, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { TextInputField } from '@/components/ui/text-input-field';
import { Colors, Spacing } from '@/constants/theme';
import { ApiError, apiRequest } from '@/lib/api/client';
import { useSendOtp, useVerifyOtp } from '@/lib/queries/auth';
import { getGuestProfile, setGuestProfile } from '@/lib/auth/guest-session';

type Step = 'email' | 'code' | 'profile';

function extractMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

function OtpPinInput({
  code,
  onChangeCode,
  error,
}: {
  code: string;
  onChangeCode: (val: string) => void;
  error?: string;
}) {
  const inputRef = useRef<TextInput>(null);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const digits = Array.from({ length: 6 }, (_, i) => code[i] || '');

  return (
    <View style={styles.otpPinContainer}>
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={(val) => onChangeCode(val.replace(/[^0-9]/g, '').slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        style={styles.hiddenInput}
        autoFocus
      />
      <Pressable style={styles.boxesRow} onPress={handlePress}>
        {digits.map((digit, idx) => {
          const isFocused = idx === Math.min(code.length, 5);
          return (
            <View
              key={idx}
              style={[
                styles.otpBox,
                digit ? styles.otpBoxFilled : null,
                isFocused ? styles.otpBoxFocused : null,
                error ? styles.otpBoxError : null,
              ]}>
              <Text style={styles.otpDigitText}>{digit}</Text>
            </View>
          );
        })}
      </Pressable>
      {error ? (
        <Text variant="caption" tone="destructive" style={{ marginTop: 8, textAlign: 'center' }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export default function OtpScreen() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  const fetchExistingProfile = async (targetEmail: string) => {
    // 1. Essayer de charger depuis le stockage local invité
    const local = getGuestProfile();
    if (local) {
      if (local.prenom) setPrenom(local.prenom);
      if (local.nom) setNom(local.nom);
      if (local.telephone) setTelephone(local.telephone);
    }

    // 2. Récupérer le profil existant en BDD backend pour cet e-mail
    try {
      const res = await apiRequest<{
        found: boolean;
        client?: { nom: string; prenom: string; telephone: string };
      }>(`/api/auth/profile?email=${encodeURIComponent(targetEmail)}`);

      if (res.found && res.client) {
        if (res.client.prenom) setPrenom(res.client.prenom);
        if (res.client.nom) setNom(res.client.nom);
        if (res.client.telephone) setTelephone(res.client.telephone);
      }
    } catch (e) {
      console.warn('Erreur pré-remplissage profil BDD:', e);
    }
  };

  const submitEmail = () => {
    if (!acceptedTerms) {
      setError("Veuillez accepter les conditions d'utilisation.");
      return;
    }
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
    if (!code.trim() || code.length < 6) {
      setError('Saisissez le code à 6 chiffres reçu par e-mail.');
      return;
    }
    setError('');
    verifyOtp.mutate(
      { email: email.trim(), code: code.trim() },
      {
        onSuccess: () => {
          void fetchExistingProfile(email.trim());
          setStep('profile');
        },
        onError: (err) => setError(extractMessage(err, 'Code invalide.')),
      }
    );
  };

  const submitProfile = async () => {
    if (!prenom.trim()) {
      setError('Renseignez votre prénom.');
      return;
    }
    if (!nom.trim()) {
      setError('Renseignez votre nom.');
      return;
    }
    if (!telephone.trim()) {
      setError('Renseignez votre numéro de téléphone.');
      return;
    }
    setError('');
    await setGuestProfile({
      nom: nom.trim(),
      prenom: prenom.trim(),
      telephone: telephone.trim(),
      email: email.trim(),
    });
    router.replace('/(tabs)');
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Erreur ouverture lien:', err));
  };

  return (
    <Screen tone="alt" edges={['top', 'bottom']}>
      <ImageBackground
        source={require('@/assets/images/hero.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover">
        <View style={styles.darkOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
              <Image source={require('@/assets/images/splash-icon.png')} style={styles.logo} resizeMode="contain" />

              <View style={styles.container}>
                {step === 'email' ? (
                  <>
                    <Text variant="bodySm" style={styles.subtitle}>
                      Recevez un code de connexion par e-mail pour valider votre compte.
                    </Text>
                    
                    <TextInputField
                      label="Adresse e-mail"
                      value={email}
                      onChangeText={(value) => {
                        setEmail(value);
                        setError('');
                      }}
                      placeholder="Renseignez votre e-mail"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      error={error}
                      labelStyle={styles.whiteLabel}
                      style={styles.field}
                      onSubmitEditing={submitEmail}
                      returnKeyType="go"
                    />

                    {/* Case à cocher et conditions d'utilisation avant le bouton */}
                    <Pressable
                      style={styles.checkboxRow}
                      onPress={() => setAcceptedTerms((prev) => !prev)}>
                      <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                        {acceptedTerms && <Icon name="check" size={12} color={Colors.ink} />}
                      </View>
                      <Text variant="caption" style={styles.termsText}>
                        En continuant, vous acceptez les{' '}
                        <Text
                          variant="caption"
                          style={styles.termsLink}
                          onPress={() => openUrl('https://yahotel.ga/conditions-d-utilisation')}>
                          Conditions d'utilisation
                        </Text>
                        {' '}et la{' '}
                        <Text
                          variant="caption"
                          style={styles.termsLink}
                          onPress={() => openUrl('https://yahotel.ga/politique-de-confidentialite')}>
                          Politique de confidentialité
                        </Text>.
                      </Text>
                    </Pressable>

                    <Button
                      label="Recevoir le code"
                      onPress={submitEmail}
                      loading={sendOtp.isPending}
                      disabled={!acceptedTerms || sendOtp.isPending}
                      style={styles.submit}
                    />
                  </>
                ) : step === 'code' ? (
                  <>
                    <Text variant="title" style={styles.title}>
                      Vérifiez votre e-mail
                    </Text>
                    <Text variant="bodySm" style={styles.subtitle}>
                      Un code à 6 chiffres a été envoyé à {email.trim()}.
                    </Text>

                    {/* Remplacement par les 6 cases de saisie du code OTP */}
                    <OtpPinInput
                      code={code}
                      onChangeCode={(val) => {
                        setCode(val);
                        setError('');
                      }}
                      error={error}
                    />

                    <Button
                      label="Vérifier"
                      onPress={submitCode}
                      loading={verifyOtp.isPending}
                      disabled={code.length < 6 || verifyOtp.isPending}
                      style={styles.submit}
                    />
                  </>
                ) : (
                  <>
                    <Text variant="title" style={styles.title}>
                      Identifiez-vous
                    </Text>
                    <Text variant="bodySm" style={styles.subtitle}>
                      Renseignez votre prénom et votre nom pour terminer.
                    </Text>
                    <TextInputField
                      label="Prénom"
                      value={prenom}
                      onChangeText={(value) => {
                        setPrenom(value);
                        setError('');
                      }}
                      placeholder="Jean"
                      autoCapitalize="words"
                      labelStyle={styles.whiteLabel}
                      style={styles.field}
                    />
                    <TextInputField
                      label="Nom"
                      value={nom}
                      onChangeText={(value) => {
                        setNom(value);
                        setError('');
                      }}
                      placeholder="OKOUMBA"
                      autoCapitalize="characters"
                      labelStyle={styles.whiteLabel}
                      style={styles.field}
                    />
                    <TextInputField
                      label="Numéro de téléphone"
                      value={telephone}
                      onChangeText={(value) => {
                        setTelephone(value);
                        setError('');
                      }}
                      placeholder="Ex: 074 00 00 00"
                      keyboardType="phone-pad"
                      error={error}
                      labelStyle={styles.whiteLabel}
                      style={styles.field}
                      onSubmitEditing={submitProfile}
                      returnKeyType="go"
                    />
                    <Button label="Confirmer" onPress={submitProfile} style={styles.submit} />
                  </>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </ImageBackground>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 10, 0.55)',
  },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing['2xl'] },
  logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: Spacing.lg, tintColor: '#FFFFFF' },
  container: { width: '100%' },
  title: { fontSize: 28, color: '#FFFFFF' },
  subtitle: { marginTop: Spacing.xs, color: '#FFFFFF', opacity: 0.9 },
  whiteLabel: { color: '#FFFFFF', fontWeight: '600', marginBottom: 2 },
  field: { marginTop: Spacing.lg },

  // OTP 6 Cases Pin Input
  otpPinContainer: {
    marginTop: Spacing.xl,
    width: '100%',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    borderColor: Colors.ink,
    backgroundColor: '#FFFFFF',
  },
  otpBoxFocused: {
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  otpBoxError: {
    borderColor: Colors.destructive,
  },
  otpDigitText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.ink,
    textAlign: 'center',
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingRight: Spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  checkboxChecked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  termsLink: {
    fontSize: 12,
    lineHeight: 18,
    color: '#FFFFFF',
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
  submit: { marginTop: Spacing.xl },
});
