import { useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { setGuestToken } from '@/lib/auth/guest-session';

/** Deep link magic link : okoumeportalmobile://auth/guest?token=… */
export default function GuestAuthScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();

  useEffect(() => {
    const run = async () => {
      if (typeof token === 'string' && token) {
        await setGuestToken(token);
      }
      router.replace('/(tabs)/reservations');
    };
    run();
  }, [token]);

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text variant="body" tone="muted">
          Ouverture de votre espace…
        </Text>
      </View>
    </Screen>
  );
}
