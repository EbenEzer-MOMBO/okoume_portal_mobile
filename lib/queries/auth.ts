import { useMutation } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

import { sendOtp, verifyOtp } from '@/lib/api/auth';
import { getGuestToken, getGuestProfile, isGuestSessionLoaded, setGuestToken, subscribeGuestSession } from '@/lib/auth/guest-session';

export function useSendOtp() {
  return useMutation({ mutationFn: (email: string) => sendOtp(email) });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => verifyOtp(email, code),
    onSuccess: (data) => setGuestToken(data.token),
  });
}

/** Vrai si un jeton invité (OTP) est stocké sur l'appareil. */
export function useGuestTokenPresent(): boolean {
  return useSyncExternalStore(subscribeGuestSession, () => !!getGuestToken(), () => false);
}

/**
 * Vrai dès que la session invité a été lue depuis le SecureStore au démarrage.
 * Remplace l'équivalent Clerk `isLoaded` dans les écrans de routage.
 */
export function useGuestSessionLoaded(): boolean {
  return useSyncExternalStore(subscribeGuestSession, isGuestSessionLoaded, () => false);
}

/**
 * Retourne le profil invité local (Nom et Prénom) s'il a été renseigné.
 */
export function useGuestProfile() {
  return useSyncExternalStore(subscribeGuestSession, getGuestProfile, () => null);
}

