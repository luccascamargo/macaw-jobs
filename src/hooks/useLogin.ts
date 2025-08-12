import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { User } from "./useUser";

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao fazer login");
      }

      return res.json();
    },
    onSuccess: (user: User) => {
      // Invalida e refetch a query de usuário
      queryClient.invalidateQueries({ queryKey: ["user"] });
      // Invalida também a query de boards para garantir que seja recarregada
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      // Redireciona para a página principal
      router.push("/");
    },
  });

  return {
    login: mutation.mutate,
    loading: mutation.isPending,
    error: mutation.error?.message || null,
  };
}
