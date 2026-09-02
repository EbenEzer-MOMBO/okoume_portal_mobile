import { router, useLocalSearchParams } from 'expo-router';
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
import { apiRequest } from '@/lib/api/client';
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
  const { reference: paramReference } = useLocalSearchParams<{ reference?: string }>();
  const effectiveReference = paramReference || activeReference;

  const room = state.selectedRoom;
  const quote = room ? computeQuote(room.tarif_nuit, state.search.arrival, state.search.departure) : null;

  const [step, setStep] = useState<Step>('choose');
  const [methodId, setMethodId] = useState<(typeof PAYMENT_METHODS)[number]['id'] | null>(null);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [pollingStatus, setPollingStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const initiatePayment = useInitiatePayment();
  const reservationQuery = useReservation(effectiveReference, { poll: step === 'waiting' });
  const statut = reservationQuery.data?.statut;
  const syncStatus = useSyncStatus();
  const hasGuestToken = useGuestTokenPresent();

  const montantTotal = (quote?.total && quote.total > 0)
    ? quote.total
    : (reservationQuery.data?.montantTotal ? Number(reservationQuery.data.montantTotal) : 0);

  useEffect(() => {
    if (step === 'waiting' && statut && statut !== 'en_attente') {
      router.replace('/confirmation');
    }
  }, [step, statut]);

  const handleBack = () => {
    if (step === 'phone') {
      setStep('choose');
      setMethodId(null);
      setPhone('');
      setPhoneError('');
      setErrorMsg('');
      return;
    }
    if (step === 'waiting') {
      setStep('choose');
      setErrorMsg('');
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/reservations');
    }
  };

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === methodId);

  const runInitiate = async (telephonePaiement: string) => {
    if (!effectiveReference || montantTotal <= 0 || !methodId) return;
    setPhoneError('');
    setErrorMsg('');
    setPollingStatus('Initiation du paiement...');

    try {
      const result = await initiatePayment.mutateAsync({
        reference: effectiveReference,
        montant: montantTotal,
        modePaiement: methodId,
        telephonePaiement,
      });

      if (result.transactionId) {
        setStep('waiting');
        setPollingStatus('Attente validation USSD...');

        let attempts = 0;
        let paid = false;
        while (attempts < 60) {
          attempts++;
          await new Promise((r) => setTimeout(r, 2000));
          try {
            const s = await apiRequest<{ isCompleted: boolean; isSuccess: boolean; error?: string; message?: string }>(
              `/api/paiements/status/${result.transactionId}`
            );
            if (s.isCompleted) {
              if (s.isSuccess) {
                paid = true;
                break;
              } else {
                throw new Error(s.error || s.message || 'Paiement échoué ou annulé.');
              }
            }
          } catch (e: any) {
            if (e.message?.includes('échoué') || e.message?.includes('insuffisant') || e.message?.includes('annulé')) {
              throw e;
            }
          }
        }

        if (!paid) throw new Error('Délai dépassé. Veuillez vérifier votre téléphone et réessayer.');
      }

      router.replace('/confirmation');
    } catch (e: any) {
      setStep('phone');
      setErrorMsg(e.message || 'Échec de l’initiation du paiement.');
    } finally {
      setPollingStatus('');
    }
  };

  const chooseMethod = (id: (typeof PAYMENT_METHODS)[number]['id']) => {
    setMethodId(id);
    const method = PAYMENT_METHODS.find((m) => m.id === id);
    if (method?.requiresPhone) {
      setStep('phone');
    } else {
      void runInitiate('');
    }
  };

  const confirmPhone = () => {
    if (!phone.trim()) {
      setPhoneError('Renseignez le numéro à débiter.');
      return;
    }
    setPhoneError('');
    void runInitiate(phone.trim());
  };

  if (reservationQuery.isLoading && !room) {
    return (
      <Screen>
        <ScreenHeader title="Paiement" onBack={handleBack} />
        <View style={styles.checkingNetwork}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text variant="bodySm" tone="muted" style={styles.checkingNetworkLabel}>
            Chargement de votre réservation…
          </Text>
        </View>
      </Screen>
    );
  }

  if (reservationQuery.isError && !room) {
    return (
      <Screen>
        <ScreenHeader title="Paiement" onBack={handleBack} />
        <View style={styles.missing}>
          <Text variant="body" tone="destructive" style={styles.missingText}>
            Impossible de charger la réservation {effectiveReference}.
          </Text>
          <Button label="Réessayer" fullWidth={false} onPress={() => reservationQuery.refetch()} />
        </View>
      </Screen>
    );
  }

  if (!effectiveReference || (!room && !reservationQuery.data)) {
    return (
      <Screen>
        <ScreenHeader title="Paiement" onBack={handleBack} />
        <View style={styles.missing}>
          <Text variant="body" tone="muted" style={styles.missingText}>
            Aucune réservation en cours. Relancez une recherche.
          </Text>
          <Button label="Retour aux réservations" fullWidth={false} onPress={() => router.replace('/(tabs)/reservations')} />
        </View>
      </Screen>
    );
  }

  const roomTitle = room?.type_chambre?.replace(/_/g, ' ') 
    ?? reservationQuery.data?.chambre?.type_chambre?.replace(/_/g, ' ') 
    ?? 'Chambre';
  const roomNumber = room?.numero ?? reservationQuery.data?.chambre?.numero;

  const isPaymentActive = initiatePayment.isPending || step === 'waiting';

  return (
    <Screen>
      <ScreenHeader title="Paiement" onBack={isPaymentActive ? undefined : handleBack} />

      <ScreenScroll paddingTop={Spacing.xl}>
        {/* Encart récapitulatif de la chambre */}
        <View style={styles.reservationSummary}>
          <Text variant="cardTitle" style={styles.summaryRoomTitle}>
            {roomTitle}{roomNumber ? ` — N° ${roomNumber}` : ''}
          </Text>
          <Text variant="caption" tone="muted" style={styles.summaryReference}>
            RÉF. {effectiveReference}
          </Text>
        </View>

        <Text variant="heading" tone="muted" style={styles.amountLabel}>
          Montant à régler
        </Text>
        <Text variant="price" style={styles.amount}>
          {formatAmount(montantTotal)}
        </Text>

        {step === 'choose' && syncStatus.isLoading ? (
          <View style={styles.checkingNetwork}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text variant="bodySm" tone="muted" style={styles.checkingNetworkLabel}>
              Vérification du service de paiement…
            </Text>
          </View>
        ) : null}

        {step === 'choose' && !syncStatus.isLoading && syncStatus.data?.isOnline && !hasGuestToken ? (
          <View style={styles.unavailable}>
            <Text variant="bodyLg" style={styles.unavailableTitle}>
              Identification requise
            </Text>
            <Text variant="bodySm" tone="muted" style={styles.unavailableHint}>
              Le paiement en ligne nécessite de vous identifier via votre e-mail,
              ou réglez votre séjour à l&apos;arrivée.
            </Text>
            <Button
              label="Continuer avec mon e-mail"
              onPress={() => router.push('/auth/otp')}
              style={styles.confirmButton}
            />
            <Button
              label="Payer à l'arrivée"
              variant="outline"
              onPress={() => router.replace('/(tabs)/reservations')}
              style={styles.confirmButton}
            />
          </View>
        ) : null}

        {step === 'choose' && !syncStatus.isLoading && syncStatus.data?.isOnline && hasGuestToken ? (
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
              loading={syncStatus.isRefetching}
              style={styles.confirmButton}
            />
            <Button
              label="Voir ma réservation"
              onPress={() => router.replace('/(tabs)/reservations')}
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
                setErrorMsg('');
              }}
              placeholder="+241 6X XX XX XX"
              keyboardType="phone-pad"
              editable={!initiatePayment.isPending}
              error={phoneError}
            />
            <Button
              label={initiatePayment.isPending ? (pollingStatus || 'Traitement du paiement...') : 'Confirmer'}
              onPress={confirmPhone}
              loading={initiatePayment.isPending}
              disabled={initiatePayment.isPending}
              style={styles.confirmButton}
            />
            
            {/* Bouton "Changer de moyen de paiement" masqué une fois le paiement lancé */}
            {!initiatePayment.isPending ? (
              <Button
                label="Changer de moyen de paiement"
                variant="outline"
                onPress={handleBack}
                style={{ marginTop: Spacing.sm }}
              />
            ) : null}

            {errorMsg ? (
              <Text variant="caption" tone="destructive" style={styles.error}>
                {errorMsg}
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
              Composez le code reçu sur votre téléphone pour valider le prélèvement.
            </Text>
            {pollingStatus ? (
              <Text variant="caption" tone="muted" style={{ marginTop: 4 }}>
                {pollingStatus}
              </Text>
            ) : null}
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
  error: { marginTop: Spacing.md },
  processing: { alignItems: 'center', gap: Spacing.lg, paddingVertical: 70 },
  processingTitle: { fontWeight: '500' },
  processingHint: { textAlign: 'center', maxWidth: 250 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingHorizontal: Spacing.xl },
  missingText: { textAlign: 'center' },
  reservationSummary: {
    padding: Spacing.md,
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    gap: 4,
  },
  summaryRoomTitle: {
    fontSize: 16,
    textTransform: 'capitalize',
  },
  summaryReference: {
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
});
