import { useEffect, useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { Text } from '@/components/ui/text';
import { TextInputField } from '@/components/ui/text-input-field';
import { CheckoutCartLines } from '@/components/restaurant/checkout-cart-lines';
import { CheckoutContactForm } from '@/components/restaurant/checkout-contact-form';
import { CheckoutOrderType, OrderType } from '@/components/restaurant/checkout-order-type';
import { CheckoutPayment, PaymentMode } from '@/components/restaurant/checkout-payment';
import { CheckoutScheduler } from '@/components/restaurant/checkout-scheduler';
import { CheckoutSuccess } from '@/components/restaurant/checkout-success';
import { Spacing } from '@/constants/theme';
import { formatAmount } from '@/lib/format';
import { decodeGuestEmail, getGuestToken } from '@/lib/auth/guest-session';
import { useGuestProfile } from '@/lib/queries/auth';
import { useTrackedReservations } from '@/lib/queries/reservations';
import { useSyncStatus } from '@/lib/queries/sync';
import { CartLine, useRoomServiceCart } from '@/store/room-service-cart';
import { apiRequest } from '@/lib/api/client';

export default function RestaurantCheckoutScreen() {
  const syncStatus = useSyncStatus();
  const cart = useRoomServiceCart();

  // Auth / profile
  const guestEmail = decodeGuestEmail(getGuestToken() ?? '') ?? '';
  const profile = useGuestProfile();
  const storedName = profile ? `${profile.prenom} ${profile.nom}`.trim() : '';
  const storedPhone = profile?.telephone ?? '';
  const storedEmail = profile?.email || guestEmail;

  // Active reservations
  const { reservations } = useTrackedReservations();
  const activeReservations = useMemo(
    () => (reservations ?? []).filter((r) => ['en_attente', 'confirmee', 'checkin'].includes(r.statut)),
    [reservations]
  );

  // Form state
  const [nom, setNom] = useState(storedName);
  const [telephone, setTelephone] = useState(storedPhone);
  const [email, setEmail] = useState(storedEmail);
  const [typeCommande, setTypeCommande] = useState<OrderType>('emporter');
  const [adresseLivraison, setAdresseLivraison] = useState('');
  const [reservationId, setReservationId] = useState('');
  const [modePaiement, setModePaiement] = useState<PaymentMode>('airtel_money');
  const [numeroMobileMoney, setNumeroMobileMoney] = useState('');
  const [notes, setNotes] = useState('');

  // Scheduler
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<number | null>(null);
  const [schedHour, setSchedHour] = useState(12);
  const [schedMinute, setSchedMinute] = useState(0);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pollingStatus, setPollingStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [confirmedOrderData, setConfirmedOrderData] = useState<{ lines: CartLine[]; totalAmount: number } | null>(null);

  useEffect(() => {
    if (storedName) setNom(storedName);
    if (guestEmail) setEmail(guestEmail);
  }, [storedName, guestEmail]);

  useEffect(() => {
    if (typeCommande === 'en_chambre') setModePaiement('sur_chambre');
    else if (modePaiement === 'sur_chambre') setModePaiement('airtel_money');
  }, [typeCommande, modePaiement]);

  const isMobileMoney = modePaiement === 'airtel_money' || modePaiement === 'moov_money';

  const submitOrder = async () => {
    if (!nom.trim() || !telephone.trim() || !email.trim()) { setErrorMsg('Veuillez remplir vos coordonnées.'); return; }
    if (typeCommande === 'livraison' && !adresseLivraison.trim()) { setErrorMsg('Veuillez indiquer une adresse de livraison.'); return; }
    if (typeCommande === 'en_chambre' && !reservationId) { setErrorMsg('Veuillez sélectionner votre chambre/séjour.'); return; }
    if (typeCommande !== 'en_chambre' && isMobileMoney && !numeroMobileMoney.trim()) { setErrorMsg('Veuillez saisir votre numéro Mobile Money.'); return; }

    setIsSubmitting(true);
    setErrorMsg('');
    setPollingStatus('Envoi de la commande...');

    try {
      let scheduledAt = null;
      if (scheduledDate) {
        const d = new Date(scheduledDate);
        d.setHours(schedHour, schedMinute, 0, 0);
        scheduledAt = d.toISOString();
      }

      const response = await apiRequest<{ success: boolean; orderId: number; transactionId?: string; error?: string }>(
        '/api/restaurant/order',
        {
          method: 'POST',
          body: {
            nom: nom.trim(), telephone: telephone.trim(), email: email.trim(),
            typeCommande,
            adresseLivraison: typeCommande === 'livraison' ? adresseLivraison.trim() : null,
            reservationId: typeCommande === 'en_chambre' ? parseInt(reservationId) : null,
            modePaiement: typeCommande === 'en_chambre' ? 'sur_chambre' : modePaiement,
            numeroMobileMoney: typeCommande !== 'en_chambre' && isMobileMoney ? numeroMobileMoney.trim() : null,
            total: cart.totalAmount,
            items: cart.lines.map((l) => ({ nom: l.item.nom, prix: l.item.prix, quantite: l.quantity })),
            scheduledAt,
            notes: notes.trim(),
          },
        }
      );

      if (!response.success) throw new Error(response.error || 'Erreur lors de la validation de la commande');

      if (response.transactionId) {
        setPollingStatus('Attente validation USSD...');
        let attempts = 0;
        let paid = false;
        while (attempts < 60) {
          attempts++;
          await new Promise((r) => setTimeout(r, 2000));
          try {
            const s = await apiRequest<{ isCompleted: boolean; isSuccess: boolean; error?: string; message?: string }>(
              `/api/paiements/status/${response.transactionId}`
            );
            if (s.isCompleted) {
              if (s.isSuccess) { paid = true; break; }
              else throw new Error(s.error || s.message || 'Paiement échoué ou annulé.');
            }
          } catch (e: any) {
            if (e.message.includes('échoué') || e.message.includes('insuffisant') || e.message.includes('annulé')) throw e;
          }
        }
        if (!paid) throw new Error('Délai dépassé. Veuillez vérifier votre mobile et réessayer.');
      }

      setConfirmedOrderData({
        lines: [...cart.lines],
        totalAmount: cart.totalAmount,
      });
      setOrderId(response.orderId);
      setIsSuccess(true);
      cart.clear();
    } catch (e: any) {
      setErrorMsg(e.message || 'Une erreur est survenue lors de la commande.');
    } finally {
      setIsSubmitting(false);
      setPollingStatus('');
    }
  };

  // ── Vue succès ──
  if (isSuccess && orderId && confirmedOrderData) {
    return (
      <Screen>
        <ScreenHeader title="Merci !" subtitle="Confirmation de commande" />
        <ScreenScroll>
          <View style={styles.successContainer}>
            <CheckoutSuccess
              orderId={orderId}
              lines={confirmedOrderData.lines}
              totalAmount={confirmedOrderData.totalAmount}
              typeCommande={typeCommande}
              modePaiement={modePaiement}
            />
          </View>
        </ScreenScroll>
      </Screen>
    );
  }

  // ── Vue checkout ──
  return (
    <Screen>
      <ScreenHeader title="Panier & Validation" subtitle="Validation de commande" />

      <ScreenScroll>
        {cart.lines.length === 0 ? (
          <EmptyState
            imageSource={require('@/assets/icons/cart.png')}
            title="Panier vide"
            description="Ajoutez des plats depuis le menu pour commander."
          />
        ) : (
          <View style={styles.container}>
            {/* Récapitulatif */}
            <CheckoutCartLines
              lines={cart.lines}
              totalAmount={cart.totalAmount}
              onSetQuantity={(id, q) => cart.setQuantity(id, q)}
              onClear={() => cart.clear()}
            />

            <View style={{ marginTop: Spacing.md }}>
              <TextInputField
                label="Notes particulières (facultatif)"
                value={notes}
                onChangeText={setNotes}
                placeholder="Sans sel, couverts supplémentaires, etc."
                multiline
              />
            </View>

            {/* Coordonnées */}
            <SectionLabel>Vos coordonnées</SectionLabel>
            <CheckoutContactForm nom={nom} telephone={telephone} email={email} setNom={setNom} setTelephone={setTelephone} setEmail={setEmail} />

            {/* Type de commande */}
            <SectionLabel>Type de commande</SectionLabel>
            <CheckoutOrderType
              typeCommande={typeCommande} setTypeCommande={setTypeCommande}
              adresseLivraison={adresseLivraison} setAdresseLivraison={setAdresseLivraison}
              reservationId={reservationId} setReservationId={setReservationId}
              activeReservations={activeReservations}
            />

            {/* Planification */}
            <View style={styles.schedulerSection}>
              <CheckoutScheduler
                isOpen={isSchedulerOpen} setIsOpen={setIsSchedulerOpen}
                scheduledDate={scheduledDate} setScheduledDate={setScheduledDate}
                schedHour={schedHour} setSchedHour={setSchedHour}
                schedMinute={schedMinute} setSchedMinute={setSchedMinute}
              />
            </View>

            {/* Mode de paiement */}
            <SectionLabel>Mode de paiement</SectionLabel>
            <CheckoutPayment
              typeCommande={typeCommande} modePaiement={modePaiement} setModePaiement={setModePaiement}
              numeroMobileMoney={numeroMobileMoney} setNumeroMobileMoney={setNumeroMobileMoney}
              isSubmitting={isSubmitting}
            />

            {/* Erreur */}
            {errorMsg ? <Text variant="caption" tone="destructive" style={styles.error}>{errorMsg}</Text> : null}

            <Button
              label={isSubmitting ? (pollingStatus || 'Traitement de la commande...') : `Commander · ${formatAmount(cart.totalAmount)}`}
              size="lg"
              loading={isSubmitting}
              disabled={isSubmitting || (syncStatus.isLoading && !isSubmitting) || (!syncStatus.data?.isOnline && !isSubmitting)}
              onPress={submitOrder}
              style={{ marginTop: Spacing.xl }}
            />
          </View>
        )}
      </ScreenScroll>
    </Screen>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text variant="sectionTitle" style={{ marginTop: Spacing.lg, marginBottom: Spacing.sm }}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  schedulerSection: { marginTop: Spacing.lg },
  error: { marginTop: Spacing.md },
  successContainer: { alignItems: 'center', padding: Spacing.xl, paddingTop: 40 },
});
