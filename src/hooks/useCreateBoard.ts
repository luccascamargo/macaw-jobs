"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserContext } from "@/context/user-context";

interface CreateBoardData {
  title: string;
}

export function useCreateBoard() {
  const queryClient = useQueryClient();
  const { user } = useUserContext();

  const mutation = useMutation({
    mutationFn: async (data: CreateBoardData) => {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: data.title }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao criar board");
      }

      return res.json();
    },
    onSuccess: () => {
      // Invalida e refetch a query de boards
      queryClient.invalidateQueries({ queryKey: ["boards", user?.id] });
    },
  });

  return mutation;
}
