import { apiRequest } from '@/lib/api/client';
import { MenuItem } from '@/lib/api/types';

/** GET /api/menu — public. Ne retourne que les plats disponibles côté serveur. */
export function getMenu(): Promise<MenuItem[]> {
  return apiRequest<MenuItem[]>('/api/menu');
}
