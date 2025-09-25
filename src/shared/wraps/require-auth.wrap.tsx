import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import { useEffect } from "react";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { accessToken, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!accessToken) {
      logout();
    }
  }, [accessToken, logout]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
