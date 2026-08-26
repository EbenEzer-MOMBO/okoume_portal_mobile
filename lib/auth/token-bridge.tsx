import { useAuth } from '@clerk/expo';
import { useEffect } from 'react';

import { setAuthTokenGetter } from '@/lib/api/client';
import { getGuestToken, hydrateGuestToken } from '@/lib/auth/guest-session';

/**
 * Pose le getter de token : session Clerk en priorité, sinon jeton invité obtenu par
 * OTP e-mail (`/api/auth/verify-otp`, voir `lib/queries/auth.ts`) — les deux sont
 * acceptés côté backend par `resolveActor()` (`src/lib/api-auth.ts`).
 */
export function ClerkTokenBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    hydrateGuestToken();
  }, []);

  useEffect(() => {
    setAuthTokenGetter(async () => {
      const clerkToken = await getToken();
      if (clerkToken) return clerkToken;
      return getGuestToken();
    });
    return () => setAuthTokenGetter(null);
  }, [getToken]);

  return null;
}
