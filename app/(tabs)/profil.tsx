import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Screen } from "@/components/ui/screen";
import { ScreenScroll } from "@/components/ui/screen-scroll";
import { Text } from "@/components/ui/text";
import { TextInputField } from "@/components/ui/text-input-field";
import { Colors, Radius, Spacing } from "@/constants/theme";
import {
  clearGuestToken,
  decodeGuestEmail,
  getGuestToken,
  setGuestProfile,
} from "@/lib/auth/guest-session";
import { useGuestProfile, useGuestTokenPresent } from "@/lib/queries/auth";

function initialsOf(prenom?: string, nom?: string, email?: string): string {
  if (prenom || nom) {
    const p = prenom?.[0]?.toUpperCase() ?? "";
    const n = nom?.[0]?.toUpperCase() ?? "";
    return `${p}${n}` || "?";
  }
  return email?.[0]?.toUpperCase() ?? "?";
}

export default function ProfilScreen() {
  const hasGuestToken = useGuestTokenPresent();
  const profile = useGuestProfile();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const guestEmail = hasGuestToken
    ? decodeGuestEmail(getGuestToken() ?? "")
    : null;

  // Formulaire de profil modifiable
  const [prenom, setPrenom] = useState(profile?.prenom ?? "");
  const [nom, setNom] = useState(profile?.nom ?? "");
  const [telephone, setTelephone] = useState(profile?.telephone ?? "");
  const [email, setEmail] = useState(profile?.email ?? guestEmail ?? "");

  useEffect(() => {
    if (profile) {
      setPrenom(profile.prenom ?? "");
      setNom(profile.nom ?? "");
      setTelephone(profile.telephone ?? "");
      setEmail(profile.email ?? guestEmail ?? "");
    } else if (guestEmail) {
      setEmail(guestEmail);
    }
  }, [profile, guestEmail]);

  const confirmLogout = async () => {
    setLogoutOpen(false);
    if (hasGuestToken) await clearGuestToken();
    router.replace('/auth/otp');
  };

  const saveProfile = async () => {
    await setGuestProfile({
      prenom: prenom.trim(),
      nom: nom.trim(),
      telephone: telephone.trim(),
      email: email.trim(),
    });
    setSavedSuccess(true);
    setEditOpen(false);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Erreur ouverture lien:", err),
    );
  };

  const fullName = profile ? `${profile.prenom} ${profile.nom}`.trim() : null;

  return (
    <Screen tone="alt">
      <ScreenScroll withTabBar paddingTop={Spacing["2xl"]}>
        <Text variant="title">Mon Profil</Text>

        {/* Entête d'identité */}
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text variant="heading" tone="inverse">
              {initialsOf(prenom, nom, email)}
            </Text>
          </View>
          <View style={styles.identityBody}>
            <Text variant="cardTitle">
              {fullName || email || "Client Ya Hôtel"}
            </Text>
            {telephone ? (
              <Text variant="bodySm" tone="muted">
                {telephone}
              </Text>
            ) : null}
            {email ? (
              <Text variant="bodySm" tone="muted">
                {email}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Informations & conditions — un seul conteneur */}
        <View style={styles.section}>
          <Text variant="caption" tone="muted" style={styles.sectionHeader}>
            INFORMATIONS & CONDITIONS
          </Text>

          <View style={styles.menuContainer}>
            {/* Ligne "Modifier mes informations" — ouvre le bottom sheet */}
            <Pressable
              style={[styles.menuRow, styles.rowBorder]}
              onPress={() => setEditOpen(true)}>
              <View style={styles.menuRowLeft}>
                <Text variant="bodySm" style={styles.menuLabel}>
                  Modifier mes informations
                </Text>
              </View>
              <Icon name="chevron" size={14} color={Colors.textMuted} />
            </Pressable>

            {/* Conditions d'utilisation */}
            <Pressable
              style={[styles.menuRow, styles.rowBorder]}
              onPress={() =>
                openUrl("https://yahotel.ga/conditions-d-utilisation")
              }>
              <View style={styles.menuRowLeft}>
                <Text variant="bodySm" style={styles.menuLabel}>
                  Conditions d'utilisation
                </Text>
              </View>
              <Icon name="chevron" size={14} color={Colors.textMuted} />
            </Pressable>

            {/* Politique de confidentialité */}
            <Pressable
              style={styles.menuRow}
              onPress={() =>
                openUrl("https://yahotel.ga/politique-de-confidentialite")
              }>
              <View style={styles.menuRowLeft}>
                <Text variant="bodySm" style={styles.menuLabel}>
                  Politique de confidentialité
                </Text>
              </View>
              <Icon name="chevron" size={14} color={Colors.textMuted} />
            </Pressable>
          </View>
        </View>

        {/* Bouton Se déconnecter — dans le flux normal, en bas de page */}
        {hasGuestToken ? (
          <View style={styles.section}>
            <Button
              label="Se déconnecter"
              variant="primary"
              onPress={() => setLogoutOpen(true)}
              style={styles.logoutSquareButton}
            />
          </View>
        ) : null}

        <View style={{ height: 40 }} />
      </ScreenScroll>

      {/* Bottom sheet — modification des informations */}
      <BottomSheet
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        title="Modifier mes informations">
        <View style={styles.editForm}>
          <TextInputField
            label="Prénom"
            value={prenom}
            onChangeText={setPrenom}
            placeholder="Ex: Jean"
            autoCapitalize="words"
          />
          <TextInputField
            label="Nom"
            value={nom}
            onChangeText={setNom}
            placeholder="Ex: OKOUMBA"
            autoCapitalize="characters"
          />
          <TextInputField
            label="Numéro de téléphone"
            value={telephone}
            onChangeText={setTelephone}
            placeholder="Ex: 074 00 00 00"
            keyboardType="phone-pad"
          />
          <TextInputField
            label="Adresse e-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="vous@exemple.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button
            label={
              savedSuccess ? "Modifications enregistrées !" : "Enregistrer"
            }
            onPress={saveProfile}
            variant={savedSuccess ? "outline" : "primary"}
            style={{ marginTop: Spacing.xs }}
          />
        </View>
      </BottomSheet>

      <Dialog
        visible={logoutOpen}
        title="Se déconnecter ?"
        description="Votre profil sera oublié sur cet appareil."
        confirmLabel="Se déconnecter"
        tone="destructive"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md + 2,
    marginTop: Spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    backgroundColor: Colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  identityBody: { flex: 1, gap: 2 },
  section: {
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
  sectionHeader: {
    letterSpacing: 0.8,
    fontWeight: "600",
    fontSize: 11,
    marginBottom: 4,
  },
  menuContainer: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
  },
  menuRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm + 2,
  },
  menuLabel: {
    fontSize: 13,
    color: Colors.ink,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  editForm: {
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  logoutSquareButton: {
    borderRadius: 0,
    backgroundColor: Colors.ink,
  },
});
