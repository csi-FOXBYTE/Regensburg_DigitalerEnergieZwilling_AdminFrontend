import { useAuth } from "@/components/AuthContext";
import { ConfigOverview } from "@/features/SystemMaintenance/ConfigOverview";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/config/")({
  component: ConfigPage,
});

function ConfigPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !isAuthenticated) return null;
  return <ConfigOverview />;
}
