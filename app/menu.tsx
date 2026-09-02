import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MenuCard } from '@/components/restaurant/menu-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { ErrorState, LoadingState } from '@/components/ui/query-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';
import { formatAmount } from '@/lib/format';
import { useMenu } from '@/lib/queries/menu';
import { MenuItem } from '@/lib/api/types';
import { useRoomServiceCart } from '@/store/room-service-cart';
import { MenuCardSkeleton } from '@/components/ui/skeleton';

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const menu = useMenu();
  const cart = useRoomServiceCart();

  const [activeCategory, setActiveCategory] = useState('Toutes');
  const [searchQuery, setSearchQuery] = useState('');

  const available = useMemo(() => (menu.data ?? []).filter((i) => i.disponible), [menu.data]);
  const isMenuLoading = menu.isLoading || (menu.isFetching && available.length === 0);

  const categories = useMemo(() => {
    const hasPlatsDuJour = available.some((i) => i.isPlatDuJour);
    const cats = [...new Set(available.map((i) => i.categorie || 'Autres'))].sort();
    return hasPlatsDuJour ? ['Toutes', 'Plats du Jour', ...cats] : ['Toutes', ...cats];
  }, [available]);

  const filtered = useMemo(() => {
    let items = available;
    if (activeCategory === 'Plats du Jour') {
      items = items.filter((i) => i.isPlatDuJour);
    } else if (activeCategory !== 'Toutes') {
      items = items.filter((i) => (i.categorie || 'Autres') === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) => i.nom.toLowerCase().includes(q) || (i.description ?? '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [available, activeCategory, searchQuery]);

  const quantityOf = (id: number) => cart.lines.find((l) => l.item.id === id)?.quantity ?? 0;

  const renderItem = ({ item, index }: { item: MenuItem; index: number }) => (
    <View style={[styles.cellWrapper, index % 2 === 0 ? styles.cellLeft : styles.cellRight]}>
      <MenuCard
        item={item}
        quantity={quantityOf(item.id)}
        onAdd={() => cart.add(item)}
        onIncrement={() => cart.setQuantity(item.id, quantityOf(item.id) + 1)}
        onDecrement={() => cart.setQuantity(item.id, quantityOf(item.id) - 1)}
      />
    </View>
  );

  return (
    <Screen>
      <ScreenHeader title="Notre Carte" subtitle="Menu restaurant" showBack={false} align="center" />

      {/* Filtres catégories */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[styles.chip, activeCategory === cat && styles.chipActive]}
            >
              <Text style={[styles.chipLabel, activeCategory === cat && styles.chipLabelActive]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Recherche */}
      {available.length > 6 && (
        <View style={styles.searchBar}>
          <Icon name="search" size={15} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un plat..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Icon name="x" size={14} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>
      )}

      {/* États de chargement & contenu */}
      {isMenuLoading ? (
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}
          keyExtractor={(item) => String(item)}
          numColumns={2}
          renderItem={({ index }) => (
            <View style={[styles.cellWrapper, index % 2 === 0 ? styles.cellLeft : styles.cellRight, { marginBottom: Spacing.md }]}>
              <MenuCardSkeleton />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          style={styles.list}
        />
      ) : menu.isError ? (
        <ErrorState
          message={menu.error instanceof Error ? menu.error.message : undefined}
          onRetry={() => menu.refetch()}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            cart.totalItems > 0 && { paddingBottom: 90 + insets.bottom },
          ]}
          ListEmptyComponent={
            <EmptyState icon="clock" title="Aucun plat" description="Aucun plat dans cette catégorie." />
          }
          showsVerticalScrollIndicator={false}
          style={styles.list}
        />
      )}

      {/* Panier flottant */}
      {cart.totalItems > 0 && (
        <View style={[styles.footer, { paddingBottom: Spacing.md + insets.bottom }]}>
          <Button
            label={`Voir le panier · ${cart.totalItems} art. · ${formatAmount(cart.totalAmount)}`}
            onPress={() => router.push('/restaurant-checkout')}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterBar: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  categories: { paddingHorizontal: Spacing.lg, paddingVertical: 8, gap: 4 },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  chipActive: { borderBottomColor: Colors.accent },
  chipLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  chipLabelActive: { color: Colors.ink },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: Colors.text, padding: 0 },
  list: { flex: 1 },
  listContent: { padding: Spacing.md },
  cellWrapper: { flex: 1, maxWidth: '50%' },
  cellLeft: { paddingRight: Spacing.xs / 2 },
  cellRight: { paddingLeft: Spacing.xs / 2 },
  footer: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.backgroundAlt,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
});
