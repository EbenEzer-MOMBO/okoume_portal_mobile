import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MenuCard } from '@/components/restaurant/menu-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { ErrorState, LoadingState } from '@/components/ui/query-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { Text } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';
import { CommandeClient, MenuItem } from '@/lib/api/types';
import { formatAmount } from '@/lib/format';
import { useMyCommandes } from '@/lib/queries/commandes';
import { useMenu } from '@/lib/queries/menu';
import { useRoomServiceCart } from '@/store/room-service-cart';

import { MenuCardSkeleton, OrderCardSkeleton } from '@/components/ui/skeleton';

type MainTab = 'carte' | 'commandes';

const MAIN_TABS = [
  { value: 'carte' as const, label: 'Notre Carte' },
  { value: 'commandes' as const, label: 'Mes Commandes' },
];

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} à ${hours}:${mins}`;
  } catch {
    return dateStr;
  }
}

function getCommandeStatusInfo(statut: string, typeCommande?: string) {
  const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
    en_cours: { label: 'En préparation', bg: 'rgba(176,139,63,0.12)', text: '#B08B3F', border: 'rgba(176,139,63,0.4)' },
    confirmee: { label: 'Confirmée', bg: 'rgba(139,115,85,0.12)', text: '#8B7355', border: 'rgba(139,115,85,0.4)' },
    prete: { label: 'Prête', bg: 'rgba(63,107,79,0.12)', text: '#3F6B4F', border: 'rgba(63,107,79,0.4)' },
    servie: { label: 'Servie', bg: 'rgba(21,22,26,0.1)', text: '#15161A', border: 'rgba(21,22,26,0.3)' },
    payee: { label: 'Terminée', bg: 'rgba(63,107,79,0.2)', text: '#2E5039', border: 'rgba(63,107,79,0.4)' },
    annulee: { label: 'Annulée', bg: 'rgba(154,59,46,0.12)', text: '#9A3B2E', border: 'rgba(154,59,46,0.4)' },
  };

  const config = STATUS_CONFIG[statut] || {
    label: statut,
    bg: 'rgba(21,22,26,0.1)',
    text: '#15161A',
    border: 'rgba(21,22,26,0.3)',
  };

  let displayLabel = config.label;
  if (statut === 'payee' || statut === 'servie') {
    if (typeCommande === 'en_chambre') displayLabel = 'Room Service Effectué';
    else if (typeCommande === 'livraison') displayLabel = 'Livrée';
    else displayLabel = 'Servie';
  }

  return { ...config, displayLabel };
}

function renderPaymentBadge(commande: CommandeClient) {
  if (commande.statut === 'annulee') return null;

  const isPaid = commande.statut === 'payee' || (commande.modePaiement && commande.modePaiement !== 'especes');

  if (isPaid) {
    if (commande.modePaiement === 'chambre') {
      return (
        <View style={[styles.badgeBase, { backgroundColor: 'rgba(28,27,25,0.1)', borderColor: 'rgba(28,27,25,0.4)' }]}>
          <Text style={[styles.badgeText, { color: '#1C1B19' }]}>SUR NOTE DE CHAMBRE</Text>
        </View>
      );
    }
    return (
      <View style={[styles.badgeBase, { backgroundColor: 'rgba(63,107,79,0.15)', borderColor: 'rgba(63,107,79,0.4)' }]}>
        <Text style={[styles.badgeText, { color: '#2E5039' }]}>PAYÉ</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badgeBase, { backgroundColor: 'rgba(154,59,46,0.15)', borderColor: 'rgba(154,59,46,0.4)' }]}>
      <Text style={[styles.badgeText, { color: '#9A3B2E' }]}>NON PAYÉ</Text>
    </View>
  );
}

function CommandeCard({ commande }: { commande: CommandeClient }) {
  const statusInfo = getCommandeStatusInfo(commande.statut, commande.typeCommande);

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderTopBar} />

      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <View style={styles.orderSubHeaderRow}>
            <Text style={styles.orderIdText}>
              CMD #{String(commande.id).padStart(4, '0')}
            </Text>
            {commande.chambre ? (
              <>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.chambreText}>
                  Chambre {commande.chambre.numero}
                </Text>
              </>
            ) : null}
          </View>

          <Text style={styles.orderDateText}>
            {formatDate(commande.createdAt)}
          </Text>

          <View style={styles.badgesRow}>
            <View
              style={[
                styles.badgeBase,
                {
                  backgroundColor: statusInfo.bg,
                  borderColor: statusInfo.border,
                },
              ]}>
              <Text style={[styles.badgeText, { color: statusInfo.text }]}>
                {statusInfo.displayLabel}
              </Text>
            </View>
            {renderPaymentBadge(commande)}
          </View>
        </View>

        <View style={styles.orderHeaderRight}>
          <Text style={styles.orderTotalText}>
            {formatAmount(Number(commande.total) || 0)}
          </Text>
        </View>
      </View>

      <View style={styles.orderItemsList}>
        {commande.items.map((item) => (
          <View key={item.id} style={styles.orderItemRow}>
            <View style={styles.orderItemLeft}>
              <Text style={styles.orderItemQty}>{item.quantite}x</Text>
              <Text style={styles.orderItemName}>{item.nom}</Text>
            </View>
            <Text style={styles.orderItemPrice}>
              {formatAmount(Number(item.prixUnitaire) || 0)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function RestaurantScreen() {
  const insets = useSafeAreaInsets();
  const menu = useMenu();
  const cart = useRoomServiceCart();
  const commandesQuery = useMyCommandes();

  const [mainTab, setMainTab] = useState<MainTab>('carte');
  const [activeCategory, setActiveCategory] = useState('Toutes');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  const available = useMemo(() => (menu.data ?? []).filter((i) => i.disponible), [menu.data]);
  const isMenuLoading = menu.isLoading || (menu.isFetching && available.length === 0);

  const categories = useMemo(() => {
    const hasPlatsDuJour = available.some((i) => i.isPlatDuJour);
    const cats = [...new Set(available.map((i) => i.categorie || 'Autres'))].sort();
    return hasPlatsDuJour ? ['Toutes', 'Plats du Jour', ...cats] : ['Toutes', ...cats];
  }, [available]);

  const filteredMenu = useMemo(() => {
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

  const filteredCommandes = useMemo(() => {
    const all = commandesQuery.data ?? [];
    if (!orderSearchQuery.trim()) return all;
    const q = orderSearchQuery.toLowerCase();
    return all.filter((cmd) => {
      const matchId = String(cmd.id).includes(q) || `cmd #${String(cmd.id).padStart(4, '0')}`.toLowerCase().includes(q);
      const matchChambre = cmd.chambre?.numero ? String(cmd.chambre.numero).toLowerCase().includes(q) : false;
      const matchItem = cmd.items?.some((item) => item.nom.toLowerCase().includes(q));
      const matchStatut = cmd.statut.toLowerCase().includes(q);
      return matchId || matchChambre || matchItem || matchStatut;
    });
  }, [commandesQuery.data, orderSearchQuery]);

  const quantityOf = (id: number) => cart.lines.find((l) => l.item.id === id)?.quantity ?? 0;

  const renderMenuItem = ({ item, index }: { item: MenuItem; index: number }) => (
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
      <ScreenHeader title="Restaurant" subtitle="Notre Carte & Vos Commandes" showBack={false} align="center" />

      {/* Commutateur principal : Carte vs Commandes */}
      <View style={styles.mainTabsContainer}>
        <SegmentedTabs value={mainTab} options={MAIN_TABS} onChange={setMainTab} />
      </View>

      {mainTab === 'carte' ? (
        <>
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

          {/* Recherche Carte */}
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
              data={filteredMenu}
              keyExtractor={(item) => String(item.id)}
              numColumns={2}
              renderItem={renderMenuItem}
              contentContainerStyle={[
                styles.listContent,
                cart.totalItems > 0 && { paddingBottom: 90 + insets.bottom },
              ]}
              ListEmptyComponent={
                <EmptyState title="Aucun plat" description="Aucun plat dans cette catégorie pour le moment." />
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
        </>
      ) : (
        /* Onglet Mes Commandes */
        <View style={styles.ordersContainer}>
          {/* Barre de recherche dans les commandes */}
          {((commandesQuery.data?.length ?? 0) > 0 || orderSearchQuery.length > 0) && (
            <View style={styles.searchBar}>
              <Icon name="search" size={15} color={Colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher par N° commande, plat, chambre..."
                placeholderTextColor={Colors.textMuted}
                value={orderSearchQuery}
                onChangeText={setOrderSearchQuery}
              />
              {orderSearchQuery.length > 0 && (
                <Pressable onPress={() => setOrderSearchQuery('')}>
                  <Icon name="x" size={14} color={Colors.textMuted} />
                </Pressable>
              )}
            </View>
          )}

          {commandesQuery.isLoading && (
            <View style={styles.ordersListContent}>
              <OrderCardSkeleton />
              <OrderCardSkeleton />
              <OrderCardSkeleton />
            </View>
          )}
          {commandesQuery.isError && (
            <ErrorState
              message={commandesQuery.error instanceof Error ? commandesQuery.error.message : undefined}
              onRetry={() => commandesQuery.refetch()}
            />
          )}
          {!commandesQuery.isLoading && !commandesQuery.isError && (
            <FlatList
              data={filteredCommandes}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <CommandeCard commande={item} />}
              contentContainerStyle={styles.ordersListContent}
              refreshControl={
                <RefreshControl
                  refreshing={commandesQuery.isRefetching}
                  onRefresh={commandesQuery.refetch}
                  tintColor={Colors.accent}
                  colors={[Colors.accent]}
                />
              }
              ListEmptyComponent={
                <EmptyState
                  title={orderSearchQuery.trim() ? "Aucun résultat" : "Aucune commande"}
                  description={
                    orderSearchQuery.trim()
                      ? "Aucune commande ne correspond à votre recherche."
                      : "Vous n'avez passé aucune commande pour le moment."
                  }
                />
              }
              showsVerticalScrollIndicator={false}
              style={styles.list}
            />
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  mainTabsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
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

  // Styles commandes
  ordersContainer: { flex: 1 },
  ordersListContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  orderTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.accent,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  orderHeaderLeft: { flex: 1, gap: 2 },
  orderHeaderRight: { alignItems: 'flex-end' },
  orderSubHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderIdText: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.accent,
    fontWeight: '700',
  },
  dotSeparator: { color: Colors.border, fontSize: 10 },
  chambreText: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.textMuted,
  },
  orderDateText: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: Colors.textMuted,
    marginTop: 2,
    marginBottom: 6,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  badgeBase: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  orderTotalText: {
    fontSize: 16,
    color: Colors.ink,
    fontWeight: '600',
  },
  orderItemsList: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderItemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    flex: 1,
  },
  orderItemQty: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: Colors.accent,
    fontWeight: '700',
    marginTop: 1,
  },
  orderItemName: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
  },
  orderItemPrice: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: Colors.textMuted,
    marginLeft: 8,
  },
});
