import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import { useShallow } from 'zustand/react/shallow';


type GuestOnlyProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

export default function GuestOnly({
  children,
  redirectTo = "/profile",
}: GuestOnlyProps) {
  const { isAuthenticated } = useAuthStore(useShallow(state => ({ isAuthenticated: state.isAuthenticated })));

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
