'use client'
import Link from "next/link";
import { useBoards } from "@/hooks/useBoards";
import { CreateBoardModal } from "@/components/create-board-modal";
import { useState } from "react";

export default function Home() {
  const { boards, loading, error } = useBoards();
  const [refresh, setRefresh] = useState(0);

  // Função para atualizar a lista de boards após criar
  function handleCreated() {
    setRefresh((r) => r + 1);
  }

  // Refetch boards quando refresh mudar
  // (Simples: pode ser melhorado com SWR ou React Query)
  // Aqui, só para forçar o hook a rodar de novo
  // (ou pode passar refresh como key para useBoards)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seus Boards</h1>
            <p className="text-gray-600 mt-2">
              Clique em um board para visualizar o kanban
            </p>
          </div>
          <CreateBoardModal onCreated={handleCreated} />
        </div>
        {loading && <div>Carregando...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {boards.map((board) => (
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

