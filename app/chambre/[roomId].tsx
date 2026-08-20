import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PriceBreakdown } from '@/components/booking/price-breakdown';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { PhotoPlaceholder } from '@/components/ui/photo-placeholder';
import { Screen } from '@/components/ui/screen';
import { SectionTitle } from '@/components/ui/section-title';
import { Text } from '@/components/ui/text';
import { ROOMS } from '@/constants/hotel';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { computeQuote } from '@/lib/booking';
import { useAppStore } from '@/store/app-store';

/** Nombre d'emplacements photo du carrousel. */
const PHOTO_COUNT = 3;
const PHOTO_HEIGHT = 300;

export default function ChambreScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { state, actions } = useAppStore();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [photoIndex, setPhotoIndex] = useState(0);

  const room = ROOMS.find((item) => item.id === roomId) ?? ROOMS[0];
  const quote = computeQuote(room, state.search.arrival, state.search.departure, state.booking.paymentOption);

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPhotoIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  const book = () => {
    actions.selectRoom(room.id);
    router.push('/recapitulatif');
  };

  return (
    <Screen edges={[]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.carousel}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScrollEnd}>
            {Array.from({ length: PHOTO_COUNT }).map((_, index) => (
              <PhotoPlaceholder key={index} style={{ width, height: PHOTO_HEIGHT }}>
                <Text variant="mono" tone="accent" style={styles.slot}>
                  photo {index + 1}/{PHOTO_COUNT} — {room.name.toLowerCase()}
                </Text>
              </PhotoPlaceholder>
            ))}
          </ScrollView>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retour"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/resultats'))}
            style={[styles.back, { top: insets.top + Spacing.sm }]}>
            <Icon name="back" size={18} />
          </Pressable>

          <View style={styles.dots}>
            {Array.from({ length: PHOTO_COUNT }).map((_, index) => (
              <View key={index} style={[styles.dot, index === photoIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

        <View style={styles.body}>
          <Text variant="title" style={styles.name}>
            {room.name}
          </Text>
          <Text variant="bodySm" tone="muted" style={styles.meta}>
            {room.capacity} personnes · {room.size} · {room.view}
          </Text>
          <Text variant="body" tone="body" style={styles.description}>
            {room.description}
          </Text>

          <SectionTitle>Équipements</SectionTitle>
          <View style={styles.amenities}>
            {room.amenities.map((amenity) => (
              <View key={amenity} style={styles.amenity}>
                <Icon name="check" size={14} color={Colors.accent} />
                <Text variant="bodySm" tone="body" style={styles.amenityLabel}>
                  {amenity}
                </Text>
              </View>
            ))}
          </View>

          <Card style={styles.price}>
            <PriceBreakdown quote={quote} nightlyPrice={room.price} />
          </Card>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Spacing.xl + insets.bottom }]}>
        <Button label="Réserver" size="lg" onPress={book} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: Spacing['3xl'] },
  carousel: { height: PHOTO_HEIGHT },
  slot: { fontSize: 11 },
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
  dots: { position: 'absolute', bottom: Spacing.lg, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm - 2 },
  dot: { width: 7, height: 7, borderRadius: Radius.pill, backgroundColor: Colors.dotInactive },
  dotActive: { backgroundColor: Colors.ink },
  body: { paddingHorizontal: Spacing.xl, paddingTop: 22 },
  name: { fontSize: 29 },
  meta: { marginTop: Spacing.xs + 2 },
  description: { marginTop: Spacing.lg, lineHeight: 23 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', rowGap: Spacing.sm + 2, columnGap: Spacing.md + 2 },
  amenity: { width: '46%', flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  amenityLabel: { flexShrink: 1 },
  price: { marginTop: Spacing['2xl'] },
  footer: {
    backgroundColor: Colors.backgroundAlt,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md + 2,
  },
});
