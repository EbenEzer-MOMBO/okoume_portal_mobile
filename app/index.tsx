import {
  useGuestSessionLoaded,
  useGuestTokenPresent,
} from "@/lib/queries/auth";
import { router } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Spacing } from "@/constants/theme";

/** Durée d'affichage du splash avant redirection (ms). */
const SPLASH_DURATION = 1900;

export default function SplashRoute() {
  const isLoaded = useGuestSessionLoaded();
  const hasToken = useGuestTokenPresent();

  useEffect(() => {
    if (!isLoaded) return;

    const timeout = setTimeout(() => {
      if (hasToken) {
        router.replace("/(tabs)");
      } else {
        router.replace("/auth/otp");
      }
    }, SPLASH_DURATION);

    return () => clearTimeout(timeout);
  }, [isLoaded, hasToken]);

  return (
    <Screen edges={["top", "bottom"]}>
      <View style={styles.content}>
        <Image
          source={require("@/assets/images/splash-icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Text variant="caption" tone="subtle" style={styles.loading}>
        Chargement…
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg + 2,
  },
  logo: { width: 220, height: 220 },
  baseline: { fontSize: 16, fontStyle: "italic" },
  loading: { textAlign: "center", paddingBottom: 56 },
});
