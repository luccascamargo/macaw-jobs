import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  avatar?: string;
}

const fetchUser = async (): Promise<User | null> => {
  const res = await fetch("/api/auth/me");
  if (!res.ok) {
    return null;
  }
  return res.json();
};

export function useUser() {
  const {
    data: user,
    isLoading: loading,
    error,
  } = useQuery<User | null, Error>({
    queryKey: ["user"],
    queryFn: fetchUser,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return { user: user || null, loading, error: error?.message || null };
}
