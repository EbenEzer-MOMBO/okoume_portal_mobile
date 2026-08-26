import { useMutation } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

import { sendOtp, verifyOtp } from '@/lib/api/auth';
import { getGuestToken, setGuestToken, subscribeGuestSession } from '@/lib/auth/guest-session';

export function useSendOtp() {
  return useMutation({ mutationFn: (email: string) => sendOtp(email) });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => verifyOtp(email, code),
    onSuccess: (data) => setGuestToken(data.token),
  });
}

/** Vrai si un jeton invité (OTP) est stocké sur l'appareil, en plus d'une éventuelle session Clerk. */
export function useGuestTokenPresent(): boolean {
  return useSyncExternalStore(subscribeGuestSession, () => !!getGuestToken(), () => false);
}
