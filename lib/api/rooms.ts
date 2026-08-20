import { apiRequest } from '@/lib/api/client';
import { DisponibiliteResponse } from '@/lib/api/types';

/** GET /api/chambres/disponibilite — public. */
export function getAvailability(from: string, to: string): Promise<DisponibiliteResponse> {
  const params = new URLSearchParams({ from, to });
  return apiRequest<DisponibiliteResponse>(`/api/chambres/disponibilite?${params.toString()}`);
}
