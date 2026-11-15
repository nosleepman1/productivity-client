import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthScreen } from "@/features/auth/components/AuthScreen";
import { useBootstrapAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/store/auth.store";
import { ProtectedRoutes } from "./ProtectedRoutes";

interface AppRoutesProps {
  dashboard: React.ReactNode;
}

const AuthGate: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);

  if (!isBootstrapping && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <AuthScreen />;
};

export const AppRoutes: React.FC<AppRoutesProps> = ({ dashboard }) => {
  useBootstrapAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthGate />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={dashboard} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
