import React from "react";
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "../../../store/theme.store";
import "./ThemeToggle.scss";

interface ThemeToggleProps {
  variant?: "floating" | "sidebar" | "compact";
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "floating",
  className = "",
  showLabel = false,
}) => {
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className={`theme-toggle-btn theme-toggle-btn--${variant} theme-toggle-btn--${resolvedTheme} ${className}`}
      onClick={toggleTheme}
      title={isDark ? "Переключить на светлую тему" : "Переключить на темную тему"}
      aria-label="Переключить тему"
    >
      {showLabel && (
        <span className="theme-toggle-btn__label">
          {isDark ? "Темная тема" : "Светлая тема"}
        </span>
      )}
      <div className="theme-toggle-btn__icon">
        {isDark ? (
          <Moon size={variant === "sidebar" ? 18 : 20} />
        ) : (
          <Sun size={variant === "sidebar" ? 18 : 20} />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
