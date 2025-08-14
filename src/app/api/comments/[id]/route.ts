import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateCommentSchema = z.object({
  content: z.string().min(1),
  mentions: z.array(z.string().uuid()).optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = req.headers.get("x-user-id");
    const { id: commentId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.authorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { content, mentions } = updateCommentSchema.parse(body);

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content,
        mentions: mentions
          ? { set: mentions.map((id) => ({ id })) }
          : { set: [] },
      },
      include: {
        author: true,
        mentions: true,
      },
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = req.headers.get("x-user-id");
    const { id: commentId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.authorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: "Comment deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
