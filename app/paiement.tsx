import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { PaymentMethodCard } from '@/components/booking/payment-method-card';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { Text } from '@/components/ui/text';
import { PAYMENT_METHODS } from '@/constants/hotel';
import { Colors, Spacing } from '@/constants/theme';
import { formatAmount } from '@/lib/format';
import { useAppStore } from '@/store/app-store';

/** Latence simulée de l'agrégateur de paiement (ms). */
const PAYMENT_DELAY = 2300;

export default function PaiementScreen() {
  const { quote, state, actions } = useAppStore();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  const pay = (methodId: string) => {
    actions.setPaymentMethod(methodId);
    setProcessingId(methodId);
    timeout.current = setTimeout(() => router.replace('/confirmation'), PAYMENT_DELAY);
  };

  const isCard = (processingId ?? state.booking.paymentMethodId) === 'carte';

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

        {processingId ? (
          <View style={styles.processing}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text variant="bodyLg" style={styles.processingTitle}>
              {isCard ? 'Vérification de la carte' : 'En attente de votre validation'}
            </Text>
            <Text variant="bodySm" tone="muted" style={styles.processingHint}>
              {isCard
                ? 'Ne quittez pas cet écran, la banque confirme le paiement.'
                : 'Composez le code reçu sur votre téléphone pour valider le prélèvement.'}
            </Text>
          </View>
        ) : (
          <>
            <Text variant="sectionTitle" style={styles.methodsLabel}>
              Choisissez un mode de paiement
            </Text>
            <View style={styles.methods}>
              {PAYMENT_METHODS.map((method) => (
                <PaymentMethodCard key={method.id} method={method} onPress={() => pay(method.id)} />
              ))}
            </View>

            <View style={styles.secure}>
              <Icon name="lock" size={14} color={Colors.textSubtle} />
              <Text variant="caption" tone="subtle" style={styles.secureLabel}>
                Paiement sécurisé. Une connexion active est requise.
              </Text>
            </View>
          </>
        )}
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
  processing: { alignItems: 'center', gap: Spacing.lg, paddingVertical: 70 },
  processingTitle: { fontWeight: '500' },
  processingHint: { textAlign: 'center', maxWidth: 250 },
});
