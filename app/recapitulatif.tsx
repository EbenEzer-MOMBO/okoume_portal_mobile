import { useUser } from '@clerk/expo';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PaymentOptionCard } from '@/components/booking/payment-option-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { PhotoPlaceholder } from '@/components/ui/photo-placeholder';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { SectionTitle } from '@/components/ui/section-title';
import { SummaryRow } from '@/components/ui/summary-row';
import { Text } from '@/components/ui/text';
import { TextInputField } from '@/components/ui/text-input-field';
import { HOTEL } from '@/constants/hotel';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { computeQuote, PAYMENT_OPTIONS } from '@/lib/booking';
import { formatAmount, formatDay, pluralize, toISODate } from '@/lib/format';
import { useCreateReservation } from '@/lib/queries/reservations';
import { useAppStore } from '@/store/app-store';

export default function RecapitulatifScreen() {
  const { state, actions } = useAppStore();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const { arrival, departure, guests } = state.search;
  const paymentOption = state.paymentOption;
  const room = state.selectedRoom;

  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [nomError, setNomError] = useState('');
  const [telephoneError, setTelephoneError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const createReservation = useCreateReservation();

  if (!room) {
    return (
      <Screen tone="alt">
        <ScreenHeader title="Récapitulatif" />
        <View style={styles.missing}>
          <Text variant="body" tone="muted" style={styles.missingText}>
            Aucune chambre sélectionnée. Relancez une recherche.
          </Text>
          <Button label="Retour à l'accueil" fullWidth={false} onPress={() => router.replace('/(tabs)')} />
        </View>
      </Screen>
    );
  }

  const quote = computeQuote(room.tarif_nuit, arrival, departure, paymentOption);

  const dueLabel =
    paymentOption === 'arrivee'
      ? "À régler aujourd'hui"
      : paymentOption
        ? 'À régler maintenant'
        : 'Choisissez une modalité';

  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const canSubmit = !!paymentOption && !createReservation.isPending;

  const submit = () => {
    if (!nom.trim()) {
      setNomError('Renseignez votre nom.');
      return;
    }
    if (!telephone.trim()) {
      setTelephoneError('Renseignez votre numéro de téléphone.');
      return;
    }
    setNomError('');
    setTelephoneError('');
    setSubmitError('');

    createReservation.mutate(
      {
        clientNom: nom.trim(),
        clientEmail: email,
        clientTel: telephone.trim(),
        chambreId: room.id,
        dateArrivee: toISODate(arrival),
        dateDepart: toISODate(departure),
      },
      {
        onSuccess: (data) => {
          actions.trackReference(data.reference);
          router.push('/paiement');
        },
        onError: (error) => {
          setSubmitError(error instanceof Error ? error.message : 'Impossible d’envoyer la demande.');
        },
      }
    );
  };

  return (
    <Screen tone="alt">
      <ScreenHeader title="Récapitulatif" />

      <ScreenScroll>
        <Card style={styles.summary}>
          <View style={styles.room}>
            <PhotoPlaceholder style={styles.thumbnail} />
            <View style={styles.roomBody}>
              <Text variant="cardTitle">{room.type_chambre}</Text>
              <Text variant="bodySm" tone="muted">
                Chambre {room.numero} · {room.capacite} personnes
              </Text>
            </View>
          </View>

          <Divider />
          <SummaryRow label="Arrivée" value={`${formatDay(arrival)} · ${HOTEL.checkIn}`} />
          <SummaryRow label="Départ" value={`${formatDay(departure)} · ${HOTEL.checkOut}`} />
          <SummaryRow label="Voyageurs" value={`${guests} personnes`} />

          <Divider />
          <SummaryRow
            label={`${pluralize(quote.nights, 'nuit')} × ${formatAmount(room.tarif_nuit)}`}
            value={formatAmount(quote.subtotal)}
          />
          <SummaryRow label="Taxe de séjour" value={formatAmount(quote.tax)} />
        </Card>

        <SectionTitle>Vos coordonnées</SectionTitle>
        <View style={styles.fields}>
          <TextInputField
            label="Nom complet"
            value={nom}
            onChangeText={(value) => {
              setNom(value);
              setNomError('');
            }}
            placeholder="Votre nom"
            autoCapitalize="words"
            error={nomError}
          />
          <TextInputField
            label="Téléphone"
            value={telephone}
            onChangeText={(value) => {
              setTelephone(value);
              setTelephoneError('');
            }}
            placeholder="+241 6X XX XX XX"
            keyboardType="phone-pad"
            error={telephoneError}
          />
        </View>

        <SectionTitle>Modalité de paiement</SectionTitle>
        <View style={styles.options}>
          {PAYMENT_OPTIONS.map((option) => (
            <PaymentOptionCard
              key={option.id}
              label={option.label}
              hint={option.hint}
              amount={formatAmount(option.amountOf(quote))}
              selected={paymentOption === option.id}
              onPress={() => actions.setPaymentOption(option.id)}
            />
          ))}
        </View>

        {submitError ? (
          <Text variant="caption" tone="destructive" style={styles.submitError}>
            {submitError}
          </Text>
        ) : null}
      </ScreenScroll>

      <View style={[styles.footer, { paddingBottom: Spacing.xl + insets.bottom }]}>
        <View style={styles.totals}>
          <View style={styles.due}>
            <Text variant="caption" tone="muted">
              {dueLabel}
            </Text>
            <Text variant="price" style={styles.dueAmount}>
              {formatAmount(quote.due)}
            </Text>
          </View>
          <Text variant="caption" tone="muted">
            Total {formatAmount(quote.total)}
          </Text>
        </View>

        <Button
          label="Continuer vers le paiement"
          size="lg"
          disabled={!canSubmit}
          loading={createReservation.isPending}
          onPress={submit}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { gap: Spacing.md, padding: Spacing.lg + 2 },
  room: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md + 1 },
  thumbnail: { width: 62, height: 62, borderRadius: Radius.sm },
  roomBody: { flex: 1, gap: Spacing.xs },
  fields: { gap: Spacing.lg },
  options: { gap: Spacing.sm + 1 },
  submitError: { marginTop: Spacing.md },
  footer: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md + 2,
  },
  totals: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  due: { gap: 2 },
  dueAmount: { fontSize: 24 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingHorizontal: Spacing.xl },
  missingText: { textAlign: 'center' },
});
