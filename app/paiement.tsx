import { useUser } from '@clerk/expo';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { PaymentMethodCard } from '@/components/booking/payment-method-card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { Text } from '@/components/ui/text';
import { TextInputField } from '@/components/ui/text-input-field';
import { PAYMENT_METHODS } from '@/constants/hotel';
import { Colors, Spacing } from '@/constants/theme';
import { computeQuote } from '@/lib/booking';
import { formatAmount } from '@/lib/format';
import { useGuestTokenPresent } from '@/lib/queries/auth';
import { useInitiatePayment } from '@/lib/queries/payments';
import { useReservation } from '@/lib/queries/reservations';
import { useSyncStatus } from '@/lib/queries/sync';
import { useAppStore } from '@/store/app-store';

type Step = 'choose' | 'phone' | 'waiting';

export default function PaiementScreen() {
  const { state, activeReference } = useAppStore();
  const room = state.selectedRoom;
  const quote = room ? computeQuote(room.tarif_nuit, state.search.arrival, state.search.departure, state.paymentOption) : null;

  const [step, setStep] = useState<Step>('choose');
  const [methodId, setMethodId] = useState<(typeof PAYMENT_METHODS)[number]['id'] | null>(null);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const initiatePayment = useInitiatePayment();
  const reservationQuery = useReservation(step === 'waiting' ? activeReference : null, { poll: true });
  const statut = reservationQuery.data?.statut;
  const syncStatus = useSyncStatus();
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();
  const hasGuestToken = useGuestTokenPresent();
  const hasAccess = isSignedIn || hasGuestToken;

  useEffect(() => {
    if (step === 'waiting' && statut && statut !== 'en_attente') {
      router.replace('/confirmation');
    }
  }, [step, statut]);

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === methodId);

  const runInitiate = (telephonePaiement: string) => {
    if (!activeReference || !quote) return;
    initiatePayment.mutate(
      { reference: activeReference, montant: quote.due, modePaiement: methodId!, telephonePaiement },
      { onSuccess: () => setStep('waiting') }
    );
  };

  const chooseMethod = (id: (typeof PAYMENT_METHODS)[number]['id']) => {
    setMethodId(id);
    const method = PAYMENT_METHODS.find((m) => m.id === id);
    if (method?.requiresPhone) {
      setStep('phone');
    } else {
      runInitiate('');
    }
  };

  const confirmPhone = () => {
    if (!phone.trim()) {
      setPhoneError('Renseignez le numéro à débiter.');
      return;
    }
    setPhoneError('');
    runInitiate(phone.trim());
  };

  if (!room || !activeReference || !quote) {
    return (
      <Screen>
        <ScreenHeader title="Paiement" />
        <View style={styles.missing}>
          <Text variant="body" tone="muted" style={styles.missingText}>
            Aucune réservation en cours. Relancez une recherche.
          </Text>
          <Button label="Retour à l'accueil" fullWidth={false} onPress={() => router.replace('/(tabs)')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Paiement" />

      <ScreenScroll paddingTop={Spacing['2xl']}>
        <Text variant="heading" tone="muted" style={styles.amountLabel}>
          Montant à régler
        </Text>
        <Text variant="price" style={styles.amount}>
          {formatAmount(quote.due)}
        </Text>

        {step === 'choose' && syncStatus.isLoading ? (
          <View style={styles.checkingNetwork}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text variant="bodySm" tone="muted" style={styles.checkingNetworkLabel}>
              Vérification du service de paiement…
            </Text>
          </View>
        ) : null}

        {step === 'choose' && !syncStatus.isLoading && syncStatus.data?.isOnline && isUserLoaded && !hasAccess ? (
          <View style={styles.unavailable}>
            <Text variant="bodyLg" style={styles.unavailableTitle}>
              Connexion requise
            </Text>
            <Text variant="bodySm" tone="muted" style={styles.unavailableHint}>
              Le paiement en ligne nécessite de vous identifier. Connectez-vous, continuez avec
              votre e-mail, ou réglez votre séjour à l&apos;arrivée.
            </Text>
            <Button
              label="Se connecter"
              onPress={() => router.push('/login')}
              style={styles.confirmButton}
            />
            <Button
              label="Continuer avec mon e-mail"
              variant="outline"
              onPress={() => router.push('/auth/otp')}
              style={styles.confirmButton}
            />
            <Button
              label="Payer à l'arrivée"
              variant="outline"
              onPress={() => router.replace('/(tabs)/sejour')}
              style={styles.confirmButton}
            />
          </View>
        ) : null}

        {step === 'choose' && !syncStatus.isLoading && syncStatus.data?.isOnline && hasAccess ? (
          <>
            <Text variant="sectionTitle" style={styles.methodsLabel}>
              Choisissez un mode de paiement
            </Text>
            <View style={styles.methods}>
              {PAYMENT_METHODS.map((method) => (
                <PaymentMethodCard key={method.id} method={method} onPress={() => chooseMethod(method.id)} />
              ))}
            </View>

            <View style={styles.secure}>
              <Icon name="lock" size={14} color={Colors.textSubtle} />
              <Text variant="caption" tone="subtle" style={styles.secureLabel}>
                Paiement sécurisé. Une connexion active est requise.
              </Text>
            </View>
          </>
        ) : null}

        {step === 'choose' && !syncStatus.isLoading && !syncStatus.data?.isOnline ? (
          <View style={styles.unavailable}>
            <Text variant="bodyLg" style={styles.unavailableTitle}>
              Paiement indisponible
            </Text>
            <Text variant="bodySm" tone="muted" style={styles.unavailableHint}>
              Votre réservation a bien été enregistrée. Le paiement en ligne est momentanément
              indisponible. Notre équipe vous contactera sous peu pour finaliser le règlement.
            </Text>
            <Button
              label="Revérifier la connexion"
              variant="outline"
              onPress={() => syncStatus.refetch()}
              style={styles.confirmButton}
            />
            <Button
              label="Voir ma réservation"
              onPress={() => router.replace('/(tabs)/sejour')}
              style={styles.confirmButton}
            />
          </View>
        ) : null}

        {step === 'phone' && selectedMethod ? (
          <View style={styles.phoneStep}>
            <Text variant="sectionTitle" style={styles.methodsLabel}>
              Numéro {selectedMethod.name}
            </Text>
            <TextInputField
              label="Téléphone à débiter"
              value={phone}
              onChangeText={(value) => {
                setPhone(value);
                setPhoneError('');
              }}
              placeholder="+241 6X XX XX XX"
              keyboardType="phone-pad"
              error={phoneError}
            />
            <Button
              label="Confirmer"
              onPress={confirmPhone}
              loading={initiatePayment.isPending}
              style={styles.confirmButton}
            />
            {initiatePayment.isError ? (
              <Text variant="caption" tone="destructive" style={styles.error}>
                {initiatePayment.error instanceof Error ? initiatePayment.error.message : 'Échec de l’initiation.'}
              </Text>
            ) : null}
          </View>
        ) : null}

        {step === 'waiting' ? (
          <View style={styles.processing}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text variant="bodyLg" style={styles.processingTitle}>
              En attente de confirmation
            </Text>
            <Text variant="bodySm" tone="muted" style={styles.processingHint}>
              {selectedMethod?.requiresPhone
                ? 'Composez le code reçu sur votre téléphone pour valider le prélèvement.'
                : 'Le paiement est en cours de traitement par la réception.'}
            </Text>
            <Button
              label="Continuer"
              variant="outline"
              fullWidth={false}
              onPress={() => router.replace('/confirmation')}
              style={styles.continueButton}
            />
          </View>
        ) : null}
      </ScreenScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  amountLabel: { fontSize: 15 },
  amount: { fontSize: 36, lineHeight: 44, marginTop: Spacing.xs },
  methodsLabel: { marginTop: 28, marginBottom: 10 },
  methods: { gap: Spacing.sm + 1 },
  secure: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 22 },
  secureLabel: { flex: 1 },
  checkingNetwork: { alignItems: 'center', gap: Spacing.md, paddingVertical: 50 },
  checkingNetworkLabel: { textAlign: 'center' },
  unavailable: { alignItems: 'center', gap: Spacing.sm, paddingVertical: 30 },
  unavailableTitle: { fontWeight: '500', marginBottom: Spacing.xs },
  unavailableHint: { textAlign: 'center', marginBottom: Spacing.md },
  phoneStep: { marginTop: 4 },
  confirmButton: { marginTop: Spacing.lg },
  error: { marginTop: Spacing.sm },
  processing: { alignItems: 'center', gap: Spacing.lg, paddingVertical: 70 },
  processingTitle: { fontWeight: '500' },
  processingHint: { textAlign: 'center', maxWidth: 250 },
  continueButton: { marginTop: Spacing.sm },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingHorizontal: Spacing.xl },
  missingText: { textAlign: 'center' },
});
