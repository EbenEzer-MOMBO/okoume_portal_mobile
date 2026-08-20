import { useMutation } from '@tanstack/react-query';

import { createRoomServiceOrder } from '@/lib/api/roomService';
import { RoomServiceOrderPayload } from '@/lib/api/types';

export function useCreateRoomServiceOrder() {
  return useMutation({
    mutationFn: (payload: RoomServiceOrderPayload) => createRoomServiceOrder(payload),
  });
}
