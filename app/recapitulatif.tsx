import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PaymentOptionCard } from '@/components/booking/payment-option-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { PhotoPlaceholder } from '@/components/ui/photo-placeholder';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { SectionTitle } from '@/components/ui/section-title';
import { SummaryRow } from '@/components/ui/summary-row';
import { Text } from '@/components/ui/text';
import { HOTEL } from '@/constants/hotel';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { PAYMENT_OPTIONS } from '@/lib/booking';
import { formatAmount, formatDay, pluralize } from '@/lib/format';
import { useAppStore } from '@/store/app-store';

export default function RecapitulatifScreen() {
  const { state, room, quote, actions } = useAppStore();
  const insets = useSafeAreaInsets();
  const { arrival, departure, guests } = state.search;
  const { paymentOption } = state.booking;

  const dueLabel =
    paymentOption === 'arrivee'
      ? "À régler aujourd'hui"
      : paymentOption
        ? 'À régler maintenant'
        : 'Choisissez une modalité';

  return (
    <Screen tone="alt">
      <ScreenHeader title="Récapitulatif" />

      <ScreenScroll>
        <Card style={styles.summary}>
          <View style={styles.room}>
            <PhotoPlaceholder style={styles.thumbnail} />
            <View style={styles.roomBody}>
              <Text variant="cardTitle">{room.name}</Text>
              <Text variant="bodySm" tone="muted">
                {room.capacity} personnes · {room.size} · {room.view}
              </Text>
            </View>
          </View>

          <Divider />
          <SummaryRow label="Arrivée" value={`${formatDay(arrival)} · ${HOTEL.checkIn}`} />
          <SummaryRow label="Départ" value={`${formatDay(departure)} · ${HOTEL.checkOut}`} />
          <SummaryRow label="Voyageurs" value={`${guests} personnes`} />

          <Divider />
          <SummaryRow
            label={`${pluralize(quote.nights, 'nuit')} × ${formatAmount(room.price)}`}
            value={formatAmount(quote.subtotal)}
          />
          <SummaryRow label="Taxe de séjour" value={formatAmount(quote.tax)} />
        </Card>

        <SectionTitle>Modalité de paiement</SectionTitle>
        <View style={styles.options}>
          {PAYMENT_OPTIONS.map((option) => (
            <PaymentOptionCard
              key={option.id}
              label={option.label}
              hint={option.hint}
              amount={formatAmount(option.amountOf(quote))}
              selected={paymentOption === option.id}
              onPress={() => actions.setPaymentOption(option.id)}
            />
          ))}
        </View>
      </ScreenScroll>

      <View style={[styles.footer, { paddingBottom: Spacing.xl + insets.bottom }]}>
        <View style={styles.totals}>
          <View style={styles.due}>
            <Text variant="caption" tone="muted">
              {dueLabel}
            </Text>
            <Text variant="price" style={styles.dueAmount}>
              {formatAmount(quote.due)}
            </Text>
          </View>
          <Text variant="caption" tone="muted">
            Total {formatAmount(quote.total)}
          </Text>
        </View>

        <Button
          label="Continuer vers le paiement"
          size="lg"
          disabled={!paymentOption}
          onPress={() => router.push('/paiement')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { gap: Spacing.md, padding: Spacing.lg + 2 },
  room: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md + 1 },
  thumbnail: { width: 62, height: 62, borderRadius: Radius.sm },
  roomBody: { flex: 1, gap: Spacing.xs },
  options: { gap: Spacing.sm + 1 },
  footer: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md + 2,
  },
  totals: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  due: { gap: 2 },
  dueAmount: { fontSize: 24 },
});
