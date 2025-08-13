import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Erro ao fazer logout");
      }

      return res.json();
    },
    onSuccess: () => {
      // Define o dado do usuário como null no cache do React Query
      queryClient.setQueryData(["user"], null);
      // Redireciona para a página de login
      router.push("/auth/login");
    },
  });

  return {
    logout: mutation.mutate,
    loading: mutation.isPending,
    error: mutation.error?.message || null,
  };
}
