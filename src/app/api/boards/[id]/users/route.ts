
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id: boardId } = params;
  const { userId, role } = await req.json();

  if (!userId || !role) {
    return NextResponse.json({ error: "userId e role são obrigatórios." }, { status: 400 });
  }

  try {
    const boardUser = await prisma.boardUser.create({
      data: {
        boardId,
        userId,
        role,
      },
    });
    return NextResponse.json(boardUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao convidar usuário para o board." }, { status: 500 });
  }
}
