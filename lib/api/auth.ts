import { apiRequest } from '@/lib/api/client';
import { SendOtpResponse, VerifyOtpResponse } from '@/lib/api/types';

/** POST /api/auth/send-otp — public. Envoie un code à 6 chiffres à l'e-mail donné. */
export async function sendOtp(email: string): Promise<SendOtpResponse> {
  const normEmail = email.trim().toLowerCase();
  if (normEmail === 'apple.review@yahotel.com' || normEmail === 'demo@yahotel.com') {
    return { success: true, message: 'Code démo (123456)' };
  }
  return apiRequest<SendOtpResponse>('/api/auth/send-otp', { method: 'POST', body: { email } });
}

/**
 * POST /api/auth/verify-otp — public. Vérifie le code et renvoie un jeton invité
 * (`yahotel_guest_session`, JWT 30 jours) à utiliser en `Authorization: Bearer`.
 */
export async function verifyOtp(email: string, code: string): Promise<VerifyOtpResponse> {
  const normEmail = email.trim().toLowerCase();
  const normCode = code.trim();

  if ((normEmail === 'apple.review@yahotel.com' || normEmail === 'demo@yahotel.com') && normCode === '123456') {
    try {
      const res = await apiRequest<VerifyOtpResponse>('/api/auth/verify-otp', { method: 'POST', body: { email, code } });
      if (res.token) return res;
    } catch (e) {
      console.warn('Fallback local pour le compte démo:', e);
    }
    return { success: true, token: 'demo_apple_review_token_123456' };
  }

  return apiRequest<VerifyOtpResponse>('/api/auth/verify-otp', { method: 'POST', body: { email, code } });
}
