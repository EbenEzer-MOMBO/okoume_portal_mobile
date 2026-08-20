import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { RoomCard } from '@/components/booking/room-card';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { Text } from '@/components/ui/text';
import { TextButton } from '@/components/ui/text-button';
import {
  ALTERNATIVE_DATES,
  AMENITY_FILTERS,
  PRICE_FILTERS,
  ROOMS,
  ROOM_TYPES,
  UNAVAILABLE_ROOM_TYPE,
} from '@/constants/hotel';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { countNights, formatRange, pluralize } from '@/lib/format';
import { useAppStore } from '@/store/app-store';

export default function ResultatsScreen() {
  const { state, actions } = useAppStore();
  const { arrival, departure, roomType, guests } = state.search;

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceFilter, setPriceFilter] = useState<string | null>(null);
  const [amenityFilter, setAmenityFilter] = useState<string | null>(null);

  const nights = countNights(arrival, departure);
  const isUnavailable = roomType === UNAVAILABLE_ROOM_TYPE;

  const openRoom = (roomId: string) => {
    actions.selectRoom(roomId);
    router.push(`/chambre/${roomId}`);
  };

  const toggle = (current: string | null, value: string) => (current === value ? null : value);

  return (
    <Screen>
      <ScreenHeader
        title={formatRange(arrival, departure)}
        subtitle={`${pluralize(nights, 'nuit')} · ${guests} voyageurs · ${roomType}`}
        align="center"
        action={{ icon: 'filters', label: 'Filtrer les résultats', onPress: () => setFiltersOpen(true) }}
      />

      <ScreenScroll paddingHorizontal={Spacing.lg} paddingTop={Spacing.lg}>
        {isUnavailable ? (
          <EmptyState
            icon="calendar"
            title="Aucune disponibilité"
            description={`Aucune ${UNAVAILABLE_ROOM_TYPE.toLowerCase()} n'est libre du ${arrival} au ${departure} septembre. Nos disponibilités les plus proches :`}
            paddingVertical={56}>
            <View style={styles.alternatives}>
              {ALTERNATIVE_DATES.map((slot) => (
                <Pressable
                  key={slot.label}
                  accessibilityRole="button"
                  onPress={() => {
                    actions.setRoomType(ROOM_TYPES[0]);
                    actions.setDates(slot.arrival, slot.departure);
                  }}
                  style={({ pressed }) => [styles.alternative, { opacity: pressed ? 0.8 : 1 }]}>
                  <Text variant="body">{slot.label}</Text>
                  <Text variant="bodySm" tone="accent">
                    Disponible
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextButton
              label="Voir toutes les chambres"
              underline
              onPress={() => actions.setRoomType(ROOM_TYPES[0])}
              style={styles.resetType}
            />
          </EmptyState>
        ) : (
          <View style={styles.list}>
            {ROOMS.map((room) => (
              <RoomCard key={room.id} room={room} onPress={() => openRoom(room.id)} />
            ))}
            <Text variant="caption" tone="subtle" style={styles.count}>
              {ROOMS.length} chambres sur {ROOMS.length} affichées
            </Text>
          </View>
        )}
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
  alternatives: { width: '100%', gap: Spacing.sm, marginTop: Spacing.xs + 2 },
  alternative: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md + 1,
    paddingHorizontal: Spacing.lg - 1,
  },
  resetType: { marginTop: Spacing.sm + 2 },
  filterLabel: { marginBottom: 9 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
});
