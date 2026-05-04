import { useAuth } from "@/components/AuthContext";
import { AuditLogPage } from "@/features/AuditLog/AuditLogPage";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/audit/")({
  component: AuditPage,
});

function AuditPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !isAuthenticated) return null;
  return <AuditLogPage />;
}
