import { apiRequest } from '@/lib/api/client';
import { CommandeClient } from '@/lib/api/types';

export async function getMyCommandes(): Promise<CommandeClient[]> {
  const response = await apiRequest<{ commandes: CommandeClient[] }>('/api/commandes/mine', {
    method: 'GET',
    authenticated: true,
  });
  return response.commandes ?? [];
}
