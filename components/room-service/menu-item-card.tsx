import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PhotoPlaceholder } from '@/components/ui/photo-placeholder';
import { Text } from '@/components/ui/text';
import { MenuItem } from '@/lib/api/types';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatAmount } from '@/lib/format';

export type MenuItemCardProps = {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
};

/** Ligne du menu room service, avec stepper de quantité une fois ajouté au panier. */
export function MenuItemCard({ item, quantity, onAdd, onIncrement, onDecrement }: MenuItemCardProps) {
  return (
    <View style={styles.card}>
      {item.photo_url ? (
        <Image source={{ uri: item.photo_url }} style={styles.thumbnail} contentFit="cover" />
      ) : (
        <PhotoPlaceholder style={styles.thumbnail} />
      )}

      <View style={styles.body}>
        <Text variant="cardTitle" style={styles.name}>
          {item.nom}
        </Text>
        {item.description ? (
          <Text variant="caption" tone="muted" numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <Text variant="label" tone="accent">
          {formatAmount(item.prix)}
        </Text>
      </View>

      {quantity > 0 ? (
        <View style={styles.stepper}>
          <Pressable accessibilityRole="button" accessibilityLabel="Retirer un" onPress={onDecrement} style={styles.stepperButton}>
            <Icon name="minus" size={14} color={Colors.text} />
          </Pressable>
          <Text variant="label" style={styles.quantity}>
            {quantity}
          </Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Ajouter un" onPress={onIncrement} style={styles.stepperButton}>
            <Icon name="plus" size={14} color={Colors.text} />
          </Pressable>
        </View>
      ) : (
        <Pressable accessibilityRole="button" accessibilityLabel={`Ajouter ${item.nom}`} onPress={onAdd} style={styles.addButton}>
          <Icon name="plus" size={16} color={Colors.onInk} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md + 2,
  },
  thumbnail: { width: 56, height: 56, borderRadius: Radius.sm },
  body: { flex: 1, gap: 3 },
  name: { fontSize: 15 },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  stepperButton: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  quantity: { minWidth: 16, textAlign: 'center' },
});
