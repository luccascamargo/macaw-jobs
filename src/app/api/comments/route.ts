import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createCommentSchema = z.object({
  content: z.string().min(1),
  cardId: z.uuid(),
  mentions: z.array(z.string().uuid()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, cardId, mentions } = createCommentSchema.parse(body);

    const comment = await prisma.comment.create({
      data: {
        content,
        cardId,
        authorId: userId,
        mentions: mentions
          ? { connect: mentions.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        author: true,
        mentions: true,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
