import { apiRequest } from '@/lib/api/client';
import { SyncStatusResponse } from '@/lib/api/types';

/**
 * GET /api/sync/status — public. Indique si la caisse locale de l'hôtel a pingé le
 * serveur distant dans les 5 dernières minutes. Fail-closed : toute erreur ou timeout
 * (délai réseau, serveur injoignable) est traitée comme hors ligne, comme le fait le
 * backend lui-même en cas d'erreur DB.
 */
export async function getSyncStatus(): Promise<SyncStatusResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    return await apiRequest<SyncStatusResponse>('/api/sync/status', { signal: controller.signal });
  } catch {
    return { isOnline: false };
  } finally {
    clearTimeout(timeoutId);
  }
}
