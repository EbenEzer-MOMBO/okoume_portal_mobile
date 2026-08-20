import { useQuery } from '@tanstack/react-query';

import { getMenu } from '@/lib/api/menu';

export function useMenu() {
  return useQuery({ queryKey: ['menu'], queryFn: getMenu });
}
