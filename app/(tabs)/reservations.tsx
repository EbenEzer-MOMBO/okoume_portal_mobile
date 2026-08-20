import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ReservationCard } from '@/components/booking/reservation-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { Text } from '@/components/ui/text';
import { PAST_RESERVATIONS } from '@/constants/hotel';
import { Spacing } from '@/constants/theme';
import { formatDay } from '@/lib/format';
import { getReservationBadge } from '@/lib/stay';
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
    description: 'Vos séjours terminés et leurs factures seront listés ici.',
  },
};

export default function ReservationsScreen() {
  const { state, room, hasStay } = useAppStore();
  const [tab, setTab] = useState<HistoryTab>('avenir');

  const upcoming = hasStay
    ? [
        {
          id: state.reference,
          roomName: room.name,
          dates: `${formatDay(state.search.arrival)} → ${formatDay(state.search.departure)}`,
          status: getReservationBadge(state.stayStatus),
          onPress: () => router.push('/(tabs)/sejour'),
        },
      ]
    : [];

  const past = PAST_RESERVATIONS.map((reservation) => ({
    id: reservation.id,
    roomName: reservation.roomName,
    dates: reservation.dates,
    status: { label: 'Terminée' as const, tone: 'muted' as const },
    onPress: () => router.push(`/reservation/${reservation.id}`),
  }));

  const items = tab === 'avenir' ? upcoming : past;

  return (
    <Screen>
      <ScreenScroll withTabBar paddingTop={Spacing['2xl']}>
        <Text variant="title">Réservations</Text>

        <View style={styles.tabs}>
          <SegmentedTabs value={tab} options={TABS} onChange={setTab} />
        </View>

        {items.length === 0 ? (
          <EmptyState icon="clock" title={EMPTY_COPY[tab].title} description={EMPTY_COPY[tab].description} />
        ) : (
          <View style={styles.list}>
            {items.map((item) => (
              <ReservationCard
                key={item.id}
                roomName={item.roomName}
                dates={item.dates}
                status={item.status}
                onPress={item.onPress}
              />
            ))}
          </View>
        )}
      </ScreenScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { marginTop: Spacing.lg + 2 },
  list: { gap: Spacing.md - 1, marginTop: Spacing.lg },
});
