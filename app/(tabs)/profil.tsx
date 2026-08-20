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
import { useToast } from '@/components/ui/toast';
import { DEMO_USER } from '@/constants/hotel';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAppStore, type NotificationPrefs } from '@/store/app-store';

type DialogKind = 'logout' | 'password';

const PREFS: { key: keyof NotificationPrefs; label: string }[] = [
  { key: 'push', label: 'Notifications push' },
  { key: 'email', label: 'Emails de confirmation' },
  { key: 'promos', label: 'Offres et promotions' },
];

const DIALOGS: Record<
  DialogKind,
  { title: string; description: string; confirmLabel: string; tone: 'default' | 'destructive' }
> = {
  logout: {
    title: 'Se déconnecter ?',
    description: 'Vous devrez saisir à nouveau vos identifiants pour accéder à vos réservations.',
    confirmLabel: 'Se déconnecter',
    tone: 'destructive',
  },
  password: {
    title: 'Modifier le mot de passe',
    description: `Un lien de modification sera envoyé à ${DEMO_USER.email}.`,
    confirmLabel: 'Envoyer le lien',
    tone: 'default',
  },
};

export default function ProfilScreen() {
  const { state, actions } = useAppStore();
  const showToast = useToast();
  const [dialog, setDialog] = useState<DialogKind | null>(null);

  const confirm = () => {
    if (dialog === 'logout') {
      setDialog(null);
      actions.signOut();
      router.replace('/login');
      return;
    }
    setDialog(null);
    showToast('Lien de modification envoyé');
  };

  const dialogCopy = dialog ? DIALOGS[dialog] : null;

  return (
    <Screen tone="alt">
      <ScreenScroll withTabBar paddingTop={Spacing['2xl']}>
        <Text variant="title">Profil</Text>

        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text variant="heading" tone="inverse">
              {DEMO_USER.initials}
            </Text>
          </View>
          <View style={styles.identityBody}>
            <Text variant="cardTitle">
              {DEMO_USER.firstName} {DEMO_USER.lastName}
            </Text>
            <Text variant="bodySm" tone="muted">
              {DEMO_USER.email}
            </Text>
          </View>
        </View>

        <SectionTitle spacingTop={26}>Coordonnées</SectionTitle>
        <Card padded={false}>
          <SummaryRow label="Téléphone" value={DEMO_USER.phone} style={styles.row} />
          <Divider />
          <SummaryRow label="Pays" value={DEMO_USER.country} style={styles.row} />
          <Divider />
          <SummaryRow
            label="Mot de passe"
            actionLabel="Modifier"
            onPress={() => setDialog('password')}
            style={styles.row}
          />
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
          onPress={() => setDialog('logout')}
          style={styles.logout}
        />
      </ScreenScroll>

      {dialogCopy ? (
        <Dialog
          visible
          title={dialogCopy.title}
          description={dialogCopy.description}
          confirmLabel={dialogCopy.confirmLabel}
          tone={dialogCopy.tone}
          onConfirm={confirm}
          onCancel={() => setDialog(null)}
        />
      ) : null}
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
