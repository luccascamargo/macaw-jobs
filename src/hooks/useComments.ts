import { useQuery } from "@tanstack/react-query";
import { User } from "./useUsers";

export interface Comment {
  id: string;
  content: string;
  author: User;
  mentions: User[];
  createdAt: string;
}

export function useComments(cardId: string) {
  return useQuery<Comment[]>({
    queryKey: ["comments", cardId],
    queryFn: async () => {
      const res = await fetch(`/api/cards/${cardId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch comments");
      }
      const card = await res.json();
      return card.comments;
    },
    enabled: !!cardId,
  });
}
