import { useAuth } from '@clerk/expo';
import { useEffect } from 'react';

import { setAuthTokenGetter } from '@/lib/api/client';

/**
 * Pose le getter de token utilisé par `apiRequest` : le backend n'accepte que des
 * sessions Clerk pour les invités (voir `src/lib/api-auth.ts` côté okoume_portal),
 * il n'existe donc aucun jeton alternatif à fournir en repli.
 */
export function ClerkTokenBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(() => getToken());
    return () => setAuthTokenGetter(null);
  }, [getToken]);

  return null;
}
