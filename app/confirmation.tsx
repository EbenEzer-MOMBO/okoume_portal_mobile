import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { SummaryRow } from '@/components/ui/summary-row';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatAmount, formatDay, formatRange } from '@/lib/format';
import { useAppStore } from '@/store/app-store';

export default function ConfirmationScreen() {
  const { state, room, quote, actions } = useAppStore();
  const insets = useSafeAreaInsets();
  const showToast = useToast();
  const { arrival, departure } = state.search;

  const copyReference = async () => {
    await Clipboard.setStringAsync(state.reference);
    showToast('Numéro de réservation copié');
  };

  const finish = () => {
    actions.confirmBooking();
    router.replace('/(tabs)/sejour');
  };

  return (
    <Screen>
      <ScreenScroll paddingTop={96} contentStyle={styles.content}>
        <View style={styles.check}>
          <Icon name="check" size={28} color={Colors.onInk} />
        </View>

        <Text variant="title" style={styles.title}>
          Réservation{'\n'}confirmée
        </Text>
        <Text variant="body" tone="muted" style={styles.subtitle}>
          Un email de confirmation vous a été envoyé. Nous vous attendons le {formatDay(arrival)}.
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
                  {state.reference}
                </Text>
                <Icon name="copy" size={14} color={Colors.accent} />
              </View>
            </View>

            <Divider />
            <SummaryRow label="Séjour" value={formatRange(arrival, departure)} />
            <SummaryRow label="Chambre" value={room.name} />
            <SummaryRow label="Montant payé" value={formatAmount(quote.due)} />
          </Card>
        </Pressable>
      </ScreenScroll>

      <View style={[styles.footer, { paddingBottom: Spacing.xl + insets.bottom }]}>
        <Button label="Voir mon séjour" size="lg" onPress={finish} />
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
