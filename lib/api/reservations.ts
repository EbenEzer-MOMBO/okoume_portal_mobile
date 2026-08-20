import { apiRequest } from '@/lib/api/client';
import { DemandeReservationPayload, DemandeReservationResponse, ReservationDetail } from '@/lib/api/types';

/** POST /api/reservations/demande — public. Crée la réservation en statut en_attente. */
export function createReservationRequest(
  payload: DemandeReservationPayload
): Promise<DemandeReservationResponse> {
  return apiRequest<DemandeReservationResponse>('/api/reservations/demande', { method: 'POST', body: payload });
}

/** GET /api/reservations/{reference} — public, suivi par référence unique. */
export function getReservationByReference(reference: string): Promise<ReservationDetail> {
  return apiRequest<ReservationDetail>(`/api/reservations/${encodeURIComponent(reference)}`);
}
