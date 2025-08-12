import { resend } from "./resend";

interface MentionEmailData {
  mentionedUser: {
    id: string;
    name: string;
    email: string;
  };
  author: {
    name: string;
  };
  cardTitle: string;
  boardTitle: string;
  boardId: string;
  commentContent: string;
}

export async function sendMentionEmail(data: MentionEmailData) {
  try {
    const {
      mentionedUser,
      author,
      cardTitle,
      boardTitle,
      boardId,
      commentContent,
    } = data;

    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: mentionedUser.email,
      subject: `${author.name} mencionou você em um card`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Você foi mencionado em um comentário!</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>${author.name}</strong> mencionou você em um comentário no card:</p>
            <h3 style="color: #1e293b; margin: 10px 0;">${cardTitle}</h3>
            <p style="color: #64748b; font-size: 14px;">Board: ${boardTitle}</p>
          </div>
          
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #374151; margin: 0 0 10px 0;">Comentário:</h4>
            <p style="color: #1f2937; line-height: 1.6;">${commentContent}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/board/${boardId}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ver o card
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #64748b; font-size: 12px; text-align: center;">
            Este email foi enviado automaticamente pelo Macaw Jobs.
          </p>
        </div>
      `,
    });

    console.log(`Email de menção enviado para ${mentionedUser.email}`);
  } catch (error) {
    console.error("Erro ao enviar email de menção:", error);
    // Não vamos falhar a criação do comentário por causa de erro no email
  }
}
