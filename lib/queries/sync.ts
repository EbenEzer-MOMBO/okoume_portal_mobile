import { useQuery } from '@tanstack/react-query';

import { getSyncStatus } from '@/lib/api/sync';

/** Statut de connexion de la caisse hôtel. Interrogé toutes les 60 secondes en arrière-plan. */
export function useSyncStatus() {
  return useQuery({
    queryKey: ['sync-status'],
    queryFn: getSyncStatus,
    retry: false,
    refetchInterval: 60_000,       // Polling toutes les 60 s
    refetchIntervalInBackground: true, // Même quand l'app est en arrière-plan
    staleTime: 30_000,
  });
}
