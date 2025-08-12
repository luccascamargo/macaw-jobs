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

  try {
    const userCards = await prisma.card.findMany({
      where: {
        assignees: {
          some: {
            id: userId
          }
        }
      },
      include: {
        column: {
          include: {
            board: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        assignees: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      },
      orderBy: [
        {
          column: {
            order: "asc"
          }
        },
        {
          order: "asc"
        }
      ]
    });

    return NextResponse.json(userCards);
  } catch (error) {
    console.error("Erro ao buscar cards do usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
