import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Role } from "../types";

interface AuthValue { role: Role; setRole: (role: Role) => void; displayName: string }
const AuthContext = createContext<AuthValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("archive_head");
  const value = useMemo(() => ({ role, setRole, displayName: "Demo User" }), [role]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}