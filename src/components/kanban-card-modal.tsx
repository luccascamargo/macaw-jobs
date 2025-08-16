import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { MarkdownEditor } from "./markdown-editor";
import { useUsers, User } from "@/hooks/useUsers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useComments } from "@/hooks/useComments";
import { useCreateComment } from "@/hooks/useCreateComment";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User as UserIcon,
  Text,
  MessageSquare,
  Flag,
  Move,
} from "lucide-react";
import { Input } from "./ui/input";
import { CommentInput } from "./comment-input";
import { Badge } from "./ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogTitle } from "@radix-ui/react-dialog";

interface Column {
  id: string;
  title: string;
  order: number;
}

interface KanbanCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardId: string;
  initialTitle?: string;
  initialValue?: string;
  initialPriority?: string;
  initialColumnId?: string;
  columns?: Column[];
  onSave: (
    title: string,
    description: string,
    assignees: User[],
    priority: string,
    columnId: string,
  ) => void;
  assignees?: User[];
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const priorityOptions = [
  { value: "low", label: "Baixa", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "Média", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "Alta", color: "bg-red-100 text-red-800" },
];

export function KanbanCardModal({
  open,
  onOpenChange,
  cardId,
  initialTitle = "",
  initialValue = "",
  initialPriority = "medium",
  initialColumnId = "",
  columns = [],
  onSave,
  assignees = [],
}: KanbanCardModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [value, setValue] = useState(initialValue);
  const [priority, setPriority] = useState(initialPriority);
  const [columnId, setColumnId] = useState(initialColumnId);
  const { data: users } = useUsers();
  const [selectedUsers, setSelectedUsers] = useState<User[]>(assignees);
  const { data: comments, refetch: refetchComments } = useComments(cardId);
  const { mutate: createComment } = useCreateComment();
  const [comment, setComment] = useState("");

  const getValidPriority = (priority: string) => {
    const normalizedPriority = priority?.toLowerCase() || "medium";
    return (
      priorityOptions.find((p) => p.value === normalizedPriority)?.value ||
      "medium"
    );
  };

  const getValidColumnId = (columnId: string) => {
    if (!columnId || !columns.length) return columns[0]?.id || "";
    const foundColumn = columns.find((c) => c.id === columnId);
    return foundColumn?.id || columns[0]?.id || "";
  };

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setValue(initialValue);
      setPriority(getValidPriority(initialPriority));
      const validColumn = getValidColumnId(initialColumnId);
      setColumnId(validColumn);
      setSelectedUsers(assignees);
    }
  }, [
    open,
    initialTitle,
    initialValue,
    initialPriority,
    initialColumnId,
    assignees,
    columns,
  ]);

  useEffect(() => {
    if (columns.length > 0) {
      const validColumnId = getValidColumnId(columnId);
      if (validColumnId !== columnId) {
        setColumnId(validColumnId);
      }
    }
  }, [columns, columnId]);

  const handleSave = () => {
    const finalColumnId = getValidColumnId(columnId);
    onSave(title, value, selectedUsers, priority, finalColumnId);
    onOpenChange(false);
  };

  const handleComment = () => {
    if (!comment.trim()) return;

    const mentions = users
      ?.filter((u) => comment.includes(`@${u.name}`))
      .map((u) => u.id);

    createComment(
      {
        cardId,
        content: comment,
        mentions,
      },
      {
        onSuccess: () => {
          setComment("");
          refetchComments();
        },
      },
    );
  };

  const currentPriority = priorityOptions.find((p) => p.value === priority);
  const validColumnId = getValidColumnId(columnId);
  const displayColumn = columns.find((c) => c.id === validColumnId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-3xl flex flex-col">
        <DialogHeader>
          <DialogTitle className="sr-only">Title</DialogTitle>
          <div className="flex items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl max-w-2xl font-bold"
              placeholder="Título da Tarefa"
            />
          </div>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-6 -mr-6 h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {/* Coluna Principal */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <Text size={20} /> Descrição
                </h3>
                <div className="min-h-[150px]">
                  <MarkdownEditor
                    markdown={value}
                    onChange={(e) => setValue(e)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <MessageSquare size={20} /> Atividade
                </h3>
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>EU</AvatarFallback>
                  </Avatar>
                  <div className="w-full">
                    <CommentInput cardId={cardId} />
                    {comment && (
                      <Button onClick={handleComment} className="mt-2">
                        Salvar
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  {comments?.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(comment.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="w-full">
                        <p className="font-semibold">{comment.author.name}</p>
                        <div className="prose prose-sm max-w-none text-gray-600">
                          {comment.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Coluna Lateral */}
            <div className="md:col-span-1 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Propriedades
                </h3>

                {/* Seletor de Coluna */}
                <div className="mt-2">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Coluna
                  </label>
                  <Select value={columnId} onValueChange={setColumnId}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2">
                        <Move size={16} />
                        <span>Mover para</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((column) => (
                        <SelectItem key={column.id} value={column.id}>
                          <div className="flex items-center gap-2">
                            <span>{column.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {displayColumn ? (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        Coluna atual: {displayColumn.title}
                      </Badge>
                    </div>
                  ) : columnId ? (
                    <div className="mt-2">
                      <Badge
                        variant="outline"
                        className="text-xs text-yellow-600"
                      >
                        Coluna não encontrada
                      </Badge>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <Badge
                        variant="outline"
                        className="text-xs text-gray-500"
                      >
                        Nenhuma coluna selecionada
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Seletor de Prioridade */}
                <div className="mt-2">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Prioridade
                  </label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2">
                        <Flag size={16} />
                        <span>Prioridade</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${option.color}`}
                            >
                              {option.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {currentPriority && (
                    <div className="mt-2">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${currentPriority.color}`}
                      >
                        Prioridade atual: {currentPriority.label}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Adicionar ao card
                </h3>
                <Select
                  onValueChange={(userId) => {
                    const user = users?.find((u) => u.id === userId);
                    if (user && !selectedUsers.find((su) => su.id === userId)) {
                      setSelectedUsers([...selectedUsers, user]);
                    }
                  }}
                >
                  <SelectTrigger className="w-full justify-start mt-2">
                    <div className="flex items-center gap-2">
                      <UserIcon size={16} />
                      <span>Membros</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback>
                              {`${getInitials(user.name)}${getInitials(user.lastname)}`}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {user.name} {user.lastname}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedUsers.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Membros
                  </h3>
                  <div className="space-y-2">
                    {selectedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-50 group-hover:opacity-100"
                          onClick={() =>
                            setSelectedUsers(
                              selectedUsers.filter((su) => su.id !== user.id),
                            )
                          }
                        >
                          x
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
