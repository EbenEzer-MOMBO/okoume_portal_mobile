import { apiRequest } from '@/lib/api/client';
import { SendOtpResponse, VerifyOtpResponse } from '@/lib/api/types';

/** POST /api/auth/send-otp — public. Envoie un code à 6 chiffres à l'e-mail donné. */
export function sendOtp(email: string): Promise<SendOtpResponse> {
  return apiRequest<SendOtpResponse>('/api/auth/send-otp', { method: 'POST', body: { email } });
}

/**
 * POST /api/auth/verify-otp — public. Vérifie le code et renvoie un jeton invité
 * (`yahotel_guest_session`, JWT 30 jours) à utiliser en `Authorization: Bearer`.
 */
export function verifyOtp(email: string, code: string): Promise<VerifyOtpResponse> {
  return apiRequest<VerifyOtpResponse>('/api/auth/verify-otp', { method: 'POST', body: { email, code } });
}
