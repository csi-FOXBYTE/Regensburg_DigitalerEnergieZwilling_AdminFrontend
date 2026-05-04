import { createBrowserRouter, Navigate } from "react-router";
import type { ReactNode } from "react";
import { Dashboard } from "./components/Dashboard";
import { RecordDetail } from "./components/RecordDetail";
import { LoginPage } from "./components/Login";
import { useAuth } from "./components/AuthContext";

function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return (!isAuthenticated) ? <Navigate to="/login" replace /> : <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/record/:id",
    element: (
      <PrivateRoute>
        <RecordDetail />
      </PrivateRoute>
    ),
  },
]);
