import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: boardId } = await params;
    const requestingUserId = req.headers.get("x-user-id");

    if (!requestingUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId and role are required." },
        { status: 400 },
      );
    }

    const boardUser = await prisma.boardUser.create({
      data: {
        boardId,
        userId,
        role,
      },
    });

    return NextResponse.json(boardUser, { status: 201 });
  } catch (error) {
    console.error("Error inviting user to board:", error);
    return NextResponse.json(
      { error: "Error inviting user to board." },
      { status: 500 },
    );
  }
}
