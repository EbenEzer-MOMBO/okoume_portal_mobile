import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';

export type QueryStateProps = {
  /** Message d'erreur à afficher ; vide/undefined si pas d'erreur. */
  message?: string;
  onRetry?: () => void;
  paddingVertical?: number;
};

/** État de chargement, centré, aux couleurs du design system. */
export function LoadingState({ paddingVertical = 64 }: { paddingVertical?: number }) {
  return (
    <View style={[styles.container, { paddingVertical }]}>
      <ActivityIndicator size="large" color={Colors.accent} />
    </View>
  );
}

/** État d'erreur réseau/serveur avec message et action de nouvelle tentative. */
export function ErrorState({ message, onRetry, paddingVertical = 64 }: QueryStateProps) {
  return (
    <View style={[styles.container, { paddingVertical }]}>
      <Text variant="body" tone="muted" style={styles.message}>
        {message || "Une erreur est survenue. Vérifiez votre connexion et réessayez."}
      </Text>
      {onRetry ? <Button label="Réessayer" variant="outline" fullWidth={false} onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: Spacing.lg, paddingHorizontal: Spacing.xl },
  message: { textAlign: 'center' },
});
