import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function POST(req: NextRequest) {
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

  const { title, columnId, priority, order } = await req.json();
  if (!title || !columnId) {
    return NextResponse.json({ error: "Título e coluna obrigatórios." }, { status: 400 });
  }

  const card = await prisma.card.create({
    data: {
      title,
      columnId,
      priority: priority || "medium",
      order: order ?? 0,
      assigneeId: null,
    },
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
  });

  return NextResponse.json(card, { status: 201 });
} 