import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { SummaryRow } from '@/components/ui/summary-row';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { PAST_RESERVATIONS } from '@/constants/hotel';
import { Spacing } from '@/constants/theme';
import { formatAmount, pluralize } from '@/lib/format';

export default function ReservationPasseeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const showToast = useToast();

  const reservation = PAST_RESERVATIONS.find((item) => item.id === id) ?? PAST_RESERVATIONS[0];
  const subtotal = reservation.nights * reservation.nightlyPrice;
  const total = subtotal + reservation.tax;

  return (
    <Screen tone="alt">
      <ScreenHeader title="Séjour passé" />

      <ScreenScroll paddingTop={22}>
        <Text variant="title" style={styles.title}>
          {reservation.roomName}
        </Text>
        <Text variant="bodySm" tone="muted" style={styles.meta}>
          {reservation.meta}
        </Text>
        <View style={styles.badge}>
          <Badge label="Terminée" tone="muted" />
        </View>

        <Card style={styles.details}>
          <SummaryRow label="N° de réservation" value={reservation.reference} />
          <Divider />
          <SummaryRow
            label={`${pluralize(reservation.nights, 'nuit')} × ${formatAmount(reservation.nightlyPrice)}`}
            value={formatAmount(subtotal)}
          />
          <SummaryRow label="Taxe de séjour" value={formatAmount(reservation.tax)} />
          <Divider />
          <SummaryRow label="Total payé" value={formatAmount(total)} emphasis="total" />
          <SummaryRow label="Mode de paiement" value={reservation.paymentLabel} />
        </Card>

        <Button
          label="Télécharger la facture"
          variant="outline"
          icon="download"
          style={styles.invoice}
          onPress={() => showToast(`Facture ${reservation.reference} téléchargée`)}
        />

        <Text variant="caption" tone="subtle" style={styles.notice}>
          Cette réservation est terminée et ne peut plus être modifiée.
        </Text>
      </ScreenScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, lineHeight: 31 },
  meta: { marginTop: Spacing.xs + 2 },
  badge: { marginTop: Spacing.md },
  details: { gap: Spacing.md, marginTop: Spacing.xl },
  invoice: { marginTop: Spacing.xl },
  notice: { marginTop: Spacing.md },
});
