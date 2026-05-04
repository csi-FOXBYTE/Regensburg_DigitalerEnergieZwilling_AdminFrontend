import { useAuth } from "@/components/AuthContext";
import { RecordDetail } from "@/features/TriageView/RecordDetail";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/record/$id/")({
  component: RecordDetailPage,
});

function RecordDetailPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { id } = Route.useParams();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !isAuthenticated) return null;
  return <RecordDetail id={id} />;
}
