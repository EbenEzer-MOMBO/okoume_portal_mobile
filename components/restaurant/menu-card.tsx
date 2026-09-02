/**
 * Carte de plat du menu restaurant — style grille web.
 * Utilisée dans app/menu.tsx et app/(tabs)/restaurant.tsx.
 */
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { MenuItem } from '@/lib/api/types';
import { Colors, Spacing } from '@/constants/theme';
import { formatAmount } from '@/lib/format';

export type MenuCardProps = {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
};

export function MenuCard({ item, quantity, onAdd, onIncrement, onDecrement }: MenuCardProps) {
  const maxStock = typeof item.stock === 'number' && item.stock >= 0 ? item.stock : 20;
  const isUnavailable = item.outOfStock || maxStock <= 0;
  const isMaxReached = quantity >= maxStock;
  const showStockCount = typeof item.stock === 'number' && item.stock > 0 && !isUnavailable;

  return (
    <View style={[styles.card, isUnavailable && styles.cardUnavailable]}>
      {/* Zone photo */}
      <View style={styles.photoBox}>
        {/* Badge rupture */}
        {isUnavailable && (
          <View style={[styles.badge, styles.badgeRed]}>
            <Text style={styles.badgeText}>Rupture</Text>
          </View>
        )}
        {/* Badge plat du jour */}
        {item.isPlatDuJour && !isUnavailable && (
          <View style={[styles.badge, styles.badgeAmber]}>
            <Text style={styles.badgeText}>★ Plat du Jour</Text>
          </View>
        )}

        {item.photo_url ? (
          <Image
            source={{ uri: item.photo_url }}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>Pas d&apos;image</Text>
          </View>
        )}
      </View>

      {/* Infos + actions */}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>{item.nom}</Text>
        {item.description ? (
          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.priceCol}>
            <Text style={styles.price}>{formatAmount(item.prix)}</Text>
            {showStockCount && (
              <Text style={styles.stockLabel}>{item.stock} rest.</Text>
            )}
          </View>

          {isUnavailable ? (
            <View style={styles.unavailableTag}>
              <Text style={styles.unavailableTagText}>Indisponible</Text>
            </View>
          ) : quantity > 0 ? (
            <View style={styles.stepper}>
              <Pressable onPress={onDecrement} style={styles.stepperBtn}>
                <Text style={styles.stepperBtnText}>-</Text>
              </Pressable>
              <Text style={styles.stepperCount}>{quantity}</Text>
              <Pressable
                onPress={onIncrement}
                style={[styles.stepperBtn, isMaxReached && styles.stepperBtnDisabled]}
                disabled={isMaxReached}>
                <Text style={[styles.stepperBtnText, isMaxReached && styles.stepperBtnTextDisabled]}>+</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.addBtn} onPress={onAdd} accessibilityLabel={`Ajouter ${item.nom}`}>
              <Icon name="plus" size={14} color={Colors.onInk} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardUnavailable: { opacity: 0.65 },
  photoBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.backgroundAlt,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  badge: {
    position: 'absolute',
    top: 6,
    zIndex: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeRed: { right: 6, backgroundColor: '#DC2626' },
  badgeAmber: { left: 6, backgroundColor: '#D97706' },
  badgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  photoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  photoPlaceholderText: {
    fontSize: 9,
    color: Colors.textDisabled,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
  },
  body: { padding: Spacing.sm, gap: 4 },
  name: { fontSize: 13, fontWeight: '600', color: Colors.ink, lineHeight: 17 },
  desc: { fontSize: 11, color: Colors.textMuted, lineHeight: 15 },
  footer: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceCol: { gap: 1 },
  price: { fontSize: 11, fontWeight: '700', color: Colors.accent, letterSpacing: 0.3 },
  stockLabel: { fontSize: 9, fontWeight: '600', color: '#D97706' },
  addBtn: {
    width: 26,
    height: 26,
    backgroundColor: Colors.ink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepperBtn: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundAlt,
  },
  stepperBtnText: { fontSize: 15, fontWeight: 'bold', color: Colors.ink },
  stepperBtnDisabled: { opacity: 0.35, backgroundColor: Colors.border },
  stepperBtnTextDisabled: { color: Colors.textDisabled },
  stepperCount: {
    minWidth: 22,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: Colors.ink,
  },
  unavailableTag: {
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unavailableTagText: {
    fontSize: 8,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
});
