"use client";

import { useCallback, useState } from "react";
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
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { User } from "@/hooks/useUsers";

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
  columns: Column[];
  loading: boolean;
  error: string | null;
  onAddColumn: (title: string) => Promise<void>;
  onAddTask: (columnId: string, title: string) => Promise<void>;
  refetchBoard?: () => void | Promise<any>;
}

export function KanbanBoard({
  boardId,
  columns,
  loading,
  error,
  onAddColumn,
  onAddTask,
  refetchBoard,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

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
      const idx = col.tasks.findIndex((t) => t.id === activeId);
      if (idx !== -1) {
        fromColumn = col;
        fromIndex = idx;
      }
      const overIdx = col.tasks.findIndex((t) => t.id === overId);
      if (overIdx !== -1) {
        toColumn = col;
        toIndex = overIdx;
      }
    }
    // Se soltou em uma coluna vazia
    if (!toColumn) {
      toColumn = columns.find((col) => col.id === overId);
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
    if (refetchBoard) await refetchBoard();
  };

  // Funções utilitárias
  function findTask(id: string): Task | undefined {
    for (const column of columns) {
      const task = column.tasks.find((task) => task.id === id);
      if (task) return task;
    }
  }

  if (loading) {
    return <div className="text-center py-10">Carregando...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4">
        <SortableContext items={columns.map((col) => col.id)}>
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0">
              <KanbanColumn
                boardId={boardId}
                column={{ ...column, tasks: column.tasks }}
                onAddTask={(title) => onAddTask(column.id, title)}
              />
            </div>
          ))}
        </SortableContext>
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-5">
            <KanbanCard task={activeTask} boardId={boardId} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
