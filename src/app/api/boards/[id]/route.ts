import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  let userId = null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    userId = payload.sub;
  } catch {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  const board = await prisma.board.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      columns: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          order: true,
          cards: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              description: true,
              priority: true,
              order: true,
              assigneeId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
      users: {
        where: { userId },
        select: { userId: true },
      },
    },
  });

  if (!board) {
    return NextResponse.json({ error: "Board não encontrado." }, { status: 404 });
  }
  if (!board.users.length) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  // Remove info de users do retorno
  const { users, ...boardData } = board;
  return NextResponse.json(boardData);
} 