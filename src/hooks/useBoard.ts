import { User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

export interface Card {
  id: string;
  title: string;
  description?: string;
  priority: string;
  order: number;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  cards: Card[];
}

export interface BoardDetail {
  id: string;
  title: string;
  columns: Column[];
  users: User[];
}

export function useBoard(boardId: string | undefined) {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["board", boardId],
    queryFn: async () => {
      if (!boardId) return null;
      const res = await fetch(`/api/boards/${boardId}`);
      if (!res.ok)
        throw new Error((await res.json()).error || "Erro ao buscar board");
      return res.json();
    },
    enabled: !!boardId,
  });

  return {
    board: data,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}
