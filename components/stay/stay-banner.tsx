import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type StayBannerProps = {
  label: string;
  onPress: () => void;
};

/** Rappel de la réservation active, en tête de l'accueil. */
export function StayBanner({ label, onPress }: StayBannerProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Mon séjour : ${label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.banner, { opacity: pressed ? 0.9 : 1 }]}>
      <View style={styles.body}>
        <Text variant="overline" tone="inverseMuted">
          Mon séjour
        </Text>
        <Text variant="label" tone="inverse" style={styles.label}>
          {label}
        </Text>
      </View>
      <Icon name="chevron" size={18} color={Colors.onInkMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    backgroundColor: Colors.ink,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.lg,
  },
  body: { gap: 3 },
  label: { fontSize: 14 },
});
