import { useQuery } from '@tanstack/react-query';
import { getMyCommandes } from '@/lib/api/commandes';
import { useGuestTokenPresent } from '@/lib/queries/auth';

export function useMyCommandes() {
  const hasGuestToken = useGuestTokenPresent();

  return useQuery({
    queryKey: ['commandes', 'mine', hasGuestToken],
    queryFn: getMyCommandes,
    enabled: hasGuestToken,
    refetchInterval: 10_000,
  });
}
