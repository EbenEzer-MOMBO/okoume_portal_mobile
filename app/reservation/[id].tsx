import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { ErrorState, LoadingState } from '@/components/ui/query-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { SummaryRow } from '@/components/ui/summary-row';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { Spacing } from '@/constants/theme';
import { dayFromISODate, formatAmount, formatDay } from '@/lib/format';
import { useReservation } from '@/lib/queries/reservations';
import { useSyncStatus } from '@/lib/queries/sync';
import { getStatutBadge } from '@/lib/stay';

export default function ReservationPasseeScreen() {
  const { id: reference } = useLocalSearchParams<{ id: string }>();
  const showToast = useToast();
  const query = useReservation(reference ?? null);
  const syncStatus = useSyncStatus();
  const isServerOnline = syncStatus.data?.isOnline ?? false;
  const reservation = query.data;

  return (
    <Screen tone="alt">
      <ScreenHeader title="Séjour passé" />

      <ScreenScroll paddingTop={22}>
        {query.isLoading ? <LoadingState /> : null}
        {query.isError ? (
          <ErrorState
            message={query.error instanceof Error ? query.error.message : undefined}
            onRetry={() => query.refetch()}
          />
        ) : null}

        {reservation ? (
          <>
            <Text variant="title" style={styles.title}>
              {reservation.chambre.type_chambre}
            </Text>
            <Text variant="bodySm" tone="muted" style={styles.meta}>
              {formatDay(dayFromISODate(reservation.dateArrivee))} →{' '}
              {formatDay(dayFromISODate(reservation.dateDepart))} · Chambre {reservation.chambre.numero}
            </Text>
            <View style={styles.badge}>
              <Badge {...getStatutBadge(reservation.statut)} />
            </View>

            <Card style={styles.details}>
              <SummaryRow label="N° de réservation" value={reservation.reference} />
              <Divider />
              <SummaryRow label="Client" value={reservation.clientNom} />
              {reservation.montantTotal ? (
                <>
                  <Divider />
                  <SummaryRow label="Montant total" value={formatAmount(reservation.montantTotal)} />
                </>
              ) : null}
            </Card>

            {reservation.statut === 'en_attente' ? (
              <Button
                label={isServerOnline ? "Procéder au paiement en ligne" : "Paiement indisponible"}
                disabled={!isServerOnline}
                style={{ marginTop: Spacing.xl }}
                onPress={() => router.push({ pathname: '/paiement', params: { reference: reservation.reference } })}
              />
            ) : (
              <Button
                label="Télécharger la facture"
                variant="outline"
                icon="download"
                style={styles.invoice}
                onPress={() => showToast('Facture bientôt disponible')}
              />
            )}

            <Text variant="caption" tone="subtle" style={styles.notice}>
              Cette réservation est en lecture seule et ne peut plus être modifiée.
            </Text>
          </>
        ) : null}
      </ScreenScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, lineHeight: 31 },
  meta: { marginTop: Spacing.xs + 2 },
  badge: { marginTop: Spacing.md },
  details: { gap: Spacing.md, marginTop: Spacing.xl },
  invoice: { marginTop: Spacing.xl },
  notice: { marginTop: Spacing.md },
});
