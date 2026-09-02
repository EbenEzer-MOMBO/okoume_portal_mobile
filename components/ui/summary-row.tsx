import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text, type TextTone } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';

export type SummaryRowProps = {
  label: string;
  value?: string;
  /** Met en avant la ligne (total, solde). */
  emphasis?: 'none' | 'total';
  tone?: 'default' | 'inverse';
  /** Rend la ligne actionnable et affiche un chevron. */
  onPress?: () => void;
  /** Libellé de l'action à droite (« Modifier »). */
  actionLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** Ligne « libellé / valeur » utilisée dans tous les récapitulatifs. */
export function SummaryRow({
  label,
  value,
  emphasis = 'none',
  tone = 'default',
  onPress,
  actionLabel,
  style,
}: SummaryRowProps) {
  const labelTone: TextTone = tone === 'inverse' ? 'inverseMuted' : 'muted';
  const valueTone: TextTone = tone === 'inverse' ? 'inverse' : 'default';

  const content = (
    <View style={[styles.row, style]}>
      {emphasis === 'total' ? (
        <Text variant="body" style={styles.totalLabel}>
          {label}
        </Text>
      ) : (
        <Text variant="body" tone={labelTone} style={styles.label}>
          {label}
        </Text>
      )}

      {emphasis === 'total' ? (
        <Text variant="price" style={styles.totalValue}>
          {value}
        </Text>
      ) : actionLabel ? (
        <View style={styles.action}>
          <Text variant="body" tone="accent">
            {actionLabel}
          </Text>
          <Icon name="chevron" size={15} color={Colors.accent} />
        </View>
      ) : (
        <Text variant="body" tone={valueTone} style={styles.value}>
          {value}
        </Text>
      )}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  label: { flexShrink: 1 },
  value: { flexShrink: 1, textAlign: 'right' },
  totalLabel: { fontWeight: '600' },
  totalValue: {},
  action: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs + 2 },
});
