"use client";
import { useBoard } from "@/hooks/useBoard";
import { KanbanBoard } from "@/components/kanban-board";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function BoardPage() {
  const params = useParams();
  const boardId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const { board, loading, error, refetch } = useBoard(boardId);
  const [creating, setCreating] = useState(false);
  const queryClient = useQueryClient();

  const createColumnMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!boardId) return;
      setCreating(true);
      const res = await fetch("/api/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, boardId, order: board?.columns.length ?? 0 }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao criar coluna");
      setCreating(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    },
    onSettled: () => setCreating(false),
  });

  const createCardMutation = useMutation({
    mutationFn: async ({ columnId, title }: { columnId: string; title: string }) => {
      setCreating(true);
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          columnId,
          priority: "medium",
          order: 0,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao criar card");
      setCreating(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    },
    onSettled: () => setCreating(false),
  });

  async function handleAddColumn(title: string) {
    await createColumnMutation.mutateAsync(title);
  }

  async function handleAddTask(columnId: string) {
    const title = prompt("Título da tarefa:");
    if (!title) return;
    await createCardMutation.mutateAsync({ columnId, title });
  }

  // Adaptar dados do backend para o formato esperado pelo KanbanBoard
  const columns = board?.columns.map((col: any) => ({
    id: col.id,
    title: col.title,
    order: col.order,
    tasks: col.cards.map((card: any) => ({
      ...card,
      assignee: card.assigneeId || undefined,
    })),
  })) ?? [];

  return (
    <KanbanBoard
      boardId={boardId}
      columns={columns}
      loading={loading || creating}
      error={error}
      onAddColumn={handleAddColumn}
      onAddTask={handleAddTask}
      refetchBoard={refetch}
    />
  );
} 