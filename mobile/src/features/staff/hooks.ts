import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addStaff, deleteStaff, editStaff, getStaff, staffKeys } from './api';
import type { EditStaffRequest } from './types';

export function useStaff() {
  return useQuery({ queryKey: staffKeys.all, queryFn: ({ signal }) => getStaff(signal) });
}

function useInvalidateStaff() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: staffKeys.all });
}

export function useAddStaff() {
  const onSuccess = useInvalidateStaff();
  return useMutation({ mutationFn: addStaff, onSuccess });
}

export function useEditStaff() {
  const onSuccess = useInvalidateStaff();
  return useMutation({ mutationFn: ({ userId, body }: { userId: number; body: EditStaffRequest }) => editStaff(userId, body), onSuccess });
}

export function useDeleteStaff() {
  const onSuccess = useInvalidateStaff();
  return useMutation({ mutationFn: deleteStaff, onSuccess });
}
