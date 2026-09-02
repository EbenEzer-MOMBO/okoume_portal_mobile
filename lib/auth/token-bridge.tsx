import { useEffect } from 'react';

import { setAuthTokenGetter } from '@/lib/api/client';
import { getGuestToken, hydrateGuestToken } from '@/lib/auth/guest-session';

/**
 * Pose le getter de token : jeton invité obtenu par OTP e-mail
 * (`/api/auth/verify-otp`, voir `lib/queries/auth.ts`) — accepté côté
 * backend par `resolveActor()` (`src/lib/api-auth.ts`).
 */
export function AuthTokenBridge() {
  useEffect(() => {
    hydrateGuestToken();
  }, []);

  useEffect(() => {
    setAuthTokenGetter(async () => {
      return getGuestToken();
    });
    return () => setAuthTokenGetter(null);
  }, []);

  return null;
}
