'use client'
import { useQuery } from '@tanstack/react-query';

export interface Board {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export function useBoards() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      const res = await fetch('/api/boards');
      if (!res.ok) throw new Error((await res.json()).error || 'Erro ao buscar boards');
      return res.json();
    }
  });

  return { boards: data || [], loading: isLoading, error: error?.message || null, refetch };
} 