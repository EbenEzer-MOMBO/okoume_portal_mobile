import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';

export type FieldProps = {
  label: string;
  /** Icône accent affichée devant le libellé. */
  icon?: IconName;
  error?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Enveloppe libellé + contrôle + message d'erreur. */
export function Field({ label, icon, error, children, style }: FieldProps) {
  return (
    <View style={[styles.field, style]}>
      {icon ? (
        <View style={styles.labelRow}>
          <Icon name={icon} size={14} color={Colors.accent} />
          <Text variant="caption" tone="muted">
            {label}
          </Text>
        </View>
      ) : (
        <Text variant="label">{label}</Text>
      )}
      {children}
      {error ? (
        <Text variant="caption" tone="destructive">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: Spacing.xs + 1 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs + 2 },
});
