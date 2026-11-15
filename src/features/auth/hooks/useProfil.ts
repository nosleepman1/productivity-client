import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profilService } from "@/services";
import { useAuthStore } from "@/store/auth.store";
import type { UpdateProfilDto } from "@/types/auth";

export const profilKeys = {
  all: ["profil"] as const,
  me: () => [...profilKeys.all, "me"] as const,
};

export function useProfil() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: profilKeys.me(),
    queryFn: () => profilService.getMyProfil(),
    enabled: isAuthenticated,
  });
}

export function useUpdateProfilMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilDto) =>
      profilService.updateMyProfil(payload),
    onSuccess: (updatedProfil) => {
      queryClient.setQueryData(profilKeys.me(), updatedProfil);
    },
  });
}
