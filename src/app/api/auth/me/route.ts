import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }
    return NextResponse.json(user);
  } catch (e) {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }
}
