import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { changePin, getOperatingHours, profileKeys, profileQueryOptions, saveOperatingHours, updateProfile, uploadLogo } from './api';

export function useProfile() {
  return useQuery(profileQueryOptions);
}

export function useOperatingHours() {
  return useQuery({ queryKey: profileKeys.operatingHours(), queryFn: ({ signal }) => getOperatingHours(signal) });
}

/** Invalidating ['profile'] also refreshes the session (useSessionValidation applies the profile). */
function useProfileMutation<TVars, TData>(mutationFn: (vars: TVars) => Promise<TData>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.all }) });
}

export const useUpdateProfile = () => useProfileMutation(updateProfile);
export const useSaveOperatingHours = () => useProfileMutation(saveOperatingHours);
export const useUploadLogo = () => useProfileMutation(uploadLogo);

export function useChangePin() {
  return useMutation({ mutationFn: changePin });
}
