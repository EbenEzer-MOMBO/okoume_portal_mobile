import { useQuery } from '@tanstack/react-query';

import { getSyncStatus } from '@/lib/api/sync';

/** Statut de connexion de la caisse hôtel, vérifié à la demande (écran de paiement). */
export function useSyncStatus() {
  return useQuery({
    queryKey: ['sync-status'],
    queryFn: getSyncStatus,
    retry: false,
  });
}
