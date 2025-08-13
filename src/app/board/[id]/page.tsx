import { KanbanBoard } from "@/components/kanban-board";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <div className="pt-4 px-4">
        <KanbanBoard boardId={id} />
      </div>
    </div>
  );
}
