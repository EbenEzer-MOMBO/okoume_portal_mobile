import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { PaymentMethod } from '@/constants/hotel';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type PaymentMethodCardProps = {
  method: PaymentMethod;
  onPress: () => void;
};

/** Mode de paiement sélectionnable (mobile money, agrégateur, carte). */
export function PaymentMethodCard({ method, onPress }: PaymentMethodCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Payer avec ${method.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.9 : 1 }]}>
      {method.logo ? (
        <Image source={method.logo} style={styles.logo} contentFit="contain" transition={120} />
      ) : (
        <View style={[styles.logo, styles.initials, { backgroundColor: method.color }]}>
          <Text variant="label" tone="inverse">
            {method.initials}
          </Text>
        </View>
      )}

      <View style={styles.body}>
        <Text variant="label" style={styles.name}>
          {method.name}
        </Text>
        <Text variant="caption" tone="muted">
          {method.hint}
        </Text>
      </View>

      <Icon name="chevron" size={18} color={Colors.textSubtle} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md + 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.lg - 1,
  },
  logo: { width: 40, height: 40, borderRadius: Radius.sm },
  initials: { alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 2 },
  name: { fontSize: 14 },
});
