import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ReservationCard } from '@/components/booking/reservation-card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/query-state';
import { Screen } from '@/components/ui/screen';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { dayFromISODate, formatDay } from '@/lib/format';
import { useTrackedReservations } from '@/lib/queries/reservations';
import { getStatutBadge } from '@/lib/stay';

type HistoryTab = 'avenir' | 'passees';

const TABS = [
  { value: 'avenir' as const, label: 'À venir' },
  { value: 'passees' as const, label: 'Passées' },
];

const EMPTY_COPY: Record<HistoryTab, { title: string; description: string }> = {
  avenir: {
    title: 'Aucune réservation à venir',
    description: 'Réservez une chambre pour la voir apparaître ici.',
  },
  passees: {
    title: 'Aucun séjour passé',
    description: 'Vos séjours terminés et leurs factures seront listés ici.',
  },
};

export default function ReservationsScreen() {
  const [tab, setTab] = useState<HistoryTab>('avenir');
  const queries = useTrackedReservations();

  const isLoading = queries.isLoading;
  const reservations = queries.reservations;

  const upcoming = reservations.filter((r) => r.statut !== 'checkout' && r.statut !== 'annulee');
  const past = reservations.filter((r) => r.statut === 'checkout' || r.statut === 'annulee');
  const items = tab === 'avenir' ? upcoming : past;

  return (
    <Screen>
      <ScreenScroll withTabBar paddingTop={Spacing['2xl']}>
        <Text variant="title">Réservations</Text>

        <View style={styles.tabs}>
          <SegmentedTabs value={tab} options={TABS} onChange={setTab} />
        </View>

        {isLoading ? <LoadingState /> : null}

        {!isLoading && items.length === 0 ? (
          <EmptyState icon="clock" title={EMPTY_COPY[tab].title} description={EMPTY_COPY[tab].description} />
        ) : null}

        {!isLoading && items.length > 0 ? (
          <View style={styles.list}>
            {items.map((reservation) => (
              <ReservationCard
                key={reservation.reference}
                roomName={reservation.chambre.type_chambre}
                dates={`${formatDay(dayFromISODate(reservation.dateArrivee))} → ${formatDay(dayFromISODate(reservation.dateDepart))}`}
                status={getStatutBadge(reservation.statut)}
                onPress={() => router.push(`/reservation/${reservation.reference}`)}
              />
            ))}
          </View>
        ) : null}
      </ScreenScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { marginTop: Spacing.lg + 2 },
  list: { gap: Spacing.md - 1, marginTop: Spacing.lg },
});
