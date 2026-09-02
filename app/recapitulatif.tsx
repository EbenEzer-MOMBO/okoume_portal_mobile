import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { SectionTitle } from '@/components/ui/section-title';
import { SummaryRow } from '@/components/ui/summary-row';
import { Text } from '@/components/ui/text';
import { PhoneNumberField } from '@/components/ui/phone-number-field';
import { TextInputField } from '@/components/ui/text-input-field';
import { HOTEL } from '@/constants/hotel';
import { Colors, Radius, Spacing, FontFamily } from '@/constants/theme';
import { computeQuote } from '@/lib/booking';
import { formatAmount, formatDay, pluralize, toISODate } from '@/lib/format';
import { isValidPhone } from '@/lib/phone';
import { useCreateReservation } from '@/lib/queries/reservations';
import { decodeGuestEmail, getGuestToken } from '@/lib/auth/guest-session';
import { useGuestProfile } from '@/lib/queries/auth';
import { useAppStore } from '@/store/app-store';

export default function RecapitulatifScreen() {
  const { state, actions } = useAppStore();
  const insets = useSafeAreaInsets();
  const { arrival, departure, guests } = state.search;
  const room = state.selectedRoom;
  const guestEmail = decodeGuestEmail(getGuestToken() ?? '') ?? '';
  const profile = useGuestProfile();
  const storedName = profile ? `${profile.prenom} ${profile.nom}`.trim() : '';
  const storedPhone = profile?.telephone ?? '';
  const storedEmail = profile?.email || guestEmail;

  const [nom, setNom] = useState(storedName);
  const [email, setEmail] = useState(storedEmail);
  const [telephone, setTelephone] = useState(storedPhone);

  useEffect(() => {
    if (storedName) setNom(storedName);
    if (storedPhone) setTelephone(storedPhone);
    if (storedEmail) setEmail(storedEmail);
  }, [storedName, storedPhone, storedEmail]);
  const [nomError, setNomError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [telephoneError, setTelephoneError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const createReservation = useCreateReservation();

  if (!room) {
    return (
      <Screen>
        <ScreenHeader title="Récapitulatif" />
        <View style={styles.missing}>
          <Text variant="body" tone="muted" style={styles.missingText}>
            Aucune chambre sélectionnée. Relancez une recherche.
          </Text>
          <Button label="Retour à l'accueil" fullWidth={false} onPress={() => router.replace('/(tabs)')} />
        </View>
      </Screen>
    );
  }

  const quote = computeQuote(room.tarif_nuit, arrival, departure);

  const canSubmit = !createReservation.isPending;

  const submit = () => {
    if (!nom.trim()) {
      setNomError('Renseignez votre nom.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Renseignez un e-mail valide.');
      return;
    }
    if (!isValidPhone(telephone)) {
      setTelephoneError('Indiquez un numéro valide pour le pays choisi.');
      return;
    }
    setNomError('');
    setEmailError('');
    setTelephoneError('');
    setSubmitError('');

    createReservation.mutate(
      {
        clientNom: nom.trim(),
        clientEmail: email.trim(),
        clientTel: telephone.trim(),
        chambreId: room.id,
        dateArrivee: toISODate(arrival),
        dateDepart: toISODate(departure),
      },
      {
        onSuccess: (data) => {
          actions.trackReference(data.reference);
          router.push({ pathname: '/paiement', params: { reference: data.reference } });
        },
        onError: (error) => {
          setSubmitError(error instanceof Error ? error.message : 'Impossible d’envoyer la demande.');
        },
      }
    );
  };

  return (
    <Screen>
      <ScreenHeader title="Récapitulatif" />

      <ScreenScroll>
        {/* Hero Image Section (like web checkout) */}
        <View style={styles.heroContainer}>
          <ImageBackground 
            source={room.photo_url ? { uri: room.photo_url } : require('@/assets/images/splash-icon.png')} 
            style={styles.heroImage}
            resizeMode="cover"
          >
            <View style={styles.heroOverlay}>
              <Text variant="overline" style={styles.heroOverline}>
                Votre Réservation
              </Text>
              <Text style={styles.heroTitle}>
                Chambre N° {room.numero}
              </Text>
            </View>
          </ImageBackground>
        </View>

        {/* Flat Summary Section */}
        <View style={styles.summary}>
          <Text variant="cardTitle" style={{ marginBottom: Spacing.xs }}>Détails du séjour</Text>
          <Divider />
          <SummaryRow label="Chambre" value={room.type_chambre} />
          <SummaryRow
            label="Voyageurs"
            value={`${state.search.adults || '2'} adulte${parseInt(state.search.adults || '2') > 1 ? 's' : ''}${parseInt(state.search.children || '0') > 0 ? ` · ${state.search.children} enfant${parseInt(state.search.children || '0') > 1 ? 's' : ''}` : ''}`}
          />
          <Divider />
          <SummaryRow label="Arrivée" value={formatDay(arrival)} />
          <SummaryRow label="Départ" value={formatDay(departure)} />
          
          <Divider />
          <SummaryRow
            label={`${pluralize(quote.nights, 'nuit')} × ${formatAmount(room.tarif_nuit)}`}
            value={formatAmount(quote.subtotal)}
          />
        </View>

        <SectionTitle>Vos coordonnées</SectionTitle>
        <View style={styles.fields}>
          <TextInputField
            label="Nom complet"
            value={nom}
            onChangeText={(value) => {
              setNom(value);
              setNomError('');
            }}
            placeholder="Votre nom"
            autoCapitalize="words"
            error={nomError}
          />
          <TextInputField
            label="E-mail"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setEmailError('');
            }}
            placeholder="vous@exemple.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!guestEmail}
            error={emailError}
          />
          <PhoneNumberField
            label="Téléphone"
            value={telephone}
            onChange={(value) => {
              setTelephone(value);
              setTelephoneError('');
            }}
            error={telephoneError}
          />
        </View>



        {submitError ? (
          <Text variant="caption" tone="destructive" style={styles.submitError}>
            {submitError}
          </Text>
        ) : null}
      </ScreenScroll>

      <View style={[styles.footer, { paddingBottom: Spacing.xl + insets.bottom }]}>
        <View style={styles.totals}>
          <View style={styles.due}>
            <Text variant="caption" tone="muted">
              Total à régler
            </Text>
            <Text variant="price" style={styles.dueAmount}>
              {formatAmount(quote.total)}
            </Text>
          </View>
        </View>

        <Button
          label="Confirmer la réservation"
          size="lg"
          disabled={!canSubmit}
          loading={createReservation.isPending}
          onPress={submit}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    height: 200,
    width: '100%',
    marginBottom: Spacing.xl,
  },
  heroImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 27, 25, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  heroOverline: {
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: FontFamily.serif,
    textAlign: 'center',
  },
  summary: { gap: Spacing.md, paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  fields: { gap: Spacing.lg, paddingHorizontal: Spacing.lg },
  submitError: { marginTop: Spacing.md, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  footer: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md + 2,
  },
  totals: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  due: { gap: 2 },
  dueAmount: { fontSize: 24 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingHorizontal: Spacing.xl },
  missingText: { textAlign: 'center' },
});
