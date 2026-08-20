import { useQuery } from '@tanstack/react-query';

import { getAvailability } from '@/lib/api/rooms';

/** Chambres disponibles sur une période. `enabled` évite l'appel tant que les dates ne sont pas valides. */
export function useAvailability(from: string, to: string, enabled: boolean) {
  return useQuery({
    queryKey: ['disponibilite', from, to],
    queryFn: () => getAvailability(from, to),
    enabled,
  });
}
