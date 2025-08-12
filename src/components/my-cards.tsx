"use client";

import { useMyCards } from "@/hooks/useMyCards";
import { Calendar, MessageSquare, User } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

export function MyCards() {
  const { data: cards, isLoading, error } = useMyCards();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Carregando seus cards...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-600">
          Erro ao carregar cards: {error.message}
        </div>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-2xl font-semibold text-gray-600 mb-2">
          Nenhum card encontrado
        </div>
        <div className="text-gray-500 mb-4">
          Você não tem cards atribuídos ainda.
        </div>
        <Link href="/">
          <Button>Ver todos os boards</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Meus Cards</h1>
        <div className="text-sm text-gray-500">
          {cards.length} card{cards.length !== 1 ? "s" : ""} atribuído
          {cards.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">
                  {card.title}
                </CardTitle>
                <Badge
                  className={
                    priorityColors[card.priority as keyof typeof priorityColors]
                  }
                >
                  {card.priority}
                </Badge>
              </div>
              <div className="text-sm text-gray-500">
                Board: {card.column.board.title}
              </div>
              <div className="text-sm text-gray-500">
                Coluna: {card.column.title}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {card.description && (
                <p className="text-sm text-gray-600 line-clamp-3">
                  {card.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(card.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>{card.comments.length}</span>
                </div>
              </div>

              {card.assignees.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <User className="h-4 w-4" />
                    <span>Atribuído a:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {card.assignees.map((assignee) => (
                      <div
                        key={assignee.id}
                        className="flex items-center space-x-2"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={assignee.avatar}
                            alt={assignee.name}
                          />
                          <AvatarFallback>
                            {assignee.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {assignee.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link href={`/board/${card.column.board.id}`}>
                <Button variant="outline" className="w-full">
                  Ver no Board
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
