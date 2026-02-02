"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAuth as useAuthHook } from "@/lib/hooks/useAuth";

interface AuthContextType {
  user: ReturnType<typeof useAuthHook>['user'];
  loading: ReturnType<typeof useAuthHook>['loading'];
  login: ReturnType<typeof useAuthHook>['login'];
  signup: ReturnType<typeof useAuthHook>['signup'];
  logout: ReturnType<typeof useAuthHook>['logout'];
  isAuthenticated: ReturnType<typeof useAuthHook>['isAuthenticated'];
  verifyEmail: ReturnType<typeof useAuthHook>['verifyEmail'];
  resendVerification: ReturnType<typeof useAuthHook>['resendVerification'];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthHook();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
