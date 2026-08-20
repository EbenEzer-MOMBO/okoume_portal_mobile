import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAppStore } from '@/store/app-store';

/** Durée d'affichage du splash avant redirection (ms). */
const SPLASH_DURATION = 1900;

export default function SplashRoute() {
  const { state } = useAppStore();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace(state.authenticated ? '/(tabs)' : '/login');
    }, SPLASH_DURATION);

    return () => clearTimeout(timeout);
  }, [state.authenticated]);

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.logo}>
          <Text variant="display" style={styles.monogram}>
            O
          </Text>
        </View>
        <Text variant="display">Okoumé</Text>
        <Text variant="heading" tone="accent" style={styles.baseline}>
          Simplicité et élégance
        </Text>
      </View>
      <Text variant="caption" tone="subtle" style={styles.loading}>
        Chargement…
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg + 2 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogram: { fontSize: 26, lineHeight: 34 },
  baseline: { fontSize: 16, fontStyle: 'italic' },
  loading: { textAlign: 'center', paddingBottom: 56 },
});
