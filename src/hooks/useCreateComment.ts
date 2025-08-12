import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserContext } from "../context/user-context";

interface CreateCommentPayload {
  content: string;
  cardId: string;
  mentions?: string[];
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { user } = useUserContext();

  return useMutation({
    mutationFn: async (payload: CreateCommentPayload) => {
      if (!user) throw new Error("User not found");

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to create comment");
      }

      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["comments", variables.cardId] as any);
    },
  });
}
