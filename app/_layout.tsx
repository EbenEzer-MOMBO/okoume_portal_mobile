import { Fraunces_400Regular } from '@expo-google-fonts/fraunces/400Regular';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { Fraunces_600SemiBold_Italic } from '@expo-google-fonts/fraunces/600SemiBold_Italic';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces/700Bold';
import { IBMPlexMono_400Regular } from '@expo-google-fonts/ibm-plex-mono/400Regular';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { ToastProvider } from '@/components/ui/toast';
import { Colors } from '@/constants/theme';
import { AuthTokenBridge } from '@/lib/auth/token-bridge';
import { AppStoreProvider } from '@/store/app-store';
import { RoomServiceCartProvider } from '@/store/room-service-cart';

SplashScreen.preventAutoHideAsync();

/** Un seul client React Query pour toute l'app, créé une fois. */
function useAppQueryClient() {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1 } } }));
  return client;
}

export default function RootLayout() {
  const queryClient = useAppQueryClient();
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    Fraunces_600SemiBold_Italic,
    Fraunces_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    IBMPlexMono_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <AuthTokenBridge />
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <AppStoreProvider>
            <RoomServiceCartProvider>
              <ToastProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: Colors.background },
                    animation: 'slide_from_right',
                  }}>
                  <Stack.Screen name="index" options={{ animation: 'fade' }} />
                  <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
                  <Stack.Screen name="chambres-catalogue" />
                  <Stack.Screen name="confirmation" options={{ animation: 'fade', gestureEnabled: false }} />
                </Stack>
                <StatusBar style="dark" />
              </ToastProvider>
            </RoomServiceCartProvider>
          </AppStoreProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </>
  );
}
