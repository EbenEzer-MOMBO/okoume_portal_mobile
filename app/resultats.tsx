import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { RoomCard } from '@/components/booking/room-card';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState, LoadingState } from '@/components/ui/query-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { Text } from '@/components/ui/text';
import { AMENITY_FILTERS, PRICE_FILTERS, ROOM_TYPES } from '@/constants/hotel';
import { Spacing } from '@/constants/theme';
import { countNights, formatRange, pluralize, toISODate } from '@/lib/format';
import { useAvailability } from '@/lib/queries/rooms';
import { useAppStore } from '@/store/app-store';

/** Bornes des filtres de prix (correspond à l'ordre de PRICE_FILTERS). */
const PRICE_RANGES: [number, number][] = [
  [0, 100000],
  [100000, 180000],
  [180000, Infinity],
];

export default function ResultatsScreen() {
  const { state, actions } = useAppStore();
  const { arrival, departure, roomType, guests } = state.search;

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceFilter, setPriceFilter] = useState<string | null>(null);
  const [amenityFilter, setAmenityFilter] = useState<string | null>(null);

  const nights = countNights(arrival, departure);
  const from = toISODate(arrival);
  const to = toISODate(departure);

  const availability = useAvailability(from, to, true);
  const rooms = useMemo(() => availability.data?.chambres ?? [], [availability.data]);

  const filteredRooms = useMemo(() => {
    const guestCount = Number(guests);
    const priceIndex = priceFilter ? PRICE_FILTERS.indexOf(priceFilter) : -1;
    const priceRange = priceIndex >= 0 ? PRICE_RANGES[priceIndex] : null;

    return rooms.filter((room) => {
      if (roomType !== ROOM_TYPES[0] && !room.type_chambre.toLowerCase().includes(roomType.toLowerCase())) {
        return false;
      }
      if (room.capacite < guestCount) return false;
      if (priceRange && (room.tarif_nuit < priceRange[0] || room.tarif_nuit >= priceRange[1])) return false;
      if (amenityFilter && !room.amenites.some((a) => a.toLowerCase().includes(amenityFilter.toLowerCase()))) {
        return false;
      }
      return true;
    });
  }, [rooms, roomType, guests, priceFilter, amenityFilter]);

  const openRoom = (roomId: number) => {
    const room = filteredRooms.find((r) => r.id === roomId);
    if (room) actions.selectRoom(room);
    router.push(`/chambre/${roomId}`);
  };

  const toggle = (current: string | null, value: string) => (current === value ? null : value);
  const clearFilters = () => {
    setPriceFilter(null);
    setAmenityFilter(null);
  };

  return (
    <Screen>
      <ScreenHeader
        title={formatRange(arrival, departure)}
        subtitle={`${pluralize(nights, 'nuit')} · ${state.search.adults || '2'} ad. · ${state.search.children || '0'} enf. · ${roomType}`}
        align="center"
        action={{ icon: 'filters', label: 'Filtrer les résultats', onPress: () => setFiltersOpen(true) }}
      />

      <ScreenScroll paddingHorizontal={Spacing.lg} paddingTop={Spacing.lg}>
        {availability.isLoading ? <LoadingState /> : null}

        {availability.isError ? (
          <ErrorState
            message={availability.error instanceof Error ? availability.error.message : undefined}
            onRetry={() => availability.refetch()}
          />
        ) : null}

        {!availability.isLoading && !availability.isError && filteredRooms.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="Aucune disponibilité"
            description={`Aucune chambre ne correspond à votre recherche du ${arrival} au ${departure} septembre.`}
            paddingVertical={56}
            action={rooms.length > 0 ? { label: 'Réinitialiser les filtres', onPress: clearFilters } : undefined}
          />
        ) : null}

        {!availability.isLoading && !availability.isError && filteredRooms.length > 0 ? (
          <View style={styles.list}>
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} onPress={() => openRoom(room.id)} />
            ))}
            <Text variant="caption" tone="subtle" style={styles.count}>
              {filteredRooms.length} chambre{filteredRooms.length > 1 ? 's' : ''} sur {rooms.length} affichée
              {filteredRooms.length > 1 ? 's' : ''}
            </Text>
          </View>
        ) : null}
      </ScreenScroll>

      <BottomSheet visible={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtres">
        <Text variant="label" style={styles.filterLabel}>
          Prix par nuit
        </Text>
        <View style={styles.chips}>
          {PRICE_FILTERS.map((filter) => (
            <Chip
              key={filter}
              label={filter}
              selected={priceFilter === filter}
              onPress={() => setPriceFilter((current) => toggle(current, filter))}
            />
          ))}
        </View>

        <Text variant="label" style={styles.filterLabel}>
          Équipements
        </Text>
        <View style={styles.chips}>
          {AMENITY_FILTERS.map((filter) => (
            <Chip
              key={filter}
              label={filter}
              selected={amenityFilter === filter}
              onPress={() => setAmenityFilter((current) => toggle(current, filter))}
            />
          ))}
        </View>

        <Button label="Afficher les résultats" onPress={() => setFiltersOpen(false)} />
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.md + 2 },
  count: { textAlign: 'center', paddingVertical: Spacing.sm - 2 },
  filterLabel: { marginBottom: 9 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
});
