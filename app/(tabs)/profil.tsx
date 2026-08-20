import { useClerk, useUser } from '@clerk/expo';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Divider } from '@/components/ui/divider';
import { Screen } from '@/components/ui/screen';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { SectionTitle } from '@/components/ui/section-title';
import { SummaryRow } from '@/components/ui/summary-row';
import { Text } from '@/components/ui/text';
import { TextButton } from '@/components/ui/text-button';
import { Toggle } from '@/components/ui/toggle';
import { Colors, Radius, Spacing } from '@/constants/theme';
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
  const { user } = useUser();
  const { signOut } = useClerk();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || null;
  const email = user?.primaryEmailAddress?.emailAddress;
  const phone = user?.primaryPhoneNumber?.phoneNumber ?? (user?.unsafeMetadata?.phone as string | undefined);
  const country = user?.unsafeMetadata?.country as string | undefined;

  const confirmLogout = async () => {
    setLogoutOpen(false);
    await signOut();
    router.replace('/login');
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
            ) : null}
          </View>
        </View>

        <SectionTitle spacingTop={26}>Coordonnées</SectionTitle>
        <Card padded={false}>
          <SummaryRow label="Téléphone" value={phone ?? 'Non renseigné'} style={styles.row} />
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

        <TextButton
          label="Se déconnecter"
          tone="destructive"
          onPress={() => setLogoutOpen(true)}
          style={styles.logout}
        />
      </ScreenScroll>

      <Dialog
        visible={logoutOpen}
        title="Se déconnecter ?"
        description="Vous devrez saisir à nouveau vos identifiants pour accéder à vos réservations."
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
  row: { paddingVertical: Spacing.md + 2, paddingHorizontal: Spacing.lg - 1 },
  prefRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logout: { marginTop: 28 },
});
