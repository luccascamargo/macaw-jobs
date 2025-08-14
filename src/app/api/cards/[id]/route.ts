import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

import { sendAssigneeEmail } from "@/lib/email-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const card = await prisma.card.findUnique({
    where: { id },
    include: {
      assignees: true,
      comments: {
        include: {
          author: true,
          mentions: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return NextResponse.json(card);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const assignedById = req.headers.get("x-user-id");

    if (!assignedById) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignedByUser = await prisma.user.findUnique({
      where: { id: assignedById },
    });
    if (!assignedByUser) {
      return NextResponse.json(
        { error: "Assigner not found" },
        { status: 404 },
      );
    }

    const body = await req.json();
    const { assignees: newAssignees, ...cardData } = body;

    // 1. Get the card before the update
    const cardBeforeUpdate = await prisma.card.findUnique({
      where: { id },
      include: {
        assignees: true,
        column: {
          include: {
            board: true,
          },
        },
      },
    });

    if (!cardBeforeUpdate) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const oldAssigneeIds = cardBeforeUpdate.assignees.map((a) => a.id);

    // 2. Perform the update
    const updatedCard = await prisma.card.update({
      where: { id },
      data: {
        ...cardData,
        assignees: newAssignees
          ? {
              set: newAssignees.map((assignee: { id: string }) => ({
                id: assignee.id,
              })),
            }
          : undefined,
      },
      include: {
        assignees: true,
      },
    });

    // 3. Determine new assignees and send emails
    if (newAssignees) {
      const newlyAssignedUsers = updatedCard.assignees.filter(
        (user) => !oldAssigneeIds.includes(user.id),
      );

      // Use Promise.all to send emails in parallel
      await Promise.all(
        newlyAssignedUsers.map((user) =>
          sendAssigneeEmail({
            assignedUser: user,
            cardTitle: updatedCard.title,
            boardId: cardBeforeUpdate.column.board.id,
            boardTitle: cardBeforeUpdate.column.board.title,
            assignedBy: assignedByUser,
          }),
        ),
      );
    }

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error("Error updating card:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
