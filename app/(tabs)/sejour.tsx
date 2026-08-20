import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { HotelContactCard } from '@/components/stay/hotel-contact-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState, LoadingState } from '@/components/ui/query-state';
import { Screen } from '@/components/ui/screen';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { SectionTitle } from '@/components/ui/section-title';
import { SummaryRow } from '@/components/ui/summary-row';
import { Text } from '@/components/ui/text';
import { HOTEL } from '@/constants/hotel';
import { Spacing } from '@/constants/theme';
import { computeQuote } from '@/lib/booking';
import { dayFromISODate, formatAmount, formatDay } from '@/lib/format';
import { useActiveStay } from '@/lib/queries/reservations';
import { getStatutBadge, getStayCopy } from '@/lib/stay';
import { useAppStore } from '@/store/app-store';

export default function SejourScreen() {
  const { state, actions } = useAppStore();
  const { reference, query } = useActiveStay({ poll: true });
  const previousStatut = useRef<string | undefined>(undefined);

  const reservation = query.data;

  useEffect(() => {
    if (reservation && previousStatut.current && previousStatut.current !== reservation.statut) {
      actions.addNotification({
        reference: reservation.reference,
        title: 'Statut de votre séjour mis à jour',
        body: `Votre réservation est maintenant : ${getStatutBadge(reservation.statut).label.toLowerCase()}.`,
        time: 'À l’instant',
        unread: true,
      });
    }
    previousStatut.current = reservation?.statut;
  }, [reservation, actions]);

  if (!reference) {
    return (
      <Screen>
        <ScreenScroll withTabBar paddingTop={Spacing['2xl']}>
          <Text variant="title">Mon séjour</Text>
          <EmptyState
            icon="bed"
            title="Aucun séjour en cours"
            description="Vos réservations à venir apparaîtront ici dès qu'elles seront confirmées."
            paddingVertical={80}
            action={{ label: 'Réserver une chambre', onPress: () => router.push('/(tabs)') }}
          />
        </ScreenScroll>
      </Screen>
    );
  }

  const arrival = reservation ? dayFromISODate(reservation.dateArrivee) : state.search.arrival;
  const departure = reservation ? dayFromISODate(reservation.dateDepart) : state.search.departure;
  const copy = reservation ? getStayCopy(reservation.statut, arrival, departure) : null;

  const room = state.selectedRoom;
  const showPricing = !!room && !!state.paymentOption && room.numero === reservation?.chambre.numero;
  const quote = showPricing ? computeQuote(room!.tarif_nuit, arrival, departure, state.paymentOption) : null;

  return (
    <Screen>
      <ScreenScroll withTabBar paddingTop={Spacing['2xl']}>
        <Text variant="title">Mon séjour</Text>

        {query.isLoading ? <LoadingState /> : null}

        {query.isError ? (
          <ErrorState
            message={query.error instanceof Error ? query.error.message : undefined}
            onRetry={() => query.refetch()}
          />
        ) : null}

        {reservation && copy ? (
          <>
            <Card tone="dark" style={styles.stay}>
              <View style={styles.stayHeader}>
                <Text variant="overline" tone="inverseMuted">
                  {copy.statusLabel}
                </Text>
                <Badge label={getStatutBadge(reservation.statut).label} tone="onDark" />
              </View>

              <Text variant="title" tone="inverse">
                {copy.headline}
              </Text>
              <Text variant="body" tone="inverseMuted">
                {copy.subtitle}
              </Text>

              <Divider tone="inverse" />

              <View style={styles.stayMeta}>
                <View style={styles.stayMetaItem}>
                  <Text variant="caption" tone="inverseMuted">
                    Chambre
                  </Text>
                  <Text variant="body" tone="inverse">
                    {reservation.chambre.type_chambre} · {reservation.chambre.numero}
                  </Text>
                </View>
                <View style={styles.stayMetaItem}>
                  <Text variant="caption" tone="inverseMuted">
                    Réservation
                  </Text>
                  <Text variant="mono" tone="inverse">
                    {reference}
                  </Text>
                </View>
              </View>
            </Card>

            <Card style={styles.details}>
              <SummaryRow label="Arrivée" value={`${formatDay(arrival)} · ${HOTEL.checkIn}`} />
              <Divider />
              <SummaryRow label="Départ" value={`${formatDay(departure)} · ${HOTEL.checkOut}`} />
              {quote ? (
                <>
                  <Divider />
                  <SummaryRow label="Solde restant" value={formatAmount(quote.balance)} />
                </>
              ) : null}
            </Card>

            {reservation.statut === 'checkin' ? (
              <Card style={styles.roomService}>
                <View style={styles.roomServiceBody}>
                  <Text variant="cardTitle">Room service</Text>
                  <Text variant="bodySm" tone="muted">
                    Commandez un repas directement depuis votre chambre.
                  </Text>
                </View>
                <Button label="Voir le menu" fullWidth={false} onPress={() => router.push('/menu')} />
              </Card>
            ) : null}

            <SectionTitle>L&apos;hôtel</SectionTitle>
            <HotelContactCard />
          </>
        ) : null}
      </ScreenScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stay: { gap: Spacing.md + 2, marginTop: Spacing.lg, padding: Spacing.xl },
  stayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm + 2 },
  stayMeta: { flexDirection: 'row', gap: 22 },
  stayMetaItem: { gap: 3 },
  details: { gap: Spacing.md, marginTop: Spacing.md + 2 },
  roomService: { marginTop: Spacing.md + 2, gap: Spacing.md, alignItems: 'flex-start' },
  roomServiceBody: { gap: 3 },
});
