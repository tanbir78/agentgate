"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type AuthState = {
  authorization: string;
  csrfToken: string;
  csrfHeaderName: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  apiFetch: (path: string, init?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function encodeCredentials(username: string, password: string) {
  const bytes = new TextEncoder().encode(`${username}:${password}`);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return `Basic ${btoa(binary)}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(null);

  const logout = useCallback(() => {
    setAuth(null);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const authorization = encodeCredentials(username, password);

    const response = await fetch("/api/v1/csrf", {
      method: "GET",
      headers: {
        Authorization: authorization,
        Accept: "application/json",
      },
      credentials: "same-origin",
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error("Invalid administrator credentials.");
      }

      throw new Error(`Authentication failed. Server returned ${response.status}.`);
    }

    const data: { headerName: string; token: string } = await response.json();

    if (!data.headerName || !data.token) {
      throw new Error("The server did not return a valid CSRF token.");
    }

    setAuth({
      authorization,
      csrfToken: data.token,
      csrfHeaderName: data.headerName,
    });
  }, []);

  const apiFetch = useCallback(
    async (path: string, init: RequestInit = {}) => {
      if (!auth) {
        throw new Error("You must log in to access this resource.");
      }

      const method = (init.method ?? "GET").toUpperCase();
      const headers = new Headers(init.headers);

      headers.set("Authorization", auth.authorization);
      headers.set("Accept", "application/json");

      if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(method)) {
        headers.set(auth.csrfHeaderName, auth.csrfToken);
      }

      const response = await fetch(path, {
        ...init,
        method,
        headers,
        credentials: "same-origin",
        cache: "no-store",
      });

      if (response.status === 401) {
        setAuth(null);
        throw new Error("Your authentication has expired. Please log in again.");
      }

      return response;
    },
    [auth],
  );

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: auth !== null, login, logout, apiFetch }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
