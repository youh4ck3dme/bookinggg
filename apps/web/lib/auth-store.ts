import { create } from "zustand";

type User = {
  userId: string;
  email: string;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  rememberMe: boolean;
  setAuth: (payload: {
    accessToken: string;
    refreshToken: string;
    user: User;
    rememberMe: boolean;
  }) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  rememberMe: false,
  setAuth: ({ accessToken, refreshToken, user, rememberMe }) =>
    set({ accessToken, refreshToken, user, rememberMe }),
  clearAuth: () => set({ accessToken: null, refreshToken: null, user: null, rememberMe: false })
}));
