import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { SummaryRow } from '@/components/ui/summary-row';
import { Text } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';
import { formatAmount } from '@/lib/format';
import { CartLine, useRoomServiceCart } from '@/store/room-service-cart';

type Props = {
  lines: CartLine[];
  totalAmount: number;
  onSetQuantity: (id: number, quantity: number) => void;
  onClear?: () => void;
};

export function CheckoutCartLines({ lines, totalAmount, onSetQuantity, onClear }: Props) {
  const cart = useRoomServiceCart();
  const handleClear = onClear ?? cart.clear;

  return (
    <>
      {lines.length > 0 && (
        <View style={styles.headerRow}>
          <Text variant="sectionTitle">Votre panier ({lines.length})</Text>
          <Pressable onPress={handleClear} style={styles.clearBtn} accessibilityLabel="Vider le panier">
            <Text style={styles.clearText}>Vider le panier</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.lines}>
        {lines.map((line) => (
          <View key={line.item.id} style={styles.line}>
            <View style={styles.lineHeader}>
              {line.item.photo_url ? (
                <Image source={{ uri: line.item.photo_url }} style={styles.image} contentFit="contain" />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="restaurant" size={20} color={Colors.textSubtle} />
                </View>
              )}
              <View style={styles.lineInfo}>
                <Text variant="bodyLg" style={styles.lineName}>
                  {line.item.nom}
                </Text>
                <Text variant="body" tone="muted">
                  {formatAmount(line.item.prix)}
                </Text>
              </View>

              <View style={styles.quantityControl}>
                <Pressable onPress={() => onSetQuantity(line.item.id, line.quantity - 1)} style={styles.qtyBtn}>
                  <Icon name="minus" size={16} color={Colors.text} />
                </Pressable>
                <Text style={styles.qtyText}>{line.quantity}</Text>
                <Pressable onPress={() => onSetQuantity(line.item.id, line.quantity + 1)} style={styles.qtyBtn}>
                  <Icon name="plus" size={16} color={Colors.text} />
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.totalBox}>
        <SummaryRow label="Total commande" value={formatAmount(totalAmount)} emphasis="total" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.destructive,
  },
  lines: { gap: Spacing.md },
  line: {
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  lineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  imagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineInfo: {
    flex: 1,
    gap: 2,
  },
  lineName: { fontWeight: '600' },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qtyBtn: {
    padding: Spacing.sm,
  },
  qtyText: {
    width: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  totalBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 8,
  },
});
