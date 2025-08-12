"use client";
import { useBoard } from "@/hooks/useBoard";
import { KanbanBoard } from "@/components/kanban-board";
import { Navbar } from "@/components/navbar";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InputDialog } from "@/components/ui/input-dialog";
import { User, useUsers } from "@/hooks/useUsers";

export default function BoardPage() {
  const params = useParams();
  const boardId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";
  const { board, loading, error, refetch } = useBoard(boardId);
  const [creating, setCreating] = useState(false);
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const inviteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!boardId) return;
      const res = await fetch(`/api/boards/${boardId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: "MEMBER" }), // Default to MEMBER role
      });
      if (!res.ok)
        throw new Error((await res.json()).error || "Erro ao convidar usuário");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      queryClient.invalidateQueries({ queryKey: ["users"] }); // Invalidate users query to refresh available users
    },
  });

  async function handleInviteUser(userId: string) {
    await inviteUserMutation.mutateAsync(userId);
  }

  const createColumnMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!boardId) return;
      setCreating(true);
      const res = await fetch("/api/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          boardId,
          order: board?.columns.length ?? 0,
        }),
      });
      if (!res.ok)
        throw new Error((await res.json()).error || "Erro ao criar coluna");
      setCreating(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    },
    onSettled: () => setCreating(false),
  });

  const createCardMutation = useMutation({
    mutationFn: async ({
      columnId,
      title,
    }: {
      columnId: string;
      title: string;
    }) => {
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
      if (!res.ok)
        throw new Error((await res.json()).error || "Erro ao criar card");
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

  async function handleAddTask(columnId: string, title: string) {
    await createCardMutation.mutateAsync({ columnId, title });
  }

  // Adaptar dados do backend para o formato esperado pelo KanbanBoard
  const columns =
    board?.columns.map((col: any) => ({
      id: col.id,
      title: col.title,
      order: col.order,
      tasks: col.cards.map((card: any) => ({
        ...card,
        assignees: card.assignees || [],
      })),
    })) ?? [];

  return (
    <div>
      <Navbar
        boardId={boardId}
        onAddColumn={() => setIsAddColumnDialogOpen(true)}
        onInviteUser={handleInviteUser}
        boardUsers={board?.users || []}
      />
      <div className="pt-4 px-4">
        <KanbanBoard
          boardId={boardId}
          columns={columns}
          loading={loading || creating}
          error={error}
          onAddColumn={handleAddColumn}
          onAddTask={handleAddTask}
          refetchBoard={refetch}
        />
      </div>
      <InputDialog
        open={isAddColumnDialogOpen}
        onOpenChange={setIsAddColumnDialogOpen}
        onSave={handleAddColumn}
        title="Criar Nova Coluna"
        description="Dê um nome para a sua nova coluna."
        inputLabel="Nome"
        inputPlaceholder="Ex: Em andamento"
      />
    </div>
  );
}
