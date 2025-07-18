import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { title, boardId, order } = await req.json();

  if (!title || !boardId) {
    return NextResponse.json({ error: "Título e board obrigatórios" }, { status: 400 });
  }

  const column = await prisma.column.create({
    data: {
      title,
      order: order ?? 0,
      boardId,
    },
  });

  return NextResponse.json(column);
}
