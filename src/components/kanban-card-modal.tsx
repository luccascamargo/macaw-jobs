import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, JSX } from "react";
import { Bold, Italic, Link as LinkIcon, List } from "lucide-react";
import { MarkdownEditor } from "./markdown-editor";

interface KanbanCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: string;
  onSave: (value: string) => void;
}

export function KanbanCardModal({
  open,
  onOpenChange,
  initialValue = "",
  onSave,
}: KanbanCardModalProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar descrição</DialogTitle>
        </DialogHeader>
        <MarkdownEditor markdown="" />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSave(value);
              onOpenChange(false);
            }}
          >
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
