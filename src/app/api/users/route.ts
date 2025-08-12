import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const boardId = searchParams.get("boardId");

  if (boardId) {
    const boardUsers = await prisma.boardUser.findMany({
      where: { boardId: boardId },
      select: { userId: true },
    });
    const existingUserIds = boardUsers.map((bu) => bu.userId);

    const users = await prisma.user.findMany({
      where: {
        id: {
          notIn: existingUserIds,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    return NextResponse.json(users);
  } else {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        lastname: true,
        email: true,
        avatar: true,
        username: true,
      },
    });
    return NextResponse.json(users);
  }
}
