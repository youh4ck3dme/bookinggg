"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useAuthStore } from "../lib/auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "dev-api-key";

type LoginPayload = {
  email: string;
  password: string;
  rememberMe: boolean;
  twoFaCode?: string;
};

type OAuthProvider = "google" | "github" | "apple";

type AuthContextValue = {
  isAuthenticated: boolean;
  loading: boolean;
  user: { userId: string; email: string } | null;
  login: (payload: LoginPayload) => Promise<void>;
  loginWithOAuth: (provider: OAuthProvider) => Promise<void>;
  logout: () => Promise<void>;
  setupBiometric: () => Promise<{ fallback: string }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, refreshToken, user, setAuth, clearAuth, rememberMe } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);

  const saveTokens = useCallback(
    (payload: {
      accessToken: string;
      refreshToken: string;
      user: { userId: string; email: string };
      rememberMe: boolean;
    }) => {
      setAuth(payload);
      const storage = payload.rememberMe ? localStorage : sessionStorage;
      storage.setItem("ubm_auth", JSON.stringify(payload));
    },
    [setAuth]
  );

  const runRefresh = useCallback(async () => {
    const currentRefresh = useAuthStore.getState().refreshToken;
    if (!currentRefresh) return;

    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": API_KEY,
        "x-csrf-token": "refresh-token"
      },
      body: JSON.stringify({ refreshToken: currentRefresh })
    });

    if (!response.ok) {
      clearAuth();
      localStorage.removeItem("ubm_auth");
      sessionStorage.removeItem("ubm_auth");
      return;
    }

    const tokens = await response.json();
    const verify = await fetch(`${API_BASE}/auth/verify`, {
      headers: {
        authorization: `Bearer ${tokens.accessToken}`,
        "x-api-key": API_KEY
      }
    });

    const verified = await verify.json();
    saveTokens({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: verified.user,
      rememberMe
    });
  }, [clearAuth, rememberMe, saveTokens]);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => {
      void runRefresh();
      scheduleRefresh();
    }, 12 * 60 * 1000);
  }, [runRefresh]);

  useEffect(() => {
    const sessionData = sessionStorage.getItem("ubm_auth");
    const localData = localStorage.getItem("ubm_auth");
    const source = sessionData ?? localData;

    if (source) {
      try {
        const parsed = JSON.parse(source);
        setAuth(parsed);
      } catch {
        localStorage.removeItem("ubm_auth");
        sessionStorage.removeItem("ubm_auth");
      }
    }

    setLoading(false);
  }, [setAuth]);

  useEffect(() => {
    if (accessToken && refreshToken) {
      scheduleRefresh();
    }
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [accessToken, refreshToken, scheduleRefresh]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": API_KEY,
          "x-csrf-token": "login-token"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Login failed");
      const tokens = await response.json();
      const verify = await fetch(`${API_BASE}/auth/verify`, {
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
          "x-api-key": API_KEY
        }
      });
      const verified = await verify.json();

      saveTokens({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: verified.user,
        rememberMe: payload.rememberMe
      });
    },
    [saveTokens]
  );

  const loginWithOAuth = useCallback(
    async (provider: OAuthProvider) => {
      const response = await fetch(`${API_BASE}/auth/oauth`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": API_KEY,
          "x-csrf-token": "oauth-token"
        },
        body: JSON.stringify({
          provider,
          providerAccountId: `mock-${provider}-id`,
          email: `${provider}.demo@booking.local`
        })
      });
      if (!response.ok) throw new Error("OAuth failed");
      const tokens = await response.json();
      const verify = await fetch(`${API_BASE}/auth/verify`, {
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
          "x-api-key": API_KEY
        }
      });
      const verified = await verify.json();
      saveTokens({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: verified.user,
        rememberMe: true
      });
    },
    [saveTokens]
  );

  const logout = useCallback(async () => {
    if (accessToken) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
          "x-api-key": API_KEY,
          "x-csrf-token": "logout-token"
        },
        body: JSON.stringify({ refreshToken })
      });
    }

    clearAuth();
    localStorage.removeItem("ubm_auth");
    sessionStorage.removeItem("ubm_auth");
  }, [accessToken, clearAuth, refreshToken]);

  const setupBiometric = useCallback(async () => {
    if (!user) throw new Error("Not authenticated");

    let credentialId = "fallback-credential";
    if (window.PublicKeyCredential && navigator.credentials) {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      try {
        const credential = (await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: { name: "UBM Booking" },
            user: {
              id: new TextEncoder().encode(user.userId),
              name: user.email,
              displayName: user.email
            },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }],
            timeout: 60000,
            authenticatorSelection: {
              userVerification: "preferred"
            }
          }
        })) as PublicKeyCredential | null;

        if (credential) {
          credentialId = credential.id;
        }
      } catch {
        credentialId = "fallback-password";
      }
    }

    const response = await fetch(`${API_BASE}/auth/biometric`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": API_KEY,
        "x-csrf-token": "biometric-token"
      },
      body: JSON.stringify({ userId: user.userId, credentialId })
    });

    if (!response.ok) throw new Error("Biometric setup failed");
    return response.json();
  }, [user]);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(accessToken && user),
      loading,
      user,
      login,
      loginWithOAuth,
      logout,
      setupBiometric
    }),
    [accessToken, loading, login, loginWithOAuth, logout, setupBiometric, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
