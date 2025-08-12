"use client";
import Link from "next/link";
import { useBoards, Board } from "@/hooks/useBoards";
import { CreateBoardModal } from "@/components/create-board-modal";
import { useUserContext } from "@/context/user-context";

export default function Home() {
  const { boards, loading, error } = useBoards();
  const { user, loading: userLoading } = useUserContext();

  // Se ainda está carregando o usuário, mostra loading
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  // Se não há usuário logado, mostra mensagem de login
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Bem-vindo ao Macaw Jobs
          </h1>
          <p className="text-gray-600 mb-6">
            Faça login para começar a usar seus boards
          </p>
          <Link
            href="/auth/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-4 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seus Boards</h1>
            <p className="text-gray-600 mt-2">
              Clique em um board para visualizar o kanban
            </p>
          </div>
          <CreateBoardModal />
        </div>
        {loading && <div>Carregando...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {boards.map((board: Board) => (
            <Link
              key={board.id}
              href={`/board/${board.id}`}
              className="block bg-white rounded shadow p-6 hover:bg-gray-100 transition"
            >
              <h2 className="text-xl font-semibold">{board.title}</h2>
              <p className="text-gray-500 text-sm mt-2">
                Criado em {new Date(board.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
