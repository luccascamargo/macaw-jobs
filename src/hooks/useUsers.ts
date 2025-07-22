import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  name: string;
  email: string;
}

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users", {
        method: "GET",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao editar card");
      return data;
    },
  });
}
