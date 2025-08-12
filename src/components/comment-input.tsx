"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, AtSign } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { useCreateComment } from "@/hooks/useCreateComment";
import { useComments } from "@/hooks/useComments";
import { User } from "./types/card";

interface ICommentInput {
  cardId: string;
}

export function CommentInput({ cardId }: ICommentInput) {
  const [comment, setComment] = useState("");
  const { data: users } = useUsers();
  const [showUserList, setShowUserList] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(0);
  const { refetch: refetchComments } = useComments(cardId);
  const { mutate: createComment } = useCreateComment();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;

    setComment(value);

    // Procurar por "@" antes da posição do cursor
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);

      // Verificar se não há espaços após o "@"
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        const searchTerm = textAfterAt.toLowerCase();
        const filtered = users?.filter(
          (user) =>
            user.name.toLowerCase().includes(searchTerm) ||
            user.username.toLowerCase().includes(searchTerm)
        );

        setFilteredUsers(filtered);
        setMentionStart(lastAtIndex);
        setSelectedUserIndex(0);
        setShowUserList(true);
      } else {
        setShowUserList(false);
      }
    } else {
      setShowUserList(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showUserList && filteredUsers.length > 0) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedUserIndex((prev) =>
            prev < filteredUsers.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedUserIndex((prev) =>
            prev > 0 ? prev - 1 : filteredUsers.length - 1
          );
          break;
        case "Enter":
        case "Tab":
          e.preventDefault();
          selectUser(filteredUsers[selectedUserIndex]);
          break;
        case "Escape":
          setShowUserList(false);
          break;
      }
    }
  };

  const selectUser = (user: User) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const cursorPosition = textarea.selectionStart;
      const textBeforeMention = comment.substring(0, mentionStart);
      const textAfterCursor = comment.substring(cursorPosition);

      const newText = `${textBeforeMention}@${user.username} ${textAfterCursor}`;
      setComment(newText);
      setShowUserList(false);

      // Reposicionar cursor após a menção
      setTimeout(() => {
        const newCursorPosition = mentionStart + user.username.length + 2;
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        textarea.focus();
      }, 0);
    }
  };

  const handleSubmit = () => {
    if (!comment.trim()) return;

    const mentions = users
      ?.filter((u) => comment.includes(`@${u.name}`))
      .map((u) => u.id);

    createComment(
      {
        cardId,
        content: comment,
        mentions,
      },
      {
        onSuccess: () => {
          setComment("");
          refetchComments();
        },
      }
    );
  };

  // Fechar lista ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setShowUserList(false);
      }
    };

    if (showUserList) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserList]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="relative">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AtSign className="h-4 w-4" />
            <span>Digite @ para mencionar usuários</span>
          </div>

          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={comment}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Escreva seu comentário... Use @ para mencionar usuários"
              className="min-h-[100px] resize-none pr-12"
            />

            <Button
              onClick={handleSubmit}
              disabled={!comment.trim()}
              size="sm"
              className="absolute bottom-2 right-2 h-8 w-8 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Lista de usuários */}
        {showUserList && filteredUsers.length > 0 && (
          <Card
            ref={popoverRef}
            className="absolute z-50 w-80 shadow-lg border"
            style={{
              top: -100,
              left: 0,
              position: "absolute",
            }}
          >
            <ScrollArea className="max-h-72">
              {filteredUsers.map((user, index) => (
                <div
                  key={user.id}
                  onClick={() => selectUser(user)}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                    index === selectedUserIndex
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                    />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toLocaleLowerCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {user.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      @{user.username.toLocaleLowerCase()}
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </Card>
        )}
      </div>
    </div>
  );
}
