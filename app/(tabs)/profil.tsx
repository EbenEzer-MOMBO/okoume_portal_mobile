import { useAuth, useClerk, useUser } from '@clerk/expo';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Divider } from '@/components/ui/divider';
import { PhoneNumberField } from '@/components/ui/phone-number-field';
import { Screen } from '@/components/ui/screen';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { SectionTitle } from '@/components/ui/section-title';
import { SummaryRow } from '@/components/ui/summary-row';
import { Text } from '@/components/ui/text';
import { TextButton } from '@/components/ui/text-button';
import { Toggle } from '@/components/ui/toggle';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { isValidPhone } from '@/lib/phone';
import { useAppStore, type NotificationPrefs } from '@/store/app-store';

const PREFS: { key: keyof NotificationPrefs; label: string }[] = [
  { key: 'push', label: 'Notifications push' },
  { key: 'email', label: 'Emails de confirmation' },
  { key: 'promos', label: 'Offres et promotions' },
];

function initialsOf(name: string | null | undefined, email: string | undefined): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  }
  return email?.[0]?.toUpperCase() ?? '?';
}

export default function ProfilScreen() {
  const { state, actions } = useAppStore();
  const { user, isSignedIn } = useUser();
  const { isSignedIn: sessionSignedIn } = useAuth();
  const { signOut } = useClerk();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const storedPhone =
    user?.primaryPhoneNumber?.phoneNumber ?? (user?.unsafeMetadata?.phone as string | undefined) ?? '';
  const [phone, setPhone] = useState(storedPhone);
  const [phoneError, setPhoneError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPhone(storedPhone);
  }, [storedPhone]);

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || null;
  const email = user?.primaryEmailAddress?.emailAddress;
  const country = user?.unsafeMetadata?.country as string | undefined;
  const hasSession = Boolean(isSignedIn || sessionSignedIn);

  const savePhone = async () => {
    if (!user) return;
    if (!isValidPhone(phone)) {
      setPhoneError('Indiquez un numéro valide pour le pays choisi.');
      return;
    }
    setPhoneError('');
    setSaveError('');
    setSaving(true);
    try {
      await user.update({
        unsafeMetadata: { ...user.unsafeMetadata, phone },
      });
    } catch {
      setSaveError('Impossible d’enregistrer le numéro.');
    } finally {
      setSaving(false);
    }
  };

  const confirmLogout = async () => {
    setLogoutOpen(false);
    if (isSignedIn || sessionSignedIn) await signOut();
    router.replace('/(tabs)');
  };

  return (
    <Screen tone="alt">
      <ScreenScroll withTabBar paddingTop={Spacing['2xl']}>
        <Text variant="title">Profil</Text>

        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text variant="heading" tone="inverse">
              {initialsOf(fullName, email)}
            </Text>
          </View>
          <View style={styles.identityBody}>
            <Text variant="cardTitle">{fullName ?? email ?? 'Client Okoumé'}</Text>
            {email ? (
              <Text variant="bodySm" tone="muted">
                {email}
              </Text>
            ) : (
              <Text variant="bodySm" tone="muted">
                Réservez sans compte, ou connectez-vous pour retrouver vos séjours.
              </Text>
            )}
          </View>
        </View>

        <SectionTitle spacingTop={26}>Coordonnées</SectionTitle>
        <Card padded={false}>
          <View style={styles.phoneBlock}>
            <PhoneNumberField
              label="Téléphone"
              value={phone}
              onChange={(value) => {
                setPhone(value);
                setPhoneError('');
                setSaveError('');
              }}
              error={phoneError}
            />
            {saveError ? (
              <Text variant="caption" tone="destructive">
                {saveError}
              </Text>
            ) : null}
            <Button
              label="Enregistrer le numéro"
              variant="secondary"
              loading={saving}
              disabled={!user}
              onPress={savePhone}
            />
          </View>
          <Divider />
          <SummaryRow label="Pays" value={country ?? 'Non renseigné'} style={styles.row} />
        </Card>

        <SectionTitle spacingTop={26}>Préférences de notification</SectionTitle>
        <Card padded={false}>
          {PREFS.map((pref, index) => (
            <View key={pref.key}>
              {index > 0 ? <Divider /> : null}
              <View style={[styles.row, styles.prefRow]}>
                <Text variant="body">{pref.label}</Text>
                <Toggle
                  value={state.prefs[pref.key]}
                  accessibilityLabel={pref.label}
                  onValueChange={() => actions.togglePref(pref.key)}
                />
              </View>
            </View>
          ))}
        </Card>

        {hasSession ? (
          <TextButton
            label="Se déconnecter"
            tone="destructive"
            onPress={() => setLogoutOpen(true)}
            style={styles.logout}
          />
        ) : (
          <Button label="Se connecter" onPress={() => router.push('/login')} style={styles.logout} />
        )}
      </ScreenScroll>

      <Dialog
        visible={logoutOpen}
        title="Se déconnecter ?"
        description="Votre compte sera oublié sur cet appareil."
        confirmLabel="Se déconnecter"
        tone="destructive"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md + 2, marginTop: Spacing.xl },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityBody: { flex: 1, gap: 3 },
  phoneBlock: { padding: Spacing.lg - 1, gap: Spacing.md },
  row: { paddingVertical: Spacing.md + 2, paddingHorizontal: Spacing.lg - 1 },
  prefRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logout: { marginTop: 28 },
});
