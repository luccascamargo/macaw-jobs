"use client";

import { useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { User } from "@/hooks/useUsers";
import { InputDialog } from "./ui/input-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserContext } from "@/context/user-context";
import { Navbar } from "./navbar";
import { useBoard } from "@/hooks/useBoard";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  assignees?: User[];
  order: number;
  createdAt: string;
  updatedAt: string;
  markdownContent?: string; // campo opcional para markdown
  columnId: string;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  order: number;
}

interface KanbanBoardProps {
  boardId: string;
}

export function KanbanBoard({ boardId }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [creating, setCreating] = useState(false);
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useUserContext();
  const { board, loading, error, refetch } = useBoard(boardId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  // Drag and drop handlers (mantidos, mas precisam ser adaptados para mutações reais futuramente)
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedTask = findTask(active.id as string);
    if (!draggedTask) return;
    setActiveTask(draggedTask);
  };

  const handleDragOver = (event: DragOverEvent) => {};

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Encontrar coluna e posição de origem e destino
    const activeId = active.id as string;
    const overId = over.id as string;
    let fromColumn: Column | undefined, toColumn: Column | undefined;
    let fromIndex = -1,
      toIndex = -1;
    for (const col of columns) {
      const idx = col.tasks.findIndex((t: { id: string }) => t.id === activeId);
      if (idx !== -1) {
        fromColumn = col;
        fromIndex = idx;
      }
      const overIdx = col.tasks.findIndex(
        (t: { id: string }) => t.id === overId
      );
      if (overIdx !== -1) {
        toColumn = col;
        toIndex = overIdx;
      }
    }
    // Se soltou em uma coluna vazia
    if (!toColumn) {
      toColumn = columns.find((col: { id: string }) => col.id === overId);
      toIndex = 0;
    }
    if (!fromColumn || !toColumn) return;

    // Se não mudou nada, não faz nada
    if (fromColumn.id === toColumn.id && fromIndex === toIndex) return;

    // Chama API para atualizar ordem
    await fetch("/api/cards/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: activeId,
        toColumnId: toColumn.id,
        toOrder: toIndex,
      }),
    });
    await refetch();
  };

  // Funções utilitárias
  function findTask(id: string): Task | undefined {
    for (const column of columns) {
      const task = column.tasks.find((task: { id: string }) => task.id === id);
      if (task) return task;
    }
  }

  const inviteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!boardId || !user) return;
      const res = await fetch(`/api/boards/${boardId}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
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

  if (loading) {
    return <div className="text-center py-10">Carregando...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
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
    <>
      <Navbar
        boardId={boardId}
        onAddColumn={() => setIsAddColumnDialogOpen(true)}
        onInviteUser={handleInviteUser}
        boardUsers={board?.users || []}
      />
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          <SortableContext items={columns.map((col: { id: any }) => col.id)}>
            {columns.map((column: Column) => (
              <div key={column.id} className="flex-shrink-0">
                <KanbanColumn
                  boardId={boardId}
                  column={{ ...column, tasks: column.tasks }}
                  columns={columns}
                  onAddTask={(title) => handleAddTask(column.id, title)}
                />
              </div>
            ))}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeTask ? (
            <KanbanCard task={activeTask} boardId={boardId} columns={columns} />
          ) : null}
        </DragOverlay>
      </DndContext>
      <InputDialog
        open={isAddColumnDialogOpen}
        onOpenChange={setIsAddColumnDialogOpen}
        onSave={handleAddColumn}
        title="Criar Nova Coluna"
        description="Dê um nome para a sua nova coluna."
        inputLabel="Nome"
        inputPlaceholder="Ex: Em andamento"
      />
    </>
  );
}
