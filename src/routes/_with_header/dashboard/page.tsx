import { useAuth } from "@/components/AuthContext";
import DashboardPage from "@/features/Dashboard/DashboardPage";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_with_header/dashboard/")({
  component: DashboardRoute,
});

function DashboardRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !isAuthenticated) return null;
  return <DashboardPage />;
}
