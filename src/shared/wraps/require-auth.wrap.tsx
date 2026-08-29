import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import { useEffect } from "react";
import useSWR from "swr";
import { profileService } from "../../modules/profile/services/profile.service";
import { PropagateLoader } from "react-spinners";
export function RequireAuth({
  children,
  allowBanned = false,
}: {
  children: React.ReactNode;
  allowBanned?: boolean;
}) {
  const { accessToken, isAuthenticated, logout, isBanned, setBanInfo } = useAuthStore();
  const location = useLocation();

  const { data: info, isLoading } = useSWR(
    isAuthenticated && accessToken ? "profile/me" : null,
    () => profileService.getInfoAboutMe(),
    {
      onSuccess: (data) => {
        setBanInfo(data.isBanned || false, data.banReason || null);
      },
      onError: (err) => {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          logout();
        }
      }
    }
  );

  useEffect(() => {
    if (!accessToken) {
      logout();
    }
  }, [accessToken, logout]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const currentlyBanned = isBanned || info?.isBanned;

  if (currentlyBanned && !allowBanned) {
    return <Navigate to="/profile" replace />;
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: '#1f2937' }}>
        <PropagateLoader color="#60a5fa" />
      </div>
    );
  }

  return <>{children}</>;
}
