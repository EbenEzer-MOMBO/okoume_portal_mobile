import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { HotelContactCard } from '@/components/stay/hotel-contact-card';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { SectionTitle } from '@/components/ui/section-title';
import { SummaryRow } from '@/components/ui/summary-row';
import { Text } from '@/components/ui/text';
import { HOTEL } from '@/constants/hotel';
import { Spacing } from '@/constants/theme';
import { formatAmount, formatDay } from '@/lib/format';
import { getPaymentBadge, getStayCopy } from '@/lib/stay';
import { useAppStore } from '@/store/app-store';

export default function SejourScreen() {
  const { state, room, quote, hasStay } = useAppStore();
  const { arrival, departure } = state.search;

  const copy = getStayCopy(state.stayStatus, arrival, departure);
  const paymentBadge = getPaymentBadge(state.booking.paymentOption, state.stayStatus);

  return (
    <Screen>
      <ScreenScroll withTabBar paddingTop={Spacing['2xl']}>
        <Text variant="title">Mon séjour</Text>

        {!hasStay ? (
          <EmptyState
            icon="bed"
            title="Aucun séjour en cours"
            description="Vos réservations à venir apparaîtront ici dès qu'elles seront confirmées."
            paddingVertical={80}
            action={{ label: 'Réserver une chambre', onPress: () => router.push('/(tabs)') }}
          />
        ) : (
          <>
            <Card tone="dark" style={styles.stay}>
              <View style={styles.stayHeader}>
                <Text variant="overline" tone="inverseMuted">
                  {copy.statusLabel}
                </Text>
                <Badge label={paymentBadge.label} tone={paymentBadge.tone} />
              </View>

              <Text variant="title" tone="inverse">
                {copy.headline}
              </Text>
              <Text variant="body" tone="inverseMuted">
                {copy.subtitle}
              </Text>

              <Divider tone="inverse" />

              <View style={styles.stayMeta}>
                <View style={styles.stayMetaItem}>
                  <Text variant="caption" tone="inverseMuted">
                    Chambre
                  </Text>
                  <Text variant="body" tone="inverse">
                    {room.name}
                  </Text>
                </View>
                <View style={styles.stayMetaItem}>
                  <Text variant="caption" tone="inverseMuted">
                    Réservation
                  </Text>
                  <Text variant="mono" tone="inverse">
                    {state.reference}
                  </Text>
                </View>
              </View>
            </Card>

            <Card style={styles.details}>
              <SummaryRow label="Arrivée" value={`${formatDay(arrival)} · ${HOTEL.checkIn}`} />
              <Divider />
              <SummaryRow label="Départ" value={`${formatDay(departure)} · ${HOTEL.checkOut}`} />
              <Divider />
              <SummaryRow label="Solde restant" value={formatAmount(quote.balance)} />
            </Card>

            <SectionTitle>L&apos;hôtel</SectionTitle>
            <HotelContactCard />
          </>
        )}
      </ScreenScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stay: { gap: Spacing.md + 2, marginTop: Spacing.lg, padding: Spacing.xl },
  stayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm + 2 },
  stayMeta: { flexDirection: 'row', gap: 22 },
  stayMetaItem: { gap: 3 },
  details: { gap: Spacing.md, marginTop: Spacing.md + 2 },
});
