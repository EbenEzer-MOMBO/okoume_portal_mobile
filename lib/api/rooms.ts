import { apiRequest } from '@/lib/api/client';
import { mapChambre } from '@/lib/api/map';
import { DisponibiliteResponse } from '@/lib/api/types';

type AvailabilityPayload = {
  chambres?: unknown[];
  periode?: DisponibiliteResponse['periode'];
};

/** GET /api/chambres/disponibilite — public. */
export async function getAvailability(from: string, to: string): Promise<DisponibiliteResponse> {
  const params = new URLSearchParams({ from, to });
  const data = await apiRequest<AvailabilityPayload>(`/api/chambres/disponibilite?${params.toString()}`);
  return {
    chambres: (data.chambres ?? []).map(mapChambre),
    periode: data.periode ?? { from, to, nuits: 1 },
  };
}
