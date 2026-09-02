import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { RoomCard } from '@/components/booking/room-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState, LoadingState } from '@/components/ui/query-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { Spacing } from '@/constants/theme';
import { useAllRooms } from '@/lib/queries/rooms';
import { useAppStore } from '@/store/app-store';

import { RoomCardSkeleton } from '@/components/ui/skeleton';

export default function ChambresCatalogueScreen() {
  const { actions } = useAppStore();
  const roomsQuery = useAllRooms();
  const rooms = roomsQuery.data ?? [];

  const openRoom = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      actions.selectRoom(room);
      router.push(`/chambre/${roomId}`);
    }
  };

  return (
    <Screen>
      <ScreenHeader
        title="Nos Chambres"
        subtitle="Découvrez notre catalogue de chambres et suites d'exception."
        align="center"
      />

      <ScreenScroll paddingHorizontal={Spacing.lg} paddingTop={Spacing.lg}>
        {roomsQuery.isLoading ? (
          <View style={styles.list}>
            <RoomCardSkeleton />
            <RoomCardSkeleton />
            <RoomCardSkeleton />
          </View>
        ) : null}

        {roomsQuery.isError ? (
          <ErrorState
            message={roomsQuery.error instanceof Error ? roomsQuery.error.message : undefined}
            onRetry={() => roomsQuery.refetch()}
          />
        ) : null}

        {!roomsQuery.isLoading && !roomsQuery.isError && rooms.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="Aucune chambre"
            description="Le catalogue des chambres est actuellement vide ou inaccessible."
            paddingVertical={56}
          />
        ) : null}

        {!roomsQuery.isLoading && !roomsQuery.isError && rooms.length > 0 ? (
          <View style={styles.list}>
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onPress={() => openRoom(room.id)}
              />
            ))}
          </View>
        ) : null}
      </ScreenScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.xl, paddingBottom: Spacing['2xl'] },
});
