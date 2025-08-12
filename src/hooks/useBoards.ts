"use client";
import { useQuery } from "@tanstack/react-query";
import { useUserContext } from "@/context/user-context";

export interface Board {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export function useBoards() {
  const { user } = useUserContext();

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["boards", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const res = await fetch("/api/boards");
      if (!res.ok)
        throw new Error((await res.json()).error || "Erro ao buscar boards");
      return res.json();
    },
    enabled: !!user, // Só executa a query quando há usuário logado
    staleTime: 1000 * 60 * 2, // 2 minutos para boards
  });

  return {
    boards: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}
