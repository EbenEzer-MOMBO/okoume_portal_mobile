import { router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';

import { ReservationCard } from '@/components/booking/reservation-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { ReservationCardSkeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';
import { useTrackedReservations, useActiveStay } from '@/lib/queries/reservations';
import { useSyncStatus } from '@/lib/queries/sync';
import { getStatutBadge } from '@/lib/stay';
import { useAppStore } from '@/store/app-store';

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
    description: 'Vos séjours terminés seront listés ici.',
  },
};

export default function ReservationsScreen() {
  const [tab, setTab] = useState<HistoryTab>('avenir');
  const queries = useTrackedReservations();
  const { query: activeStayQuery } = useActiveStay({ poll: true });
  const syncStatus = useSyncStatus();
  const { actions } = useAppStore();
  const previousStatut = useRef<string | undefined>(undefined);

  const isServerOnline = syncStatus.data?.isOnline ?? false;
  const activeStay = activeStayQuery.data;

  useEffect(() => {
    if (activeStay && previousStatut.current && previousStatut.current !== activeStay.statut) {
      actions.addNotification({
        reference: activeStay.reference,
        title: 'Statut de votre séjour mis à jour',
        body: `Votre réservation est maintenant : ${getStatutBadge(activeStay.statut).label.toLowerCase()}.`,
        time: 'À l’instant',
        unread: true,
      });
    }
    previousStatut.current = activeStay?.statut;
  }, [activeStay, actions]);

  const isLoading = queries.isLoading;
  const reservations = queries.reservations;

  // Trier les réservations de la plus récente à la plus ancienne (par ID ou date d'arrivée décroissante)
  const sortedReservations = [...reservations].sort((a, b) => {
    if (a.id && b.id) return b.id - a.id;
    if (a.dateArrivee && b.dateArrivee) {
      return new Date(b.dateArrivee).getTime() - new Date(a.dateArrivee).getTime();
    }
    return 0;
  });

  // Filtrer les réservations par onglet (À venir vs Passées)
  const upcoming = sortedReservations.filter((r) => r.statut !== 'checkout' && r.statut !== 'annulee');
  const past = sortedReservations.filter((r) => r.statut === 'checkout' || r.statut === 'annulee');
  const items = tab === 'avenir' ? upcoming : past;

  return (
    <Screen>
      <ScreenScroll
        withTabBar
        paddingTop={Spacing['2xl']}
        refreshControl={
          <RefreshControl
            refreshing={queries.isRefetching}
            onRefresh={queries.refetch}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
          />
        }>
        {/* Titre & Compteur */}
        <View style={styles.header}>
          <Text variant="title">Vos Réservations</Text>
          <Text variant="caption" tone="muted" style={styles.counter}>
            {items.length} réservation{items.length > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Onglets À venir / Passées */}
        <View style={styles.tabs}>
          <SegmentedTabs value={tab} options={TABS} onChange={setTab} />
        </View>

        {isLoading ? (
          <View style={styles.list}>
            <ReservationCardSkeleton />
            <ReservationCardSkeleton />
          </View>
        ) : null}

        {!isLoading && items.length === 0 ? (
          <EmptyState title={EMPTY_COPY[tab].title} description={EMPTY_COPY[tab].description} />
        ) : null}

        {/* Liste détaillée des réservations */}
        {!isLoading && items.length > 0 ? (
          <View style={styles.list}>
            {items.map((reservation) => (
              <ReservationCard
                key={reservation.reference}
                reservation={reservation}
                isServerOnline={isServerOnline}
                onRetryServer={() => syncStatus.refetch()}
                onPay={() => {
                  router.push({
                    pathname: '/paiement',
                    params: { reference: reservation.reference },
                  });
                }}
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
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  counter: {
    fontSize: 12,
  },
  tabs: {
    marginTop: Spacing.lg,
  },
  list: {
    gap: Spacing.lg,
    marginTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
});

