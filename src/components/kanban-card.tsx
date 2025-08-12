"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserContext } from "@/context/user-context";
import type { Task, Column } from "./kanban-board";
import { KanbanCardModal } from "./kanban-card-modal";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@/hooks/useUsers";

interface KanbanCardProps {
  task: Task;
  boardId: string;
  columns: Column[];
}

export function KanbanCard({ task, boardId, columns }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  const priorityLabels = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Garantir que a prioridade seja sempre uma das opções válidas
  const getPriorityInfo = (priority: string) => {
    const normalizedPriority = priority?.toLowerCase() || "medium";
    const validPriority = ["low", "medium", "high"].includes(normalizedPriority)
      ? normalizedPriority
      : "medium";

    return {
      value: validPriority,
      color: priorityColors[validPriority as keyof typeof priorityColors],
      label: priorityLabels[validPriority as keyof typeof priorityLabels],
    };
  };

  const priorityInfo = getPriorityInfo(task.priority);

  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useUserContext();
  const queryClient = useQueryClient();

  const { mutate: updateCard } = useMutation({
    mutationFn: async ({
      title,
      markdownContent,
      assignees,
      priority,
      columnId,
    }: {
      title: string;
      markdownContent: string;
      assignees: User[];
      priority: string;
      columnId: string;
    }) => {
      if (!user) throw new Error("User not authenticated");
      const res = await fetch(`/api/cards/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({
          ...task,
          title,
          markdownContent,
          assignees,
          priority,
          columnId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao editar card");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    },
  });

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={`cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
          isDragging ? "opacity-50" : ""
        }`}
        {...listeners}
        onClick={() => setModalOpen(true)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {task.description && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <Badge
              variant="secondary"
              className={`text-xs ${priorityInfo.color}`}
            >
              {priorityInfo.label}
            </Badge>
            <div className="flex -space-x-1">
              {task.assignees?.map((assignee) => (
                <Avatar
                  key={assignee.id}
                  className="h-6 w-6 border-2 border-white"
                >
                  <AvatarFallback className="text-xs">
                    {getInitials(assignee.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <KanbanCardModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        cardId={task.id}
        initialTitle={task.title}
        initialValue={task.markdownContent || ""}
        initialPriority={priorityInfo.value}
        initialColumnId={task.columnId}
        columns={columns}
        assignees={task.assignees}
        onSave={(title, description, assignees, priority, columnId) => {
          updateCard({
            title,
            markdownContent: description,
            assignees,
            priority,
            columnId,
          });
        }}
      />
    </>
  );
}
