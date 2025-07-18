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

  const { cardId, toColumnId, toOrder } = await req.json();
  if (!cardId || !toColumnId || typeof toOrder !== "number") {
    return NextResponse.json({ error: "Parâmetros obrigatórios ausentes." }, { status: 400 });
  }

  // Busca o card atual
  const card = await prisma.card.findUnique({ where: { id: cardId } });
  if (!card) {
    return NextResponse.json({ error: "Card não encontrado." }, { status: 404 });
  }

  // Remove o card da coluna de origem (ajusta ordem dos outros)
  await prisma.card.updateMany({
    where: {
      columnId: card.columnId,
      order: { gt: card.order },
    },
    data: {
      order: { decrement: 1 },
    },
  });

  // Move cards para abrir espaço na coluna de destino
  await prisma.card.updateMany({
    where: {
      columnId: toColumnId,
      order: { gte: toOrder },
    },
    data: {
      order: { increment: 1 },
    },
  });

  // Atualiza o card movido
  const updated = await prisma.card.update({
    where: { id: cardId },
    data: {
      columnId: toColumnId,
      order: toOrder,
    },
  });

  return NextResponse.json(updated);
} 