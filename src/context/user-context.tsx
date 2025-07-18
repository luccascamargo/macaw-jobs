'use client'
import { createContext, useContext, ReactNode } from "react";
import { useUser, User } from "@/hooks/useUser";

interface UserContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, loading, error } = useUser();
  return (
    <UserContext.Provider value={{ user, loading, error }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext deve ser usado dentro de UserProvider");
  return ctx;
} 