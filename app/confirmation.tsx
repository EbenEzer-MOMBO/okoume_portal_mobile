import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Icon } from '@/components/ui/icon';
import { LoadingState } from '@/components/ui/query-state';
import { Screen } from '@/components/ui/screen';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { SummaryRow } from '@/components/ui/summary-row';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { computeQuote } from '@/lib/booking';
import { formatAmount, formatRange } from '@/lib/format';
import { useActiveStay } from '@/lib/queries/reservations';
import { useAppStore } from '@/store/app-store';

const HEADLINE_BY_STATUT: Record<string, string> = {
  en_attente: 'Demande envoyée',
  confirmee: 'Réservation confirmée',
  checkin: 'Réservation confirmée',
  annulee: 'Demande refusée',
};

const SUBTITLE_BY_STATUT: Record<string, string> = {
  en_attente: 'La réception va examiner votre demande et vous répondra sous 24 h.',
  confirmee: 'Un email de confirmation vous a été envoyé.',
  checkin: 'Un email de confirmation vous a été envoyé.',
  annulee: 'Cette demande n’a pas pu être confirmée. Contactez la réception.',
};

export default function ConfirmationScreen() {
  const { state } = useAppStore();
  const { reference, query } = useActiveStay();
  const insets = useSafeAreaInsets();
  const showToast = useToast();
  const room = state.selectedRoom;

  const copyReference = async () => {
    if (!reference) return;
    await Clipboard.setStringAsync(reference);
    showToast('Numéro de réservation copié');
  };

  if (query.isLoading || !room || !reference) {
    return (
      <Screen>
        <ScreenScroll paddingTop={96}>
          <LoadingState />
        </ScreenScroll>
      </Screen>
    );
  }

  const statut = query.data?.statut ?? 'en_attente';
  const quote = computeQuote(room.tarif_nuit, state.search.arrival, state.search.departure, state.paymentOption);

  return (
    <Screen>
      <ScreenScroll paddingTop={96} contentStyle={styles.content}>
        <View style={styles.check}>
          <Icon name="check" size={28} color={Colors.onInk} />
        </View>

        <Text variant="title" style={styles.title}>
          {HEADLINE_BY_STATUT[statut] ?? HEADLINE_BY_STATUT.en_attente}
        </Text>
        <Text variant="body" tone="muted" style={styles.subtitle}>
          {SUBTITLE_BY_STATUT[statut] ?? SUBTITLE_BY_STATUT.en_attente}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Copier le numéro de réservation"
          onPress={copyReference}
          style={styles.card}>
          <Card style={styles.cardInner}>
            <View style={styles.referenceRow}>
              <Text variant="bodySm" tone="muted">
                N° de réservation
              </Text>
              <View style={styles.reference}>
                <Text variant="mono" tone="accent" style={styles.referenceValue}>
                  {reference}
                </Text>
                <Icon name="copy" size={14} color={Colors.accent} />
              </View>
            </View>

            <Divider />
            <SummaryRow label="Séjour" value={formatRange(state.search.arrival, state.search.departure)} />
            <SummaryRow label="Chambre" value={room.type_chambre} />
            <SummaryRow label="Montant" value={formatAmount(quote.due)} />
          </Card>
        </Pressable>
      </ScreenScroll>

      <View style={[styles.footer, { paddingBottom: Spacing.xl + insets.bottom }]}>
        <Button label="Voir mes réservations" size="lg" onPress={() => router.replace('/(tabs)/reservations')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center' },
  check: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 32, lineHeight: 37, textAlign: 'center', marginTop: 22 },
  subtitle: { textAlign: 'center', marginTop: Spacing.sm + 2, maxWidth: 270 },
  card: { width: '100%', marginTop: 26 },
  cardInner: { gap: Spacing.md, padding: Spacing.lg + 2 },
  referenceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reference: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm - 1 },
  referenceValue: { fontSize: 14 },
  footer: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md + 2 },
});
