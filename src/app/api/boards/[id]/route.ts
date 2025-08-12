import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
              columnId: true,
              assignees: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              title: true,
              description: true,
              markdownContent: true,
              priority: true,
              order: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
      users: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!board) {
    return NextResponse.json(
      { error: "Board não encontrado." },
      { status: 404 }
    );
  }

  const isUserMember = board.users.some(
    (boardUser) => boardUser.user.id === userId
  );
  if (!isUserMember) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const boardUsers = board.users.map((boardUser) => boardUser.user);

  return NextResponse.json({ ...board, users: boardUsers });
}
