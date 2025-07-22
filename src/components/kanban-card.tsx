"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GripVertical } from "lucide-react";
import type { Task } from "./kanban-board";
import { KanbanCardModal } from "./kanban-card-modal";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@/hooks/useUsers";

interface KanbanCardProps {
  task: Task;
}

export function KanbanCard({ task }: KanbanCardProps) {
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const [modalOpen, setModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { mutate: updateCard } = useMutation({
    mutationFn: async ({
      markdownContent,
      assignees,
    }: {
      markdownContent: string;
      assignees: User[];
    }) => {
      const res = await fetch(`/api/cards/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...task,
          markdownContent,
          assignees,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao editar card");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", task.columnId] });
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
            <div className="cursor-grab active:cursor-grabbing p-1">
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
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
              className={`text-xs ${
                priorityColors[task.priority as keyof typeof priorityColors]
              }`}
            >
              {task.priority}
            </Badge>
            <div className="flex -space-x-2">
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
        initialValue={task.markdownContent || ""}
        assignees={task.assignees}
        onSave={(value, assignees) => {
          updateCard({ markdownContent: value, assignees });
        }}
      />
    </>
  );
}
