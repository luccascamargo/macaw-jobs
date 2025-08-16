"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanCard } from "./kanban-card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { Column } from "./kanban-board";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ConfirmationDialog } from "./ui/confirmation-dialog";
import { InputDialog } from "./ui/input-dialog";

interface KanbanColumnProps {
  boardId: string;
  column: Column;
  columns: Column[];
  onAddTask: (title: string) => void;
}

export function KanbanColumn({
  boardId,
  column,
  columns,
  onAddTask,
}: KanbanColumnProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: deleteColumn } = useMutation({
    mutationFn: async () => {
      await fetch(`/api/columns/${column.id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    },
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="w-80 bg-gray-100 rounded-lg p-4 min-h-40 flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{column.title}</h3>
            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
              {column.tasks.length}
            </span>
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddTaskDialogOpen(true)}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <SortableContext
          items={column.tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 max-h-[calc(80vh-120px)] overflow-y-auto p-2">
            {column.tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                boardId={boardId}
                columns={columns}
              />
            ))}
          </div>
        </SortableContext>
      </div>
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={deleteColumn}
        title="Tem certeza que deseja excluir esta coluna?"
        description="Todos os cards nesta coluna serão permanentemente excluídos. Esta ação não pode ser desfeita."
      />
      <InputDialog
        open={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        onSave={onAddTask}
        title="Criar Novo Card"
        description="Dê um título para o seu novo card."
        inputLabel="Título"
        inputPlaceholder="Ex: Corrigir bug na autenticação"
      />
    </>
  );
}
