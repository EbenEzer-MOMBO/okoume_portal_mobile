import { apiRequest } from '@/lib/api/client';
import { mapReservationDetail } from '@/lib/api/map';
import { DemandeReservationPayload, DemandeReservationResponse, ReservationDetail } from '@/lib/api/types';

/** POST /api/reservations/demande — public. Crée la réservation en statut en_attente. */
export function createReservationRequest(
  payload: DemandeReservationPayload
): Promise<DemandeReservationResponse> {
  return apiRequest<DemandeReservationResponse>('/api/reservations/demande', { method: 'POST', body: payload });
}

/** GET /api/reservations/{reference} — public, suivi par référence unique. */
export async function getReservationByReference(reference: string): Promise<ReservationDetail> {
  const data = await apiRequest<unknown>(`/api/reservations/${encodeURIComponent(reference)}`);
  return mapReservationDetail(data);
}

/** GET /api/reservations/mine — Clerk ou jeton invité. */
export async function getMyReservations(): Promise<ReservationDetail[]> {
  const data = await apiRequest<{ reservations?: unknown[] }>('/api/reservations/mine', {
    authenticated: true,
  });
  return (data.reservations ?? []).map(mapReservationDetail);
}
