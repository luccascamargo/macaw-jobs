import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function GET(req: NextRequest) {
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

  const boards = await prisma.board.findMany({
    where: {
      users: {
        some: {
          userId,
        },
      },
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(boards);
}

export async function POST(req: NextRequest) {
  const { title, userId } = await req.json();

  if (!title || !userId) {
    return NextResponse.json(
      { error: "Título e usuário obrigatórios" },
      { status: 400 }
    );
  }

  const board = await prisma.board.create({
    data: {
      title,
      users: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
  });

  return NextResponse.json(board);
}
