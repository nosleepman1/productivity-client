import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { LoadingPerson } from "@/components/ui/LoadingPerson";
import { useAuthStore } from "@/store/auth.store";

export const ProtectedRoutes: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);

  if (isBootstrapping) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background">
        <LoadingPerson label="Ouverture de votre espace..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};
