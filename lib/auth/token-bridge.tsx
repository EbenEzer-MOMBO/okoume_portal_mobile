import { useAuth } from '@clerk/expo';
import { useEffect } from 'react';

import { setAuthTokenGetter } from '@/lib/api/client';
import { getGuestToken, hydrateGuestToken } from '@/lib/auth/guest-session';

/**
 * Pose le getter de token : session Clerk en priorité, sinon jeton invité (magic link).
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
