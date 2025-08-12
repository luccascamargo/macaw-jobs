import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { MarkdownEditor } from "./markdown-editor";
import { useUsers, User } from "@/hooks/useUsers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useComments } from "@/hooks/useComments";
import { useCreateComment } from "@/hooks/useCreateComment";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User as UserIcon, Text, MessageSquare, Type } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { CommentInput } from "./comment-input";

interface KanbanCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardId: string;
  initialTitle?: string;
  initialValue?: string;
  onSave: (title: string, description: string, assignees: User[]) => void;
  assignees?: User[];
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export function KanbanCardModal({
  open,
  onOpenChange,
  cardId,
  initialTitle = "",
  initialValue = "",
  onSave,
  assignees = [],
}: KanbanCardModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [value, setValue] = useState(initialValue);
  const { data: users } = useUsers();
  const [selectedUsers, setSelectedUsers] = useState<User[]>(assignees);
  const { data: comments, refetch: refetchComments } = useComments(cardId);
  const { mutate: createComment } = useCreateComment();
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setValue(initialValue);
      setSelectedUsers(assignees);
    }
  }, [open, initialTitle, initialValue, assignees]);

  const handleSave = () => {
    onSave(title, value, selectedUsers);
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
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Title</DialogTitle>
          <div className="flex items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold border-none focus-visible:ring-transparent focus-visible:ring-offset-0 p-0 h-auto"
              placeholder="Título da Tarefa"
            />
          </div>
        </DialogHeader>
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
              <h3 className="text-sm font-medium  text-gray-500">
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
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
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
                            selectedUsers.filter((su) => su.id !== user.id)
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
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
