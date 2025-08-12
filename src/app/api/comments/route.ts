import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendMentionEmail } from "@/lib/email-service";

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

    // Buscar informações do card e board para o email
    const cardWithBoard = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        column: {
          include: {
            board: true,
          },
        },
      },
    });

    if (!cardWithBoard) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Buscar informações do autor
    const author = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

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

    // Enviar emails para usuários mencionados
    if (mentions && mentions.length > 0) {
      const mentionedUsers = await prisma.user.findMany({
        where: { id: { in: mentions } },
        select: { id: true, name: true, email: true },
      });

      // Enviar emails de forma assíncrona (não bloquear a resposta)
      mentionedUsers.forEach((mentionedUser) => {
        // Usar Promise.resolve para não bloquear a resposta
        Promise.resolve()
          .then(() => {
            sendMentionEmail({
              mentionedUser,
              author: { name: author.name },
              cardTitle: cardWithBoard.title,
              boardTitle: cardWithBoard.column.board.title,
              boardId: cardWithBoard.column.board.id,
              commentContent: content,
            });
          })
          .catch((error) => {
            console.error(
              "Erro ao enviar email para",
              mentionedUser.email,
              ":",
              error
            );
          });
      });
    }

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
