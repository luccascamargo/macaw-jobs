import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const {
    title,
    description,
    priority,
    columnId,
    order,
    assignees,
    markdownContent,
  } = await req.json();

  const card = await prisma.card.update({
    where: { id },
    data: {
      title,
      description,
      priority,
      columnId,
      order,
      markdownContent,
      assignees: {
        set: assignees.map((assignee: { id: string }) => ({ id: assignee.id })),
      },
    },
    include: {
      assignees: true,
    },
  });

  return NextResponse.json(card);
}
