import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { SummaryRow } from '@/components/ui/summary-row';
import { Text } from '@/components/ui/text';
import { TextInputField } from '@/components/ui/text-input-field';
import { Colors, Spacing } from '@/constants/theme';
import { formatAmount } from '@/lib/format';
import { useCreateRoomServiceOrder } from '@/lib/queries/room-service';
import { useActiveStay } from '@/lib/queries/reservations';
import { useAppStore } from '@/store/app-store';
import { useRoomServiceCart } from '@/store/room-service-cart';

export default function RoomServicePanierScreen() {
  const insets = useSafeAreaInsets();
  const cart = useRoomServiceCart();
  const { query: stayQuery } = useActiveStay();
  const { state } = useAppStore();
  const createOrder = useCreateRoomServiceOrder();

  const reservation = stayQuery.data;
  const canOrder = reservation?.statut === 'checkin';

  const submit = () => {
    if (!reservation || !canOrder) return;
    createOrder.mutate(
      {
        chambreNumero: reservation.chambre.numero,
        referenceReservation: reservation.reference,
        items: cart.lines.map((line) => ({ menuItemId: line.item.id, quantite: line.quantity, notes: line.notes || undefined })),
      },
      {
        onSuccess: () => {
          cart.clear();
          router.replace('/(tabs)/sejour');
        },
      }
    );
  };

  return (
    <Screen tone="alt">
      <ScreenHeader title="Panier" subtitle="Room service" />

      <ScreenScroll>
        {cart.lines.length === 0 ? (
          <EmptyState icon="cart" title="Panier vide" description="Ajoutez des plats depuis le menu pour commander." />
        ) : (
          <>
            {!canOrder ? (
              <Text variant="bodySm" tone="destructive" style={styles.warning}>
                {state.selectedRoom
                  ? 'Le room service est disponible uniquement pendant votre séjour (statut « en cours »).'
                  : 'Aucun séjour en cours. Le room service n’est pas disponible.'}
              </Text>
            ) : null}

            <View style={styles.lines}>
              {cart.lines.map((line) => (
                <Card key={line.item.id} style={styles.line}>
                  <View style={styles.lineHeader}>
                    <Text variant="cardTitle" style={styles.lineName}>
                      {line.item.nom}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Retirer ${line.item.nom} du panier`}
                      onPress={() => cart.remove(line.item.id)}>
                      <Icon name="trash" size={16} color={Colors.textSubtle} />
                    </Pressable>
                  </View>
                  <SummaryRow label={`${line.quantity} × ${formatAmount(line.item.prix)}`} value={formatAmount(line.quantity * line.item.prix)} />
                  <TextInputField
                    label="Notes (optionnel)"
                    value={line.notes}
                    onChangeText={(value) => cart.setNotes(line.item.id, value)}
                    placeholder="Sans oignons, etc."
                  />
                </Card>
              ))}
            </View>

            <Card style={styles.total}>
              <Divider />
              <SummaryRow label="Total" value={formatAmount(cart.totalAmount)} emphasis="total" />
            </Card>

            {createOrder.isError ? (
              <Text variant="caption" tone="destructive" style={styles.error}>
                {createOrder.error instanceof Error ? createOrder.error.message : 'Impossible d’envoyer la commande.'}
              </Text>
            ) : null}
          </>
        )}
      </ScreenScroll>

      {cart.lines.length > 0 ? (
        <View style={[styles.footer, { paddingBottom: Spacing.xl + insets.bottom }]}>
          <Button
            label="Commander"
            size="lg"
            disabled={!canOrder}
            loading={createOrder.isPending}
            onPress={submit}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  warning: { marginBottom: Spacing.lg },
  lines: { gap: Spacing.md },
  line: { gap: Spacing.sm + 1 },
  lineHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lineName: { flex: 1 },
  total: { marginTop: Spacing.xl, gap: Spacing.md, padding: Spacing.lg },
  error: { marginTop: Spacing.md },
  footer: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md + 2,
  },
});
