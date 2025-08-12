import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

interface Board {
  id: string;
  title: string;
}

interface Column {
  id: string;
  title: string;
  order: number;
  board: Board;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: User;
}

interface Card {
  id: string;
  title: string;
  description?: string;
  priority: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  markdownContent?: string;
  column: Column;
  assignees: User[];
  comments: Comment[];
}

const fetchMyCards = async (): Promise<Card[]> => {
  const response = await fetch("/api/cards/my-cards");
  if (!response.ok) {
    throw new Error("Falha ao buscar cards");
  }
  return response.json();
};

export const useMyCards = () => {
  return useQuery({
    queryKey: ["my-cards"],
    queryFn: fetchMyCards,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });
};
