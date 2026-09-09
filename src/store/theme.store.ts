import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyThemeToDOM = (resolved: ResolvedTheme) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", resolved);
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

let mediaListenerAttached = false;

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark", // default to dark theme for a Minecraft vibe
      resolvedTheme: "dark",

      setTheme: (theme: ThemeMode) => {
        const resolved = theme === "system" ? getSystemTheme() : theme;
        applyThemeToDOM(resolved);
        set({ theme, resolvedTheme: resolved });
      },

      toggleTheme: () => {
        const current = get().resolvedTheme;
        const next: ThemeMode = current === "dark" ? "light" : "dark";
        applyThemeToDOM(next);
        set({ theme: next, resolvedTheme: next });
      },

      initTheme: () => {
        const currentTheme = get().theme || "dark";
        const resolved = currentTheme === "system" ? getSystemTheme() : currentTheme;
        applyThemeToDOM(resolved);
        set({ resolvedTheme: resolved });

        if (typeof window !== "undefined" && !mediaListenerAttached) {
          mediaListenerAttached = true;
          const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
          const handleSystemChange = (e: MediaQueryListEvent) => {
            if (get().theme === "system") {
              const newResolved: ResolvedTheme = e.matches ? "dark" : "light";
              applyThemeToDOM(newResolved);
              set({ resolvedTheme: newResolved });
            }
          };

          if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", handleSystemChange);
          } else {
            mediaQuery.addListener(handleSystemChange);
          }
        }
      },
    }),
    {
      name: "theme-storage",
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

export default useThemeStore;
