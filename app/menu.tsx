import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MenuItemCard } from '@/components/room-service/menu-item-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState, LoadingState } from '@/components/ui/query-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { SectionTitle } from '@/components/ui/section-title';
import { MenuItem } from '@/lib/api/types';
import { Colors, Spacing } from '@/constants/theme';
import { formatAmount } from '@/lib/format';
import { useMenu } from '@/lib/queries/menu';
import { useRoomServiceCart } from '@/store/room-service-cart';

/** Regroupe le menu par catégorie ; « Autres » pour les plats sans catégorie. */
function groupByCategory(items: MenuItem[]): [string, MenuItem[]][] {
  const groups = new Map<string, MenuItem[]>();
  for (const item of items) {
    const key = item.categorie || 'Autres';
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return Array.from(groups.entries());
}

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const menu = useMenu();
  const cart = useRoomServiceCart();

  const available = useMemo(() => (menu.data ?? []).filter((item) => item.disponible), [menu.data]);
  const groups = useMemo(() => groupByCategory(available), [available]);

  const quantityOf = (id: number) => cart.lines.find((line) => line.item.id === id)?.quantity ?? 0;

  return (
    <Screen>
      <ScreenHeader title="Menu" subtitle="Room service" />

      <ScreenScroll paddingTop={Spacing.lg} contentStyle={cart.totalItems > 0 && styles.scrollWithFooter}>
        {menu.isLoading ? <LoadingState /> : null}

        {menu.isError ? (
          <ErrorState message={menu.error instanceof Error ? menu.error.message : undefined} onRetry={() => menu.refetch()} />
        ) : null}

        {!menu.isLoading && !menu.isError && available.length === 0 ? (
          <EmptyState icon="clock" title="Menu indisponible" description="Aucun plat n'est disponible pour le moment." />
        ) : null}

        {groups.map(([category, items]) => (
          <View key={category}>
            <SectionTitle spacingTop={Spacing.lg}>{category}</SectionTitle>
            <View style={styles.list}>
              {items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  quantity={quantityOf(item.id)}
                  onAdd={() => cart.add(item)}
                  onIncrement={() => cart.setQuantity(item.id, quantityOf(item.id) + 1)}
                  onDecrement={() => cart.setQuantity(item.id, quantityOf(item.id) - 1)}
                />
              ))}
            </View>
          </View>
        ))}
      </ScreenScroll>

      {cart.totalItems > 0 ? (
        <View style={[styles.footer, { paddingBottom: Spacing.lg + insets.bottom }]}>
          <Button
            label={`Voir le panier · ${cart.totalItems} article${cart.totalItems > 1 ? 's' : ''} · ${formatAmount(cart.totalAmount)}`}
            onPress={() => router.push('/room-service-panier')}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollWithFooter: { paddingBottom: 96 },
  list: { gap: Spacing.sm + 1 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.backgroundAlt,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
});
