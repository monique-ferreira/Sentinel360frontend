import { createContext, useContext } from "react";

export const TOKEN_KEY = "s360_token";

export interface AuthCtx {
  token: string;
  logout: () => void;
}

export const AuthContext = createContext<AuthCtx>({ token: "", logout: () => {} });
export const useAuth = () => useContext(AuthContext);

export function authHeaders(token: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
