import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEconomist: boolean;
  role: "player" | "economist" | "admin";
  isBanned: boolean;
  banReason: string | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  turnAdmin: (v: boolean) => void;
  setRoleInfo: (
    role: "player" | "economist" | "admin",
    isAdmin: boolean,
    isEconomist: boolean
  ) => void;
  setBanInfo: (isBanned: boolean, banReason: string | null) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isAdmin: false,
      isEconomist: false,
      role: "player",
      isBanned: false,
      banReason: null,
      login: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isAdmin: false,
          isEconomist: false,
          role: "player",
          isBanned: false,
          banReason: null,
        }),
      turnAdmin: (v: boolean) => set({ isAdmin: v }),
      setRoleInfo: (role, isAdmin, isEconomist) =>
        set({ role, isAdmin, isEconomist }),
      setBanInfo: (isBanned, banReason) => set({ isBanned, banReason }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        isEconomist: state.isEconomist,
        role: state.role,
        isBanned: state.isBanned,
        banReason: state.banReason,
      }),
    }
  )
);

export default useAuthStore;
