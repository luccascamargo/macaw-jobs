"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Comment } from "./types/card";

interface CommentListProps {
  comments: Comment[];
}

export function CommentList({ comments }: CommentListProps) {
  const renderCommentContent = (content: string, mentions: string[]) => {
    return content.split(/(@\w+)/g).map((part, index) => {
      if (part.startsWith("@") && mentions.includes(part.substring(1))) {
        return (
          <span
            key={index}
            className="bg-blue-100 text-blue-800 px-1 rounded font-medium"
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhum comentário ainda.</p>
        <p className="text-sm">Seja o primeiro a comentar!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage
              src={comment.author.avatar || "/placeholder.svg"}
              alt={comment.author.name}
            />
            <AvatarFallback>
              {comment.author.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.createdAt, {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
            <div className="text-sm text-foreground leading-relaxed">
              {renderCommentContent(comment.content, comment.mentions)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
