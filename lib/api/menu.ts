import { apiRequest } from '@/lib/api/client';
import { mapMenuItem } from '@/lib/api/map';
import { MenuItem } from '@/lib/api/types';

/** GET /api/menu — public. Ne retourne que les plats disponibles côté serveur. */
export async function getMenu(): Promise<MenuItem[]> {
  const data = await apiRequest<{ menu?: unknown[] } | unknown[]>('/api/menu');
  const items = Array.isArray(data) ? data : (data.menu ?? []);
  return items.map(mapMenuItem);
}
