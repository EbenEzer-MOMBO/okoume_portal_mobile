import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PriceBreakdown } from '@/components/booking/price-breakdown';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { PhotoPlaceholder } from '@/components/ui/photo-placeholder';
import { Screen } from '@/components/ui/screen';
import { SectionTitle } from '@/components/ui/section-title';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { computeQuote } from '@/lib/booking';
import { useAppStore } from '@/store/app-store';

const PHOTO_HEIGHT = 300;

export default function ChambreScreen() {
  const { state } = useAppStore();
  const insets = useSafeAreaInsets();

  const room = state.selectedRoom;

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

  const quote = computeQuote(room.tarif_nuit, state.search.arrival, state.search.departure, null);

  const book = () => {
    router.push('/recapitulatif');
  };

  return (
    <Screen edges={[]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.carousel}>
          {room.photo_url ? (
            <Image source={{ uri: room.photo_url }} style={styles.photo} contentFit="cover" />
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
            style={[styles.back, { top: insets.top + Spacing.sm }]}>
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

          {room.amenites.length > 0 ? (
            <>
              <SectionTitle>Équipements</SectionTitle>
              <View style={styles.amenities}>
                {room.amenites.map((amenity) => (
                  <View key={amenity} style={styles.amenity}>
                    <Icon name="check" size={14} color={Colors.accent} />
                    <Text variant="bodySm" tone="body" style={styles.amenityLabel}>
                      {amenity}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          <Card style={styles.price}>
            <PriceBreakdown quote={quote} nightlyPrice={room.tarif_nuit} />
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
  photo: { width: '100%', height: '100%' },
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
  body: { paddingHorizontal: Spacing.xl, paddingTop: 22 },
  name: { fontSize: 29 },
  meta: { marginTop: Spacing.xs + 2 },
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
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingHorizontal: Spacing.xl },
  missingText: { textAlign: 'center' },
});
