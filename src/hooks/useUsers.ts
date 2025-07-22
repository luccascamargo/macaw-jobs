import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  name: string;
  email: string;
}

export function useUsers(boardId?: string) {
  return useQuery<User[]>({
    queryKey: ["users", boardId],
    queryFn: async () => {
      const url = boardId ? `/api/users?boardId=${boardId}` : '/api/users';
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao buscar usuários");
      }
      return res.json();
    },
  });
}
