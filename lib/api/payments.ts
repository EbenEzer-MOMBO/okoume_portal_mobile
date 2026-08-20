import { apiRequest } from '@/lib/api/client';
import { InitierPaiementPayload, InitierPaiementResponse } from '@/lib/api/types';

/**
 * POST /api/paiements/initier — Bearer Clerk requis (invité).
 * Stub côté backend : répond toujours en_attente, ne débite jamais réellement.
 * L'état final s'observe en suivant la réservation (GET /api/reservations/{reference}).
 */
export function initiatePayment(payload: InitierPaiementPayload): Promise<InitierPaiementResponse> {
  return apiRequest<InitierPaiementResponse>('/api/paiements/initier', {
    method: 'POST',
    body: payload,
    authenticated: true,
  });
}
