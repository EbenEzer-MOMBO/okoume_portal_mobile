import { useMutation } from '@tanstack/react-query';

import { initiatePayment } from '@/lib/api/payments';
import { InitierPaiementPayload } from '@/lib/api/types';

export function useInitiatePayment() {
  return useMutation({
    mutationFn: (payload: InitierPaiementPayload) => initiatePayment(payload),
  });
}
