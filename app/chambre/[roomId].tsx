import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Calendar } from '@/components/ui/calendar';
import { PriceBreakdown } from '@/components/booking/price-breakdown';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { PhotoPlaceholder } from '@/components/ui/photo-placeholder';
import { Screen } from '@/components/ui/screen';
import { SectionTitle } from '@/components/ui/section-title';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { computeQuote } from '@/lib/booking';
import { formatDay } from '@/lib/format';
import { useEquipements, useRoomUnavailableDates } from '@/lib/queries/rooms';
import { useAppStore } from '@/store/app-store';

const PHOTO_HEIGHT = 300;

export default function ChambreScreen() {
  const { state, actions } = useAppStore();
  const insets = useSafeAreaInsets();
  const equipementsQuery = useEquipements();
  const equipements = equipementsQuery.data ?? [];

  const room = state.selectedRoom;
  const unavailableDates = useRoomUnavailableDates(room?.id ?? null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { arrival, departure } = state.search;

  const selectDay = (timestamp: number) => {
    const bookedDates = unavailableDates.data ?? [];

    // Helper: est-ce qu'une date ISO tombe dans [from, to[ ?
    const rangeHasBookedDate = (from: number, to: number): boolean => {
      const cur = new Date(from);
      cur.setHours(0, 0, 0, 0);
      const end = new Date(to);
      end.setHours(0, 0, 0, 0);
      while (cur < end) {
        const iso = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
        if (bookedDates.includes(iso)) return true;
        cur.setDate(cur.getDate() + 1);
      }
      return false;
    };

    if (!arrival || (arrival && departure)) {
      actions.setDates(timestamp, 0);
    } else {
      if (timestamp > arrival) {
        if (rangeHasBookedDate(arrival, timestamp)) {
          // L'intervalle enjambe une date réservée : recommencer depuis cette date
          actions.setDates(timestamp, 0);
        } else {
          actions.setDates(arrival, timestamp);
          setTimeout(() => setIsCalendarOpen(false), 300);
        }
      } else {
        actions.setDates(timestamp, 0);
      }
    }
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/resultats'));

  if (!room) {
    return (
      <Screen edges={['top']}>
        <View style={styles.missing}>
          <Text variant="heading">Chambre introuvable</Text>
          <Text variant="body" tone="muted" style={styles.missingText}>
            Cette fiche n&apos;est plus disponible. Relancez une recherche.
          </Text>
          <Button label="Retour aux résultats" fullWidth={false} onPress={goBack} />
        </View>
      </Screen>
    );
  }

  const photos = room.photos && room.photos.length > 0 ? room.photos : room.photo_url ? [room.photo_url] : [];
  const quote = computeQuote(room.tarif_nuit, state.search.arrival, state.search.departure, null);

  const prevPhoto = () => setPhotoIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  const nextPhoto = () => setPhotoIndex((i) => (i === photos.length - 1 ? 0 : i + 1));

  const book = () => {
    router.push('/recapitulatif');
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Galerie photos */}
        <View style={styles.carousel}>
          {photos.length > 0 ? (
            <>
              <Image source={{ uri: photos[photoIndex] }} style={styles.photo} contentFit="cover" />

              {photos.length > 1 ? (
                <>
                  {/* Flèche gauche */}
                  <Pressable
                    style={[styles.arrow, styles.arrowLeft]}
                    onPress={prevPhoto}
                    accessibilityLabel="Photo précédente"
                  >
                    <Icon name="back" size={16} color={Colors.onInk} />
                  </Pressable>

                  {/* Flèche droite */}
                  <Pressable
                    style={[styles.arrow, styles.arrowRight]}
                    onPress={nextPhoto}
                    accessibilityLabel="Photo suivante"
                  >
                    <Icon name="chevron" size={16} color={Colors.onInk} />
                  </Pressable>

                  {/* Points de pagination */}
                  <View style={styles.dots}>
                    {photos.map((_, i) => (
                      <Pressable
                        key={i}
                        onPress={() => setPhotoIndex(i)}
                        style={[styles.dot, i === photoIndex && styles.dotActive]}
                      />
                    ))}
                  </View>
                </>
              ) : null}
            </>
          ) : (
            <PhotoPlaceholder style={styles.photo}>
              <Text variant="mono" tone="accent" style={styles.slot}>
                chambre {room.numero}
              </Text>
            </PhotoPlaceholder>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retour"
            onPress={goBack}
            style={[styles.back, { top: Spacing.sm }]}>
            <Icon name="back" size={18} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <Text variant="title" style={styles.name}>
            {room.type_chambre}
          </Text>
          <Text variant="bodySm" tone="muted" style={styles.meta}>
            Chambre {room.numero} · {room.capacite} personnes
          </Text>

          {/* Équipements avec icônes image */}
          {room.amenites.length > 0 ? (
            <>
              <SectionTitle>Équipements</SectionTitle>
              <View style={styles.amenities}>
                {room.amenites.map((amenity) => {
                  const eq = equipements.find(
                    (e) => e.nom.toLowerCase() === amenity.toLowerCase()
                  );
                  return (
                    <View key={amenity} style={styles.amenity}>
                      {eq?.iconeUrl ? (
                        <Image
                          source={{ uri: eq.iconeUrl }}
                          style={styles.amenityIcon}
                          contentFit="contain"
                        />
                      ) : (
                        <Icon name="check" size={14} color={Colors.accent} />
                      )}
                      <Text variant="bodySm" tone="body" style={styles.amenityLabel}>
                        {amenity}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : null}

          <View style={styles.price}>
            <View style={styles.dateSelector}>
              <View style={styles.dateSelectorHeader}>
                <Text variant="heading">Période du séjour</Text>
                <Pressable onPress={() => setIsCalendarOpen(true)}>
                  <Text variant="body" tone="accent">Modifier</Text>
                </Pressable>
              </View>
              <Pressable style={styles.dateValues} onPress={() => setIsCalendarOpen(true)}>
                <View style={styles.dateBox}>
                  <Text variant="overline" tone="muted">Arrivée</Text>
                  <Text variant="body">{arrival ? formatDay(arrival) : 'Choisir'}</Text>
                </View>
                <Icon name="chevron" size={16} color={Colors.border} />
                <View style={styles.dateBox}>
                  <Text variant="overline" tone="muted">Départ</Text>
                  <Text variant="body">{departure ? formatDay(departure) : 'Choisir'}</Text>
                </View>
              </Pressable>
              <View style={styles.guestSelector}>
                <Text variant="overline" tone="muted">Voyageurs</Text>
                <View style={styles.guestCounter}>
                  <Pressable
                    onPress={() => actions.setGuests(String(Math.max(1, parseInt(state.search.guests) - 1)))}
                    disabled={parseInt(state.search.guests) <= 1}
                    style={[styles.guestBtn, parseInt(state.search.guests) <= 1 && styles.guestBtnDisabled]}>
                    <Icon name="minus" size={14} color={parseInt(state.search.guests) <= 1 ? Colors.textMuted : Colors.ink} />
                  </Pressable>
                  <Text variant="body" style={styles.guestCount}>{state.search.guests}</Text>
                  <Pressable
                    onPress={() => actions.setGuests(String(Math.min(room.capacite, parseInt(state.search.guests) + 1)))}
                    disabled={parseInt(state.search.guests) >= room.capacite}
                    style={[styles.guestBtn, parseInt(state.search.guests) >= room.capacite && styles.guestBtnDisabled]}>
                    <Icon name="plus" size={14} color={parseInt(state.search.guests) >= room.capacite ? Colors.textMuted : Colors.ink} />
                  </Pressable>
                </View>
              </View>
            </View>

            {arrival > 0 && departure > 0 ? (
              <PriceBreakdown quote={quote} nightlyPrice={room.tarif_nuit} />
            ) : (
              <Text variant="body" tone="muted" style={styles.missingDates}>
                Sélectionnez vos dates pour voir le prix total.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <BottomSheet
        visible={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        title="Sélectionnez vos dates">
        <Calendar
          arrival={arrival}
          departure={departure}
          onSelectDay={selectDay}
          disabledDates={unavailableDates.data ?? []}
        />
        {arrival > 0 && departure > 0 && (
          <View style={{ paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl }}>
             <Button label="Valider" onPress={() => setIsCalendarOpen(false)} />
          </View>
        )}
      </BottomSheet>

      <View style={[styles.footer, { paddingBottom: Spacing.xl + insets.bottom }]}>
        <Button 
          label="Réserver" 
          size="lg" 
          onPress={book} 
          disabled={!arrival || !departure} 
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: Spacing['3xl'] },
  carousel: { height: PHOTO_HEIGHT, position: 'relative' },
  photo: { width: '100%', height: '100%' },
  slot: { fontSize: 11 },
  arrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowLeft: { left: Spacing.md },
  arrowRight: { right: Spacing.md },
  dots: {
    position: 'absolute',
    bottom: Spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    width: 16,
    backgroundColor: Colors.onInk,
  },
  back: {
    position: 'absolute',
    left: Spacing.md + 2,
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: Spacing.xl, paddingTop: 22 },
  name: {},
  meta: { marginTop: Spacing.xs + 2 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', rowGap: Spacing.sm + 2, columnGap: Spacing.md + 2 },
  amenity: { width: '46%', flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  amenityIcon: { width: 16, height: 16 },
  amenityLabel: { flexShrink: 1 },
  price: { marginTop: Spacing['2xl'], gap: Spacing.xl },
  dateSelector: { gap: Spacing.md },
  dateSelectorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateValues: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.backgroundAlt, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  dateBox: { gap: Spacing.xs },
  guestSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xs },
  guestCounter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  guestBtn: { width: 32, height: 32, borderRadius: Radius.pill, backgroundColor: Colors.backgroundAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  guestBtnDisabled: { borderColor: Colors.backgroundMuted, backgroundColor: Colors.backgroundMuted },
  guestCount: { width: 20, textAlign: 'center' },
  missingDates: { textAlign: 'center', marginVertical: Spacing.md },
  footer: {
    backgroundColor: Colors.backgroundAlt,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md + 2,
  },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingHorizontal: Spacing.xl },
  missingText: { textAlign: 'center' },
});
