import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar: string;
  createdAt: string;
}

export function useUser() {
  const {
    data: user,
    error,
    isLoading: loading,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok)
        throw new Error((await res.json()).error || "Erro ao buscar usuário");
      return res.json();
    },
    staleTime: 1000 * 60 * 30, // 30 minutos para usuário
    gcTime: 1000 * 60 * 60, // 1 hora
    retry: false, // Não tenta novamente se falhar (usuário não logado)
  });

  return {
    user: user || null,
    loading,
    error: error?.message || null,
  };
}
