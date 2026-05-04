import { useAuth } from "@/components/AuthContext";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const redirected = useRef(false);

  useEffect(() => {
    if (!isLoading && !redirected.current) {
      redirected.current = true;
      navigate({ to: isAuthenticated ? "/dashboard" : "/login" });
    }
  }, [isLoading, isAuthenticated, navigate]);
  return null;
}
