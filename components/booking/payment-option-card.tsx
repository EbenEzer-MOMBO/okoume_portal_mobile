import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type PaymentOptionCardProps = {
  label: string;
  hint: string;
  amount: string;
  selected: boolean;
  onPress: () => void;
};

/** Option de règlement (acompte, solde intégral, paiement à l'arrivée). */
export function PaymentOptionCard({ label, hint, amount, selected, onPress }: PaymentOptionCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor: selected ? Colors.ink : Colors.border, opacity: pressed ? 0.9 : 1 },
      ]}>
      <View style={[styles.radio, { borderColor: selected ? Colors.ink : Colors.borderStrong }]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>

      <View style={styles.body}>
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      </View>

      <Text variant="label" style={styles.amount}>
        {amount}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.lg - 1,
  },
  radio: {
    width: 19,
    height: 19,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 9, height: 9, borderRadius: Radius.pill, backgroundColor: Colors.ink },
  body: { flex: 1, gap: 3 },
  label: { fontSize: 14 },
  amount: { fontSize: 14 },
});
