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

interface KanbanCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: string;
  onSave: (value: string, assignees: User[]) => void;
  assignees?: User[];
}

export function KanbanCardModal({
  open,
  onOpenChange,
  initialValue = "",
  onSave,
  assignees = [],
}: KanbanCardModalProps) {
  const [value, setValue] = useState(initialValue);
  const { data: users } = useUsers();
  const [selectedUsers, setSelectedUsers] = useState<User[]>(assignees);

  const handleSave = () => {
    onSave(value, selectedUsers);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Card</DialogTitle>
        </DialogHeader>
        <MarkdownEditor markdown={value} />
        <div className="flex items-center gap-2">
          <p>Assignees:</p>
          <Select
            onValueChange={(userId) => {
              const user = users?.find((u) => u.id === userId);
              if (user && !selectedUsers.find((su) => su.id === userId)) {
                setSelectedUsers([...selectedUsers, user]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select users" />
            </SelectTrigger>
            <SelectContent>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-1 bg-gray-200 rounded-full px-2 py-1 text-xs"
              >
                {user.name}
                <button
                  onClick={() =>
                    setSelectedUsers(
                      selectedUsers.filter((su) => su.id !== user.id)
                    )
                  }
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
