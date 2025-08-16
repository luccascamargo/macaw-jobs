"use client";

import Link from "next/link";
import { useUserContext } from "@/context/user-context";
import { useLogout } from "@/hooks/useLogout";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Plus, Kanban, LogOut } from "lucide-react";

export function GlobalNavbar() {
  const { user, loading: userLoading } = useUserContext();
  const { logout, loading: logoutLoading } = useLogout();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = () => {
    logout();
  };

  if (userLoading) {
    return (
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Macaw Jobs
          </Link>
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold text-gray-900 hover:text-gray-700 transition"
        >
          Jobs
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            // Usuário logado
            <>
              <Link href="/my-cards">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Kanban className="h-4 w-4" />
                  Meus Cards
                </Button>
              </Link>

              <Link href="/">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Meus Boards
                </Button>
              </Link>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium">
                    {user.name}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {logoutLoading ? "Saindo..." : "Sair"}
                </Button>
              </div>
            </>
          ) : (
            // Usuário não logado
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Criar Conta</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
