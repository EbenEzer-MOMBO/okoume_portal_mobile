import { useAuth } from '@clerk/expo';
import { useEffect } from 'react';

import { setAuthTokenGetter } from '@/lib/api/client';

/**
 * Pose le getter de token Clerk utilisé par lib/api/client.ts. `getToken` de Clerk
 * change d'identité à chaque rendu, donc on republie une fonction stable qui délègue
 * toujours vers la référence la plus récente via une closure fermée sur `useAuth()`.
 */
export function ClerkTokenBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(() => getToken());
    return () => setAuthTokenGetter(null);
  }, [getToken]);

  return null;
}
