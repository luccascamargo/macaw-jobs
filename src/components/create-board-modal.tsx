"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserContext } from "@/context/user-context";
import { useCreateBoard } from "@/hooks/useCreateBoard";

const schema = z.object({
  title: z.string().min(2, { message: "Título obrigatório" }),
});

type FormValues = z.infer<typeof schema>;

export function CreateBoardModal() {
  const [open, setOpen] = useState(false);
  const { user } = useUserContext();
  const createBoard = useCreateBoard();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      await createBoard.mutateAsync(values);
      setOpen(false);
      form.reset();
    } catch (err: any) {
      // O erro será tratado pelo React Query
      console.error("Erro ao criar board:", err);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">+ Novo Board</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar novo board</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do board" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {createBoard.error && (
              <div className="text-red-500 text-sm">
                {createBoard.error.message}
              </div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={createBoard.isPending}>
                {createBoard.isPending ? "Criando..." : "Criar"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancelar
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
