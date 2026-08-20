import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';

export type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  /** Alignement du titre : à gauche du bouton retour, ou centré entre les actions. */
  align?: 'left' | 'center';
  onBack?: () => void;
  /** Action de droite (filtres…). */
  action?: { icon: Parameters<typeof Icon>[0]['name']; label: string; onPress: () => void };
};

/** En-tête d'écran empilé : retour, titre, action optionnelle. */
export function ScreenHeader({ title, subtitle, align = 'left', onBack, action }: ScreenHeaderProps) {
  const goBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/(tabs)')));

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retour"
        onPress={goBack}
        style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.6 : 1 }]}>
        <Icon name="back" size={20} />
      </Pressable>

      <View style={align === 'center' ? styles.titleCentered : styles.titleLeft}>
        <Text variant="cardTitle" style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" style={align === 'center' && styles.centeredText}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={action.onPress}
          style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.6 : 1 }]}>
          <Icon name={action.icon} size={20} />
        </Pressable>
      ) : (
        align === 'center' && <View style={styles.iconButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  titleLeft: { flex: 1, gap: 2 },
  titleCentered: { flex: 1, alignItems: 'center', gap: 2 },
  title: { fontSize: 15 },
  centeredText: { textAlign: 'center' },
});
