import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';
import { formatAmount } from '@/lib/format';
import { CartLine } from '@/store/room-service-cart';
import { OrderType } from './checkout-order-type';
import { PaymentMode } from './checkout-payment';

type Props = {
  orderId: number;
  lines: CartLine[];
  totalAmount: number;
  typeCommande: OrderType;
  modePaiement: PaymentMode;
};

export function CheckoutSuccess({ orderId, lines, totalAmount, typeCommande, modePaiement }: Props) {
  return (
    <>
      <View style={styles.iconCircle}>
        <Icon name="check" size={32} color="#FFFFFF" />
      </View>
      <Text variant="title" style={styles.title}>Commande validée !</Text>
      <Text variant="bodySm" tone="muted" style={styles.subtitle}>Préparation en cours à la cuisine</Text>

      <View style={styles.ticket}>
        <Text variant="overline" tone="muted" style={styles.ticketHeader}>
          Ticket de commande #{orderId}
        </Text>
        <View style={styles.divider} />

        <View style={styles.ticketItems}>
          {lines.map((line) => (
            <View key={line.item.id} style={styles.ticketRow}>
              <Text variant="bodySm" style={{ flex: 1 }}>{line.quantity}x {line.item.nom}</Text>
              <Text variant="bodySm" style={{ fontWeight: '600' }}>{formatAmount(line.quantity * line.item.prix)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />
        <View style={styles.ticketRow}>
          <Text variant="bodySm" tone="muted">Mode</Text>
          <Text variant="bodySm" style={{ textTransform: 'uppercase' }}>{typeCommande}</Text>
        </View>
        <View style={styles.ticketRow}>
          <Text variant="bodySm" tone="muted">Règlement</Text>
          <Text variant="bodySm" style={{ textTransform: 'uppercase' }}>{modePaiement.replace('_', ' ')}</Text>
        </View>
        <View style={styles.ticketRow}>
          <Text variant="bodySm" tone="muted">Total</Text>
          <Text variant="price" style={{ color: Colors.accent }}>{formatAmount(totalAmount)}</Text>
        </View>
      </View>

      <Button label="Fermer" onPress={() => router.replace('/(tabs)/restaurant')} style={styles.closeBtn} />
    </>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.accent,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: { fontSize: 22, fontWeight: '700', color: Colors.ink, textAlign: 'center' },
  subtitle: { textAlign: 'center', marginTop: Spacing.xs, marginBottom: 30 },
  ticket: {
    width: '100%',
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  ticketHeader: { textAlign: 'center', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  ticketItems: { marginVertical: Spacing.sm, gap: Spacing.xs },
  ticketRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 },
  closeBtn: { marginTop: 30, width: '100%' },
});
