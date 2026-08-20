import { apiRequest } from '@/lib/api/client';
import { RoomServiceOrderPayload, RoomServiceOrderResponse } from '@/lib/api/types';

/**
 * POST /api/commandes/room-service — Bearer Clerk requis (invité).
 * 403 si la réservation n'est pas en statut checkin ou si chambreNumero ne correspond pas.
 */
export function createRoomServiceOrder(payload: RoomServiceOrderPayload): Promise<RoomServiceOrderResponse> {
  return apiRequest<RoomServiceOrderResponse>('/api/commandes/room-service', {
    method: 'POST',
    body: payload,
    authenticated: true,
  });
}
