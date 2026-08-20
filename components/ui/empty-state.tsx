import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type EmptyStateProps = {
  icon: IconName;
  title: string;
  description: string;
  action?: { label: string; onPress: () => void };
  children?: React.ReactNode;
  paddingVertical?: number;
};

/** État vide standard : médaillon, titre serif, texte d'accompagnement. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  children,
  paddingVertical = 76,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, { paddingVertical }]}>
      <View style={styles.medallion}>
        <Icon name={icon} size={22} color={Colors.accent} />
      </View>
      <Text variant="heading">{title}</Text>
      <Text variant="body" tone="muted" style={styles.description}>
        {description}
      </Text>
      {children}
      {action ? (
        <Button label={action.label} onPress={action.onPress} fullWidth={false} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.md },
  medallion: {
    width: 52,
    height: 52,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: { textAlign: 'center', maxWidth: 260 },
  action: { marginTop: Spacing.sm },
});
