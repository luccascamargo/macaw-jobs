import { useEffect, useState } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || "Erro ao buscar usuário");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setError(null);
      })
      .catch((err) => {
        setUser(null);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
} 