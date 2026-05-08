import { AppHeader } from "@/components/AppHeader";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_with_header")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <AppHeader />
      <Outlet />
    </>
  );
}
