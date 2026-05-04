import { useAuth } from "@/components/AuthContext";
import { Dashboard } from "@/features/TriageView/Triage";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/maintenance/")({
  component: MaintenancePage,
});

function MaintenancePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !isAuthenticated) return null;
  return <Dashboard />;
}
